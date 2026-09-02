import { createAdminClient } from "@/lib/supabase/admin";

/**
 * التسليم الرقمي — نموذج «قراءة على الموقع» (flipbook):
 * التوكن يفتح قارئ الكتيب في /read/[token] — لا تحميل PDF إطلاقًا.
 * الصلاحية سنة كاملة من الشراء، والقراءة غير محدودة العدد.
 */
const EXPIRY_DAYS = 365;
const DAY_MS = 24 * 60 * 60 * 1000;

/** مدخل إنشاء توكن لعنصر رقمي */
export interface DigitalDownloadInput {
  productSlug: string;
  productName: string;
  /** المستلِم — المشترية أو مستلِمة الهدية */
  customerEmail: string;
  isGift: boolean;
}

/** صف توكن القراءة (جدول digital_downloads) */
export interface DigitalDownloadRow {
  id: string;
  order_id: string;
  product_slug: string;
  product_name: string;
  customer_email: string;
  token: string;
  expires_at: string;
  is_gift: boolean;
}

/** توكن URL-safe */
function generateToken(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

/** هل انتهت صلاحية التوكن؟ — نقطة القرار الوحيدة للصلاحية */
function isExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() <= Date.now();
}

/**
 * ينشئ توكن قراءة لكل عنصر رقمي في الطلب (فور إنشاء الطلب).
 * يُرجِع الصفوف المُنشأة لإرسال روابطها بالإيميل.
 */
export async function createDownloadTokens(
  orderId: string,
  items: DigitalDownloadInput[]
): Promise<DigitalDownloadRow[]> {
  if (!items.length) return [];
  const supabase = createAdminClient();
  const expiresAt = new Date(Date.now() + EXPIRY_DAYS * DAY_MS).toISOString();

  const rows = items.map((it) => ({
    order_id: orderId,
    product_slug: it.productSlug,
    product_name: it.productName,
    // lowercase دائمًا — المكتبة تطابق البريد بـ «=» لا بـ ILIKE
    customer_email: it.customerEmail.trim().toLowerCase(),
    token: generateToken(),
    expires_at: expiresAt,
    is_gift: it.isGift,
  }));

  const { data, error } = await supabase.from("digital_downloads").insert(rows).select("*");
  if (error) throw new Error(error.message);
  return (data ?? []) as DigitalDownloadRow[];
}

/** توكنات القراءة لطلب معيّن — لإرفاق الروابط في الإيميل/صفحة التأكيد */
export async function getDownloadsByOrder(orderId: string): Promise<DigitalDownloadRow[]> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("digital_downloads").select("*").eq("order_id", orderId);
  return (data ?? []) as DigitalDownloadRow[];
}

/**
 * حالة التوكن — لصفحة القارئ /read/[token].
 * null = غير موجود · valid=false = منتهي الصلاحية.
 */
export async function getDownloadStatus(
  token: string
): Promise<{ row: DigitalDownloadRow; valid: boolean } | null> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("digital_downloads").select("*").eq("token", token).maybeSingle();
  if (!data) return null;
  const row = data as DigitalDownloadRow;
  return { row, valid: !isExpired(row.expires_at) };
}

/**
 * تحقّق خفيف لواجهة بثّ الصفحات — عمودان فقط، يعيد slug الكتيب أو null.
 */
export async function getTokenAccess(token: string): Promise<{ productSlug: string } | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("digital_downloads")
    .select("product_slug, expires_at")
    .eq("token", token)
    .maybeSingle();
  if (!data) return null;
  const row = data as { product_slug: string; expires_at: string };
  if (isExpired(row.expires_at)) return null;
  return { productSlug: row.product_slug };
}

/**
 * عدّاد فتحات القراءة — يعيد استخدام عمود download_count كعداد مشاهدات
 * (لم يعد هناك تحميل). للرصد فقط: يكشف مشاركة الرابط على نطاق واسع.
 * best-effort — لا يعطّل القراءة عند الفشل.
 */
export async function recordReadView(rowId: string): Promise<void> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("digital_downloads")
      .select("download_count")
      .eq("id", rowId)
      .maybeSingle();
    const count = (data as { download_count: number } | null)?.download_count ?? 0;
    await supabase.from("digital_downloads").update({ download_count: count + 1 }).eq("id", rowId);
  } catch {
    // رصد فقط — تجاهُل أي فشل
  }
}
