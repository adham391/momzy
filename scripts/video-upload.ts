/**
 * video-upload.ts — يضغط فيديو منتج ويرفعه إلى Sanity ويربطه بحقل videoUrl.
 *
 * تشغيل:
 *   npx tsx scripts/video-upload.ts "<مسار الفيديو>" <slug المنتج>
 * مثال:
 *   npx tsx scripts/video-upload.ts "C:/Users/adham/Downloads/IMG_3380.MP4" mommy-journey-box
 *
 * لماذا الضغط؟ فيديوهات الجوال تُصوَّر 4K (~170MB لدقيقة) — يستحيل تشغيلها على
 * بيانات الجوال. نحوّلها إلى 1080 عموديًا مع faststart فتبدأ فورًا أثناء التحميل.
 */
import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { createClient } from "@sanity/client";
import { execFileSync } from "node:child_process";
import ffmpegPath from "ffmpeg-static";
import * as fs from "fs";
import * as os from "os";

/** عرض الإخراج بالبكسل — يوازن الوضوح مع الحجم على شاشات الجوال */
const OUTPUT_WIDTH = 1080;
/** جودة H.264 (كلما زاد الرقم صغُر الحجم وقلّت الجودة) */
const CRF = 27;
const AUDIO_BITRATE = "128k";

const [, , videoPath, slug] = process.argv;
if (!videoPath || !slug) {
  console.error('الاستخدام: npx tsx scripts/video-upload.ts "<مسار الفيديو>" <slug>');
  process.exit(1);
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

async function main() {
  if (!ffmpegPath) throw new Error("ffmpeg غير متاح — تأكّدي من تثبيت ffmpeg-static");

  const out = path.join(os.tmpdir(), `momzy-video-${Date.now()}.mp4`);
  console.log(`ضغط: ${videoPath}`);
  execFileSync(ffmpegPath, [
    "-hide_banner", "-loglevel", "error", "-y",
    "-i", videoPath,
    "-vf", `scale=${OUTPUT_WIDTH}:-2`,
    "-c:v", "libx264", "-crf", String(CRF), "-preset", "medium", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", AUDIO_BITRATE,
    "-movflags", "+faststart",   // يبدأ التشغيل قبل اكتمال التحميل
    out,
  ], { stdio: "inherit" });

  const buf = fs.readFileSync(out);
  const srcMb = fs.statSync(videoPath).size / 1048576;
  console.log(`${srcMb.toFixed(1)} MB → ${(buf.length / 1048576).toFixed(1)} MB`);

  const asset = await client.assets.upload("file", buf, {
    filename: `${slug}-video.mp4`,
    contentType: "video/mp4",
  });

  // videoUrl حقل نصّي — المكوّنات تتعرّف على روابط mp4 المباشرة وتعرضها كـ <video>
  const productId = await client.fetch<string | null>(
    `*[_type == "product" && slug.current == $slug][0]._id`,
    { slug }
  );
  if (!productId) throw new Error(`لا يوجد منتج بالـ slug: ${slug}`);
  await client.patch(productId).set({ videoUrl: asset.url }).commit();

  fs.unlinkSync(out);
  console.log(`✔ رُبط بالمنتج ${slug}: ${asset.url}`);
}

main().catch((e) => {
  console.error("خطأ:", e);
  process.exit(1);
});
