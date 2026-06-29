/**
 * fix-tags.ts
 * يمسح الـ tags القديمة (strings) من كل المنتجات في Sanity
 * ويستبدلها بـ productTag objects صحيحة من الـ seed
 *
 * تشغيل: npx tsx scripts/fix-tags.ts
 */

import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { createClient } from "@sanity/client";
import { SEED_PRODUCTS } from "../lib/products/seed";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "",
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

async function fixTags() {
  console.log("🔧 تنظيف الـ tags القديمة...\n");

  for (const product of SEED_PRODUCTS) {
    const docId = `product-${product.slug}`;

    // بناء tags بالصيغة الجديدة
    const newTags = (product.tags ?? []).map((tag, i) => ({
      _type: "productTag",
      _key:  `tag-${i}`,
      label: tag.label,
      color: tag.color,
    }));

    try {
      await client
        .patch(docId)
        .set({ tags: newTags, badge: product.badge, badgeColor: product.badgeColor })
        .commit();

      console.log(`✅ تم تحديث tags: ${product.title}`);
    } catch (err) {
      console.error(`❌ فشل: ${product.title}`, err);
    }
  }

  console.log("\n✅ انتهى — ارجع لـ Studio وحدّث الصفحة.");
}

fixTags().catch(console.error);
