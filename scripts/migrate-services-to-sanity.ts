/**
 * migrate-services-to-sanity.ts
 * ──────────────────────────────
 * يقرأ SEED_SERVICES ويرفعها إلى Sanity كـ service documents.
 *
 * - الصور لن تُرفع تلقائياً — هبة ترفعها يدوياً من Studio
 * - idempotent: يستخدم _id ثابت = "service-{slug}"
 *
 * ⚠️ Sanity هو مصدر الحقيقة بعد أول تشغيل — فالخدمة الموجودة **لا تُلمس**
 *    كي لا تُمحى تعديلات هبة وصورها. الاستبدال الكامل يحتاج --force صراحةً
 *    (وحتى معه تُحفظ الصور المرفوعة).
 *
 * تشغيل:
 *   npx tsx scripts/migrate-services-to-sanity.ts            # آمن — يضيف الناقص فقط
 *   npx tsx scripts/migrate-services-to-sanity.ts --force    # يستبدل النص من seed
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
    ageMinMonths:     service.ageMinMonths,
    ageMaxMonths:     service.ageMaxMonths,
    maxParticipants:  service.maxParticipants,
    shortDescription: service.shortDescription,
    longDescription:  service.longDescription,
    topics:           service.topics,
    benefits:         service.benefits,
    // عناصر مصفوفة Sanity تحتاج _key + _type (وإلا لا تُحرَّر في Studio)
    faqs:             service.faqs?.map((f, i) => ({
      _type: "productFAQ",
      _key: `faq${i}`,
      question: f.question,
      answer: f.answer,
    })),
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

  const force = process.argv.includes("--force");
  const results = { created: 0, replaced: 0, skipped: 0, failed: 0 };

  for (const service of SEED_SERVICES) {
    const doc = toSanityDocument(service);
    try {
      // هل الخدمة موجودة في Sanity؟ (مع صورها المرفوعة)
      const existing = await client.fetch<{ coverImage?: unknown; icon?: unknown } | null>(
        `*[_id == $id][0]{coverImage, icon}`,
        { id: doc._id }
      );

      if (existing && !force) {
        console.log(`⏭️  موجودة — تُركت كما هي: ${service.title}`);
        results.skipped++;
        continue;
      }

      if (existing) {
        // استبدال صريح — لكن نحتفظ بالصور المرفوعة من Studio
        await client.createOrReplace({
          ...doc,
          ...(existing.coverImage ? { coverImage: existing.coverImage } : {}),
          ...(existing.icon ? { icon: existing.icon } : {}),
        });
        console.log(`  ♻️  استُبدلت (الصور محفوظة): ${service.title}`);
        results.replaced++;
      } else {
        await client.create(doc);
        console.log(`  ✅ أُضيفت: ${service.title}`);
        results.created++;
      }
    } catch (err) {
      console.error(`  ❌ فشل: ${service.title}`, err);
      results.failed++;
    }
  }

  console.log("\n─────────────────────────────────────────");
  if (results.created)  console.log(`✅ أُضيفت:   ${results.created} خدمة`);
  if (results.replaced) console.log(`♻️  استُبدلت: ${results.replaced} خدمة`);
  if (results.skipped)  console.log(`⏭️  تُركت:    ${results.skipped} خدمة (موجودة — استخدمي --force للاستبدال)`);
  if (results.failed)   console.log(`❌ فشل:      ${results.failed} خدمة`);
  console.log("─────────────────────────────────────────");
  console.log("\n📌 تذكير: الصور لم تُرفع تلقائياً.");
  console.log("   افتحي Studio وارفعي صور الغلاف لكل خدمة.\n");
}

migrate().catch((err) => {
  console.error("❌ خطأ غير متوقع:", err);
  process.exit(1);
});
