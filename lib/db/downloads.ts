import { createAdminClient } from "@/lib/supabase/admin";
import { canFulfill } from "@/lib/orders/fulfillment";

/**
 * التسليم الرقمي — نموذج «قراءة على الموقع» (flipbook):
 * التوكن يفتح قارئ الكتيب في /read/[token] — لا تحميل PDF إطلاقًا.
 * الصلاحية **دائمة** والقراءة غير محدودة العدد.
 *
 * `expires_at = null` تعني «لا تنتهي» — نفس اصطلاح الكوبونات. العمود
 * يبقى موجودًا كي يمكن ضبط تاريخ لصفٍّ بعينه لو لزم استثناء يومًا ما،
 * ولذلك يبقى فحص الانتهاء قائمًا بدل حذفه.
 */

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
  /** null = لا تنتهي */
  expires_at: string | null;
  is_gift: boolean;
}

/** توكن URL-safe */
function generateToken(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

/** حال طلب التوكن كما يُضمَّن معه — لقرار الوصول */
export interface DownloadOrderAccess {
  payment_status: string;
  total_amount: number;
  order_status: string;
}

/**
 * يُضمَّن مع كل قراءة للتوكنات: التوكن يُنشأ مع الطلب قبل الدفع، فوجوده وحده لا يعني
 * شراءً — القارئ والمكتبة لا يفتحان إلا كتيب طلب مدفوع (أو مجاني) غير ملغى.
 */
export const DOWNLOAD_ORDER_ACCESS = "orders!inner(payment_status, total_amount, order_status)";

/** الطلب المضمَّن كما يعيده Supabase — كائن لعلاقة «لكل توكن طلب واحد»، وأنواع العميل تفترضه مصفوفة */
export type EmbeddedDownloadOrder = DownloadOrderAccess | DownloadOrderAccess[] | null | undefined;

/** هل يُفتح كتيب هذا الطلب؟ — القاعدة نفسها للتأكيد والتسليم */
export function downloadOrderAllowsReading(embedded: EmbeddedDownloadOrder): boolean {
  const order = Array.isArray(embedded) ? embedded[0] : embedded;
  if (!order) return false;
  return canFulfill(order.payment_status, Number(order.total_amount), order.order_status === "cancelled");
}

/** هل انتهت صلاحية التوكن؟ — نقطة القرار الوحيدة للصلاحية */
function isExpired(expiresAt: string | null): boolean {
  if (expiresAt === null) return false;
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

  const rows = items.map((it) => ({
    order_id: orderId,
    product_slug: it.productSlug,
    product_name: it.productName,
    // lowercase دائمًا — المكتبة تطابق البريد بـ «=» لا بـ ILIKE
    customer_email: it.customerEmail.trim().toLowerCase(),
    token: generateToken(),
    expires_at: null,
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
  const { data } = await supabase
    .from("digital_downloads")
    .select(`*, ${DOWNLOAD_ORDER_ACCESS}`)
    .eq("token", token)
    .maybeSingle();
  if (!data) return null;
  const { orders, ...row } = data as DigitalDownloadRow & { orders: EmbeddedDownloadOrder };
  // توكن طلبٍ لم يُدفع = كأنه غير موجود
  if (!downloadOrderAllowsReading(orders)) return null;
  return { row, valid: !isExpired(row.expires_at) };
}

/**
 * تحقّق خفيف لواجهة بثّ الصفحات — عمودان فقط، يعيد slug الكتيب أو null.
 */
export async function getTokenAccess(token: string): Promise<{ productSlug: string } | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("digital_downloads")
    .select(`product_slug, expires_at, ${DOWNLOAD_ORDER_ACCESS}`)
    .eq("token", token)
    .maybeSingle();
  if (!data) return null;
  const row = data as { product_slug: string; expires_at: string | null; orders: EmbeddedDownloadOrder };
  if (isExpired(row.expires_at) || !downloadOrderAllowsReading(row.orders)) return null;
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
