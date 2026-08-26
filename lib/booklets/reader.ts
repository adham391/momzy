import { createAdminClient } from "@/lib/supabase/admin";

/**
 * طبقة قراءة الكتيبات — صور الصفحات في bucket خاص (booklets) على Supabase Storage.
 * لا روابط عامة: الصفحات تُبثّ حصرًا عبر /api/booklet/[token]/[page] بعد التحقق من توكن الشراء.
 * الرفع يتم بسكربت scripts/booklet-upload.ts (PDF → WebP + meta.json).
 *
 * ⚠️ مفتاح التخزين هو slug المنتج وقت الشراء (مجمّد في digital_downloads.product_slug) —
 *    لا تغيّري slug كتيب مُباع في Sanity وإلا انقطعت توكنات المشتريات السابقة عن مجلّده.
 */
const BUCKET = "booklets";

/** بيانات كتيب مرفوع — من meta.json بجانب الصفحات */
export interface BookletMeta {
  pages: number;
  width: number;
  height: number;
}

/**
 * يجلب meta.json للكتيب — null إن لم يُرفَع بعد أو كانت بياناته ناقصة
 * (الأبعاد شرط: القارئ يشتق نسبة الصفحة منها — أبعاد صفرية = NaN في الواجهة).
 */
export async function getBookletMeta(slug: string): Promise<BookletMeta | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage.from(BUCKET).download(`${slug}/meta.json`);
  if (error || !data) return null;
  try {
    const meta = JSON.parse(await data.text()) as BookletMeta;
    if (!meta.pages || meta.pages < 1) return null;
    if (!meta.width || meta.width < 1 || !meta.height || meta.height < 1) return null;
    return meta;
  } catch {
    return null;
  }
}

/**
 * يجلب صورة صفحة كاستجابة قابلة للبثّ المباشر (لا تُحمَّل كاملة في ذاكرة السيرفر).
 * يعيد null إن لم توجد الصفحة — وهذا هو فحص الحدود (لا حاجة لـ meta في مسار الصور).
 */
export async function fetchBookletPageResponse(slug: string, page: number): Promise<Response | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;

  const objectPath = `${BUCKET}/${slug}/page-${String(page).padStart(3, "0")}.webp`;
  const res = await fetch(`${url}/storage/v1/object/${objectPath}`, {
    headers: { Authorization: `Bearer ${serviceKey}` },
    cache: "no-store",
  });
  if (!res.ok || !res.body) return null;
  return res;
}
