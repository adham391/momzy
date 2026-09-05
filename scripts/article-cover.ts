/**
 * يرفع صورة غلاف لمقال ويربطها به.
 *
 * التشغيل:
 *   npx tsx scripts/article-cover.ts <slug> "<مسار الصورة>" ["وصف الصورة"]
 *
 * مثال:
 *   npx tsx scripts/article-cover.ts swaddling-safe-use "C:/Users/adham/Pictures/swaddle.jpg" "رضيع نائم مُقمّط على ظهره"
 *
 * idempotent: Sanity يوحّد الأصول بالبصمة (sha1)، فرفع الصورة نفسها مرتين
 * لا يُنشئ نسختين. ولا يُلمس شيء في المقال غير حقل الغلاف.
 *
 * الوصف (alt) ليس ترفًا: قارئات الشاشة تقرؤه، وجوجل يقرؤه، وهو ما يظهر
 * حين تتعذّر الصورة. يُخزَّن بلغة واحدة — الصورة نفسها في اللغات الثلاث.
 */
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

/** فوقه ننصح بالتصغير — Sanity يحوّل عند العرض، لكن الأصل الضخم يُبطئ الرفع ويشغل مساحة */
const WARN_SIZE_MB = 6;

const ALLOWED = [".jpg", ".jpeg", ".png", ".webp"];

async function main() {
  const [slug, imagePath, alt] = process.argv.slice(2);

  if (!slug || !imagePath) {
    console.error("الاستعمال: npx tsx scripts/article-cover.ts <slug> \"<مسار الصورة>\" [\"وصف الصورة\"]");
    process.exit(1);
  }

  const file = path.resolve(imagePath);
  if (!fs.existsSync(file)) {
    console.error(`❌ لا ملف على المسار: ${file}`);
    process.exit(1);
  }

  const ext = path.extname(file).toLowerCase();
  if (!ALLOWED.includes(ext)) {
    console.error(`❌ صيغة غير مدعومة (${ext}) — المدعوم: ${ALLOWED.join(", ")}`);
    process.exit(1);
  }

  const sizeMb = fs.statSync(file).size / (1024 * 1024);
  if (sizeMb > WARN_SIZE_MB) {
    console.warn(`⚠️  الصورة ${sizeMb.toFixed(1)}MB — كبيرة. الرفع سينجح، لكن التصغير قبله أفضل.`);
  }

  const { sanityWriteClient } = await import("../lib/sanity/client");

  const article = await sanityWriteClient.fetch<{ _id: string; title?: string } | null>(
    `*[_type == "article" && slug.current == $slug][0]{ _id, "title": title[language=="ar"][0].value }`,
    { slug }
  );
  if (!article) {
    const all = await sanityWriteClient.fetch<string[]>(
      `*[_type == "article"].slug.current`
    );
    console.error(`❌ لا مقال بالـ slug «${slug}» — المتاح: ${all.join(", ")}`);
    process.exit(1);
  }

  console.log(`المقال: ${article.title ?? article._id}`);
  console.log(`الصورة: ${path.basename(file)} (${sizeMb.toFixed(2)}MB)`);

  const asset = await sanityWriteClient.assets.upload("image", fs.createReadStream(file), {
    filename: path.basename(file),
  });

  await sanityWriteClient
    .patch(article._id)
    .set({
      coverImage: {
        _type: "image",
        asset: { _type: "reference", _ref: asset._id },
        ...(alt ? { alt } : {}),
      },
    })
    .commit();

  const { width, height } = asset.metadata?.dimensions ?? {};
  console.log(`✅ رُبطت — ${width}×${height}px`);
  if (alt) console.log(`   الوصف: ${alt}`);
  else console.warn("⚠️  بلا وصف (alt) — أضِفه كمعامل ثالث، أو من /studio.");
  console.log(`   /articles/${slug}`);
}

main().catch((e) => {
  console.error("❌", e.message);
  process.exit(1);
});
