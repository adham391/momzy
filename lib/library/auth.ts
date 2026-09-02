import { cookies } from "next/headers";
import {
  getAccountByEmail,
  getSessionAccount,
  isAccountLocked,
  recordLoginFailure,
  resetLoginFailures,
  createSession,
  destroySession,
  type LibraryAccount,
} from "@/lib/db/library";
import { LIBRARY_SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/lib/library/constants";
import { verifyPassword, DUMMY_HASH } from "@/lib/library/password";

/**
 * مصادقة المكتبة — قراءة الجلسة من الكوكي وعمليات الدخول/الخروج.
 * الكوكي httpOnly فلا يصل إليه JavaScript؛ والقيمة توكن خام بصمته في DB.
 */

export { LIBRARY_SESSION_COOKIE };

/** خيارات الكوكي — نقطة القرار الوحيدة */
export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

/** حساب الجلسة الحالية من الكوكي — null إن لا جلسة أو انتهت */
export async function getCurrentAccount(): Promise<LibraryAccount | null> {
  const store = await cookies();
  const raw = store.get(LIBRARY_SESSION_COOKIE)?.value;
  if (!raw) return null;
  return getSessionAccount(raw);
}

/** نتيجة محاولة الدخول — سبب واحد للفشل عمدًا (انظر أدناه) */
export type LoginResult = { ok: true; sessionToken: string } | { ok: false };

/**
 * دخول بالبريد وكلمة المرور.
 *
 * لا يكشف وجود الحساب من عدمه بأي قناة:
 *  - **المحتوى**: كل إخفاق يعيد نفس الرد — حتى القفل المؤقّت، وإلا لَكان
 *    ظهورُه إقرارًا بأن هذا البريد حساب فعليّ.
 *  - **الزمن**: مسارا «بريد مجهول» و«حساب مقفول» يمرّان بتجزئة وهمية
 *    فتتساوى كلفتهما مع مسار «كلمة خاطئة».
 */
export async function loginWithPassword(email: string, password: string): Promise<LoginResult> {
  const account = await getAccountByEmail(email);

  if (!account || !account.password_hash) {
    await verifyPassword(password, DUMMY_HASH);
    return { ok: false };
  }

  if (isAccountLocked(account)) {
    await verifyPassword(password, DUMMY_HASH);
    return { ok: false };
  }

  const valid = await verifyPassword(password, account.password_hash);
  if (!valid) {
    await recordLoginFailure(account);
    return { ok: false };
  }

  await resetLoginFailures(account.id);
  const sessionToken = await createSession(account.id);
  return { ok: true, sessionToken };
}

/** خروج — يحذف الجلسة من DB (مسح الكوكي مسؤولية الـ route) */
export async function logoutCurrentSession(): Promise<void> {
  const store = await cookies();
  const raw = store.get(LIBRARY_SESSION_COOKIE)?.value;
  if (raw) await destroySession(raw);
}
