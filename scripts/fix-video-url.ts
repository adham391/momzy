/**
 * fix-video-url.ts
 * يمسح حقل videoUrl القديم (file type) من كل المنتجات
 * تشغيل: npx tsx scripts/fix-video-url.ts
 */

import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "",
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

async function fixVideoUrl() {
  console.log("🔧 إصلاح حقل videoUrl...\n");

  // جلب كل المنتجات
  const products = await client.fetch<{ _id: string; title: string }[]>(
    `*[_type == "product"]{ _id, title }`
  );

  for (const product of products) {
    try {
      await client.patch(product._id).unset(["videoUrl"]).commit();
      console.log(`✅ تم مسح videoUrl: ${product.title}`);
    } catch (err) {
      console.error(`❌ فشل: ${product.title}`, err);
    }
  }

  console.log("\n✅ انتهى — الآن افتح Studio وأضف رابط الفيديو من جديد.");
}

fixVideoUrl().catch(console.error);
