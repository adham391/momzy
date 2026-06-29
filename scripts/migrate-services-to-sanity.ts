/**
 * migrate-services-to-sanity.ts
 * ──────────────────────────────
 * يقرأ SEED_SERVICES ويرفعها إلى Sanity كـ service documents.
 *
 * - الصور لن تُرفع تلقائياً — هبة ترفعها يدوياً من Studio
 * - idempotent: يستخدم _id ثابت = "service-{slug}"
 *
 * تشغيل:
 *   npx tsx scripts/migrate-services-to-sanity.ts
 *
 * متطلبات في .env.local:
 *   NEXT_PUBLIC_SANITY_PROJECT_ID=xxxx
 *   NEXT_PUBLIC_SANITY_DATASET=production
 *   SANITY_API_TOKEN=xxxx  (يحتاج صلاحية write)
 */

import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { createClient } from "@sanity/client";
import { SEED_SERVICES } from "../lib/services/seed";
import type { Service } from "../lib/services/types";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "",
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

function toSanityDocument(service: Service) {
  return {
    _type: "service",
    _id:   `service-${service.slug}`,

    title:            service.title,
    slug:             { _type: "slug", current: service.slug },
    type:             service.type,
    category:         service.category,
    duration:         service.duration,
    location:         service.location,
    ageRange:         service.ageRange,
    maxParticipants:  service.maxParticipants,
    shortDescription: service.shortDescription,
    longDescription:  service.longDescription,
    topics:           service.topics,
    benefits:         service.benefits,
    color:            service.color,
    price:            service.price,
    order:            service.order,

    // الصور لن تُرفع تلقائياً — ترفعها هبة من Studio
    // coverImage: undefined,
    // icon: undefined,
  };
}

async function migrate() {
  console.log("🚀 بدء migration الخدمات من seed إلى Sanity...\n");

  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    console.error("❌ NEXT_PUBLIC_SANITY_PROJECT_ID غير مضبوط في .env.local");
    process.exit(1);
  }
  if (!process.env.SANITY_API_TOKEN) {
    console.error("❌ SANITY_API_TOKEN غير مضبوط في .env.local");
    process.exit(1);
  }

  const results = { success: 0, failed: 0 };

  for (const service of SEED_SERVICES) {
    try {
      console.log(`⏳ جاري رفع: "${service.title}" (${service.slug})...`);
      const doc = toSanityDocument(service);
      await client.createOrReplace(doc);
      console.log(`  ✅ تم: ${service.title}`);
      results.success++;
    } catch (err) {
      console.error(`  ❌ فشل: ${service.title}`, err);
      results.failed++;
    }
  }

  console.log("\n─────────────────────────────────────────");
  console.log(`✅ نجح:   ${results.success} خدمة`);
  if (results.failed > 0) console.log(`❌ فشل:   ${results.failed} خدمة`);
  console.log("─────────────────────────────────────────");
  console.log("\n📌 تذكير: الصور لم تُرفع تلقائياً.");
  console.log("   افتحي Studio وارفعي صور الغلاف لكل خدمة.\n");
}

migrate().catch((err) => {
  console.error("❌ خطأ غير متوقع:", err);
  process.exit(1);
});
