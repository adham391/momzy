import { createAdminClient } from "@/lib/supabase/admin";
import { sha256, generateSecureToken } from "@/lib/library/password";
import { SESSION_MAX_AGE_SECONDS } from "@/lib/library/constants";
import type { DigitalDownloadRow } from "@/lib/db/downloads";

/**
 * طبقة بيانات المكتبة — حسابات، توكنات إنشاء/استعادة، جلسات، ومحتويات الرفّ.
 * كل العمليات عبر service-role (RLS يقفل anon) — لا تُستورد في كود المتصفح.
 */

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

/** صلاحية رابط إنشاء كلمة المرور (الدعوة مع الشراء) */
const SETUP_TOKEN_DAYS = 7;
/** صلاحية رابط الاستعادة (نسيت كلمة المرور) */
const RESET_TOKEN_HOURS = 2;

/** الجلسة: 400 يوم (سقف الكوكيز في المتصفحات) — تنزلق مع كل زيارة */
const SESSION_DAYS = SESSION_MAX_AGE_SECONDS / (24 * 60 * 60);
/** لا نحدّث صف الجلسة إلا إذا مضت ساعة على آخر ظهور — يخفف الكتابة */
const SESSION_TOUCH_MS = HOUR_MS;

/** قفل الدخول: بعد كم محاولة فاشلة، ولكم دقيقة */
const LOCKOUT_ATTEMPTS = 8;
const LOCKOUT_MINUTES = 15;

/** توكن القراءة يُجدَّد من المكتبة إذا بقي أقل من 30 يومًا — لسنة جديدة */
const RENEW_BELOW_DAYS = 30;
const RENEW_TO_DAYS = 365;

/** صف حساب المكتبة */
export interface LibraryAccount {
  id: string;
  email: string;
  password_hash: string | null;
  failed_attempts: number;
  locked_until: string | null;
}

/** عنصر على رفّ المكتبة */
export interface LibraryItem {
  id: string;
  productSlug: string;
  productName: string;
  token: string;
  expiresAt: string;
  isGift: boolean;
  purchasedAt: string;
}

/** توحيد البريد — lowercase دائمًا قبل أي تخزين أو مقارنة */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/* ── الحسابات ──────────────────────────────────────────────── */

export async function getAccountByEmail(email: string): Promise<LibraryAccount | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("library_accounts")
    .select("id, email, password_hash, failed_attempts, locked_until")
    .eq("email", normalizeEmail(email))
    .maybeSingle();
  return (data as LibraryAccount | null) ?? null;
}

/** ينشئ الحساب إن لم يوجد — يعيد الصف في الحالتين */
export async function ensureAccount(email: string): Promise<LibraryAccount> {
  const existing = await getAccountByEmail(email);
  if (existing) return existing;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("library_accounts")
    .upsert({ email: normalizeEmail(email) }, { onConflict: "email" })
    .select("id, email, password_hash, failed_attempts, locked_until")
    .single();
  if (error) throw new Error(error.message);
  return data as LibraryAccount;
}

/**
 * يثبّت كلمة المرور ويصفّر عدّاد الفشل.
 * تغيير الكلمة يبطل كل الجلسات الأخرى وكل روابط الإنشاء/الاستعادة المعلّقة.
 */
