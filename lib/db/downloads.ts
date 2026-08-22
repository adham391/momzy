import { createAdminClient } from "@/lib/supabase/admin";

/** إعدادات التسليم الرقمي */
const EXPIRY_DAYS = 7;
const MAX_DOWNLOADS = 5;
const DAY_MS = 24 * 60 * 60 * 1000;

/** مدخل إنشاء توكن لعنصر رقمي */
export interface DigitalDownloadInput {
  productSlug: string;
  productName: string;
  /** المستلِم — المشترية أو مستلِمة الهدية */
  customerEmail: string;
  isGift: boolean;
}

/** صف توكن التحميل */
export interface DigitalDownloadRow {
  id: string;
  order_id: string;
  product_slug: string;
  product_name: string;
  customer_email: string;
  token: string;
  expires_at: string;
  download_count: number;
  max_downloads: number;
  is_gift: boolean;
}

/** توكن URL-safe */
function generateToken(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

/**
 * ينشئ توكن تحميل لكل عنصر رقمي في الطلب (فور إنشاء الطلب).
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
    customer_email: it.customerEmail,
    token: generateToken(),
    expires_at: expiresAt,
    max_downloads: MAX_DOWNLOADS,
    is_gift: it.isGift,
  }));

  const { data, error } = await supabase.from("digital_downloads").insert(rows).select("*");
  if (error) throw new Error(error.message);
  return (data ?? []) as DigitalDownloadRow[];
}

/** توكنات التحميل لطلب معيّن — لإرفاق الروابط في الإيميل/صفحة التأكيد */
export async function getDownloadsByOrder(orderId: string): Promise<DigitalDownloadRow[]> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("digital_downloads").select("*").eq("order_id", orderId);
  return (data ?? []) as DigitalDownloadRow[];
}

export type DownloadInvalidReason = "not_found" | "expired" | "limit";

/** حالة التوكن دون زيادة العدّاد — لصفحة /download/[token] */
export async function getDownloadStatus(
  token: string
): Promise<{ row: DigitalDownloadRow; valid: boolean; reason?: DownloadInvalidReason } | null> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("digital_downloads").select("*").eq("token", token).maybeSingle();
  if (!data) return null;
  const row = data as DigitalDownloadRow;
  if (new Date(row.expires_at).getTime() <= Date.now()) return { row, valid: false, reason: "expired" };
  if (row.download_count >= row.max_downloads) return { row, valid: false, reason: "limit" };
  return { row, valid: true };
}

export type RedeemResult =
  | { ok: true; row: DigitalDownloadRow }
  | { ok: false; reason: DownloadInvalidReason };

/**
 * يتحقّق من التوكن ويزيد العدّاد (عند التحميل الفعلي).
 * fetch-validate-increment — كافٍ لكتيب PDF (تزامن نادر).
 */
export async function redeemDownload(token: string): Promise<RedeemResult> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("digital_downloads").select("*").eq("token", token).maybeSingle();
  if (!data) return { ok: false, reason: "not_found" };
  const row = data as DigitalDownloadRow;
  if (new Date(row.expires_at).getTime() <= Date.now()) return { ok: false, reason: "expired" };
  if (row.download_count >= row.max_downloads) return { ok: false, reason: "limit" };

  await supabase
    .from("digital_downloads")
    .update({ download_count: row.download_count + 1 })
    .eq("id", row.id);

  return { ok: true, row: { ...row, download_count: row.download_count + 1 } };
}
