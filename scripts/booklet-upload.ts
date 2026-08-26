/**
 * booklet-upload.ts — يحوّل كتيب PDF إلى صور WebP ويرفعها إلى Supabase Storage
 * في bucket خاص (booklets) — لتُعرض في قارئ flipbook على الموقع بلا رابط تحميل.
 *
 * تشغيل:
 *   npx tsx scripts/booklet-upload.ts "<مسار PDF>" <slug المنتج>
 * مثال:
 *   npx tsx scripts/booklet-upload.ts "C:/Users/adham/Downloads/booklet.pdf" tummy-time-booklet
 *
 * idempotent — إعادة التشغيل تستبدل الصفحات (upsert) وتحدّث meta.json.
 * ⚠️ الـ slug هنا هو مفتاح التخزين المجمّد في توكنات الشراء — طابقيه مع slug المنتج في Sanity.
 */
import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { pdf } from "pdf-to-img";
import sharp from "sharp";
import { createAdminClient } from "../lib/supabase/admin";

const BUCKET = "booklets";
/** عرض صفحة القراءة — كافٍ للوضوح على الشاشات الكبيرة دون تضخيم الحجم */
const PAGE_WIDTH = 1200;
const WEBP_QUALITY = 82;
/**
 * مقياس تصيير الـ PDF — يجب أن يُنتج عرضًا ≥ PAGE_WIDTH قبل التصغير
 * (صفحة A4/A5 نمطية ×3 ≈ 1250-1800px) وإلا خرجت الصفحات أنعم من المطلوب.
 */
const RENDER_SCALE = 3;

const [, , pdfPath, slug] = process.argv;
if (!pdfPath || !slug) {
  console.error('الاستخدام: npx tsx scripts/booklet-upload.ts "<مسار PDF>" <slug>');
  process.exit(1);
}

const supabase = createAdminClient();

/**
 * يضمن وجود bucket «booklets» — يُنشأ **خاصًا** (public: false):
 * الخصوصية هي أساس الحماية كلها؛ bucket عام = روابط صفحات مكشوفة بلا توكن.
 */
async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.some((b) => b.name === BUCKET)) {
    const { error } = await supabase.storage.createBucket(BUCKET, { public: false });
    if (error) throw new Error(`فشل إنشاء الـ bucket: ${error.message}`);
    console.log(`✔ أُنشئ bucket خاص: ${BUCKET}`);
  }
}

/** يحوّل صفحات الـ PDF إلى WebP ويرفعها + يكتب meta.json (عدد الصفحات وأبعاد أول صفحة) */
async function main() {
  await ensureBucket();

  console.log(`تحويل: ${pdfPath}`);
  const doc = await pdf(pdfPath, { scale: RENDER_SCALE });
  console.log(`عدد الصفحات: ${doc.length}`);

  let i = 0;
  // أبعاد أول صفحة (الغلاف) — مرجع نسبة العرض للقارئ؛ الصور تُعرض contain فلا يُقصّ المختلف
  let width = 0;
  let height = 0;
  for await (const png of doc) {
    i++;
    const { data: webp, info } = await sharp(png)
      .resize({ width: PAGE_WIDTH, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer({ resolveWithObject: true });
    if (i === 1) {
      width = info.width;
      height = info.height;
    }

    const name = `${slug}/page-${String(i).padStart(3, "0")}.webp`;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(name, webp, { contentType: "image/webp", upsert: true });
    if (error) throw new Error(`فشل رفع ${name}: ${error.message}`);
    console.log(`  ✅ ${name} (${(webp.length / 1024).toFixed(0)} KB)`);
  }

  if (!width || !height) throw new Error("تعذّر قياس أبعاد الصفحات — لم يُكتب meta.json");

  // meta.json — يقرأه السيرفر لمعرفة عدد الصفحات والأبعاد
  const metaJson = JSON.stringify({ pages: i, width, height, updatedAt: new Date().toISOString() });
  const { error: metaErr } = await supabase.storage
    .from(BUCKET)
    .upload(`${slug}/meta.json`, Buffer.from(metaJson), { contentType: "application/json", upsert: true });
  if (metaErr) throw new Error(`فشل رفع meta.json: ${metaErr.message}`);

  console.log(`\n✔ اكتمل: ${i} صفحة (${width}×${height}) → ${BUCKET}/${slug}/`);
}

main().catch((e) => {
  console.error("خطأ:", e);
  process.exit(1);
});