export async function setAccountPassword(
  accountId: string,
  passwordHash: string,
  keepSessionTokenHash?: string
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("library_accounts")
    .update({
      password_hash: passwordHash,
      failed_attempts: 0,
      locked_until: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", accountId);
  if (error) throw new Error(error.message);

  // إبطال ما عدا الجلسة الحالية (إن وُجدت) + كل التوكنات المعلّقة
  let q = supabase.from("library_sessions").delete().eq("account_id", accountId);
  if (keepSessionTokenHash) q = q.neq("token_hash", keepSessionTokenHash);
  await q;
  await supabase
    .from("library_tokens")
    .update({ used_at: new Date().toISOString() })
    .eq("account_id", accountId)
    .is("used_at", null);
}

/* ── قفل المحاولات الفاشلة ─────────────────────────────────── */

export function isAccountLocked(account: LibraryAccount): boolean {
  return !!account.locked_until && new Date(account.locked_until).getTime() > Date.now();
}

/**
 * يسجّل محاولة فاشلة — وعند بلوغ الحد يقفل الحساب مؤقتًا.
 * الزيادة داخل دالة Postgres (لا قراءة ثم كتابة من التطبيق): محاولات متوازية
 * كانت ستدهس بعضها فيزحف العدّاد ولا يبلغ الحد أبدًا.
 */
export async function recordLoginFailure(account: LibraryAccount): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.rpc("library_record_login_failure", {
    p_account_id: account.id,
    p_max_attempts: LOCKOUT_ATTEMPTS,
    p_lock_minutes: LOCKOUT_MINUTES,
  });
  if (error) console.error("[library] فشل تسجيل محاولة الدخول:", error.message);
}

export async function resetLoginFailures(accountId: string): Promise<void> {
  const supabase = createAdminClient();
  await supabase
    .from("library_accounts")
    .update({ failed_attempts: 0, locked_until: null })
    .eq("id", accountId);
}

/* ── توكنات الإنشاء/الاستعادة ──────────────────────────────── */

export type LibraryTokenPurpose = "setup" | "reset";

/** أقل فاصل بين رابطين لنفس الحساب — يمنع قصف بريدها برسائل متتالية */
const TOKEN_THROTTLE_MINUTES = 2;

/** هل أُصدر رابط لهذا الحساب قبل قليل؟ */
export async function wasTokenIssuedRecently(accountId: string): Promise<boolean> {
  const supabase = createAdminClient();
  const since = new Date(Date.now() - TOKEN_THROTTLE_MINUTES * 60_000).toISOString();
  const { count } = await supabase
    .from("library_tokens")
    .select("id", { count: "exact", head: true })
    .eq("account_id", accountId)
    .gt("created_at", since);
  return (count ?? 0) > 0;
}

/** ينشئ توكن إنشاء/استعادة ويعيد الخام (يُرسل بالإيميل — لا يُخزَّن) */
export async function createLibraryToken(
  accountId: string,
  purpose: LibraryTokenPurpose
): Promise<string> {
  const supabase = createAdminClient();
  const raw = generateSecureToken();
  const expiresAt =
    purpose === "setup"
      ? new Date(Date.now() + SETUP_TOKEN_DAYS * DAY_MS)
      : new Date(Date.now() + RESET_TOKEN_HOURS * HOUR_MS);

  const { error } = await supabase.from("library_tokens").insert({
    account_id: accountId,
    token_hash: sha256(raw),
    purpose,
    expires_at: expiresAt.toISOString(),
  });
  if (error) throw new Error(error.message);
  return raw;
}

/** يتحقق من التوكن دون استهلاكه — لعرض نموذج كلمة المرور */
export async function peekLibraryToken(rawToken: string): Promise<{ accountId: string } | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("library_tokens")
    .select("account_id, expires_at, used_at")
    .eq("token_hash", sha256(rawToken))
    .maybeSingle();
  if (!data) return null;
  const row = data as { account_id: string; expires_at: string; used_at: string | null };
  if (row.used_at || new Date(row.expires_at).getTime() <= Date.now()) return null;
  return { accountId: row.account_id };
}

/** يستهلك التوكن (لمرة واحدة) — يعيد الحساب أو null إن كان منتهيًا/مستعمَلًا */
export async function consumeLibraryToken(rawToken: string): Promise<{ accountId: string } | null> {
  const supabase = createAdminClient();
  // تعليم used_at بشرط أنه null — ذرّي: استعمالان متزامنان لا ينجح منهما إلا واحد
  const { data } = await supabase
    .from("library_tokens")
    .update({ used_at: new Date().toISOString() })
    .eq("token_hash", sha256(rawToken))
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString())
    .select("account_id")
    .maybeSingle();
  if (!data) return null;
  return { accountId: (data as { account_id: string }).account_id };
}

/* ── الجلسات ───────────────────────────────────────────────── */

/** ينشئ جلسة ويعيد التوكن الخام (يوضع في كوكي httpOnly) */
export async function createSession(accountId: string): Promise<string> {
  const supabase = createAdminClient();
  const raw = generateSecureToken();
  const { error } = await supabase.from("library_sessions").insert({
    account_id: accountId,
    token_hash: sha256(raw),
    expires_at: new Date(Date.now() + SESSION_DAYS * DAY_MS).toISOString(),
  });
  if (error) throw new Error(error.message);
  return raw;
}

/**
 * يتحقق من الجلسة ويعيد حسابها — مع تمديد منزلق (مرة كل ساعة كحد أقصى)
 * فتبقى الجلسة حيّة ما دامت العميلة تزور المكتبة.
 */
export async function getSessionAccount(rawToken: string): Promise<LibraryAccount | null> {
  const supabase = createAdminClient();
  const tokenHash = sha256(rawToken);
  const { data } = await supabase
    .from("library_sessions")
    .select("id, expires_at, last_seen_at, library_accounts(id, email, password_hash, failed_attempts, locked_until)")
    .eq("token_hash", tokenHash)
    .maybeSingle();
  if (!data) return null;

  const row = data as unknown as {
    id: string;
    expires_at: string;
    last_seen_at: string;
    library_accounts: LibraryAccount | null;
  };
  if (!row.library_accounts) return null;
  if (new Date(row.expires_at).getTime() <= Date.now()) {
    await supabase.from("library_sessions").delete().eq("id", row.id);
    return null;
  }

  // تمديد منزلق — كتابة واحدة كل ساعة على الأكثر
  if (Date.now() - new Date(row.last_seen_at).getTime() > SESSION_TOUCH_MS) {
    await supabase
      .from("library_sessions")
      .update({
        last_seen_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + SESSION_DAYS * DAY_MS).toISOString(),
      })
      .eq("id", row.id);
  }
  return row.library_accounts;
}

/** ينهي جلسة واحدة (تسجيل الخروج) */
export async function destroySession(rawToken: string): Promise<void> {
  const supabase = createAdminClient();
  await supabase.from("library_sessions").delete().eq("token_hash", sha256(rawToken));
}

/* ── رفّ المكتبة ───────────────────────────────────────────── */

/**
 * هل لهذا البريد أي مشتريات رقمية؟ — لتفعيل الدعوة الذاتية من «نسيت كلمة المرور».
 * المطابقة بالمساواة على بريد موحَّد lowercase (لا ILIKE): حرفا _ و% في بريد
 * المهاجم كانا سيتحوّلان إلى بدائل تكشف مشتريات عميلات أخريات.
 */
export async function hasDigitalPurchases(email: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { count } = await supabase
    .from("digital_downloads")
    .select("id", { count: "exact", head: true })
    .eq("customer_email", normalizeEmail(email));
  return (count ?? 0) > 0;
}

/**
 * محتويات مكتبة العميلة — كل مشترياتها الرقمية ببريدها.
 * التوكنات التي شارفت على الانتهاء (أو انتهت) تُجدَّد لسنة كاملة تلقائيًا:
 * المكتبة هي مصدر الوصول الدائم، ورابط الإيميل القديم مجرد اختصار.
 */
export async function getLibraryItems(email: string): Promise<LibraryItem[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("digital_downloads")
    .select("*")
    .eq("customer_email", normalizeEmail(email))
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as (DigitalDownloadRow & { created_at: string })[];

  // تجديد ما شارف على الانتهاء — دفعة واحدة
  const renewThreshold = Date.now() + RENEW_BELOW_DAYS * DAY_MS;
  const newExpiry = new Date(Date.now() + RENEW_TO_DAYS * DAY_MS).toISOString();
  const toRenew = rows.filter((r) => new Date(r.expires_at).getTime() < renewThreshold);
  if (toRenew.length > 0) {
    await supabase
      .from("digital_downloads")
      .update({ expires_at: newExpiry })
      .in("id", toRenew.map((r) => r.id));
    for (const r of toRenew) r.expires_at = newExpiry;
  }

  return rows.map((r) => ({
    id: r.id,
    productSlug: r.product_slug,
    productName: r.product_name,
    token: r.token,
    expiresAt: r.expires_at,
    isGift: r.is_gift,
    purchasedAt: r.created_at,
  }));
}
