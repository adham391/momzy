/**
 * migrate-seed-to-sanity.ts
 * ─────────────────────────
 * يقرأ SEED_PRODUCTS ويرفعها إلى Sanity كـ product documents.
 *
 * ملاحظات:
 * - الصور في seed هي placeholder paths — لن تُرفع (لا توجد ملفات فعلية)
 *   → كل منتج سيُنشأ في Sanity بدون صور، ترفعها هبة يدوياً من Studio
 * - المنتج الحقيقي الوحيد: صندوق مشوار أم
 * - idempotent: يستخدم _id ثابت = "product-{slug}" فلن يُكرَّر عند إعادة التشغيل
 *
 * تشغيل:
 *   npm run migrate:seed
 *
 * متطلبات في .env.local:
 *   NEXT_PUBLIC_SANITY_PROJECT_ID=xxxx
 *   NEXT_PUBLIC_SANITY_DATASET=production
 *   SANITY_API_TOKEN=xxxx  (يحتاج صلاحية write)
 */

import * as dotenv from "dotenv";
import * as path from "path";

// تحميل .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { createClient } from "@sanity/client";
import { SEED_PRODUCTS } from "../lib/products/seed";
import type { Product } from "../lib/products/types";

// ─── عميل Sanity للكتابة ──────────────────────────────────────────────────────

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "",
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

// ─── تحويل Product → Sanity document ─────────────────────────────────────────

function toSanityDocument(product: Product) {
  return {
    _type: "product",
    _id:   `product-${product.slug}`,  // ثابت — idempotent

    // حقول أساسية
    title:          product.title,
    slug:           { _type: "slug", current: product.slug },
    description:    product.description,
    price:          product.price,
    compareAtPrice: product.compareAtPrice,
    category:       product.category,
    badge:          product.badge,
    badgeColor:     product.badgeColor,
    // tags كـ productTag objects مع _key لكل واحدة
    tags: (product.tags ?? []).map((tag, i) => ({
      _type: "productTag",
      _key:  `tag-${i}`,
      label: tag.label,
      color: tag.color,
    })),
    inStock:        product.inStock,
    stockQuantity:  product.stockQuantity,
    weight:         product.weight,
    longDescription: product.longDescription,

    // ملاحظة: الصور لن تُرفع تلقائياً (placeholder paths فقط)
    // هبة ترفعها يدوياً من Studio
    // mainImage: null,
    // gallery: [],

    // معلومات الشحن
    shippingInfo: product.shippingInfo
      ? {
          _type:         "productShippingInfo",
          estimatedDays: product.shippingInfo.estimatedDays,
          freeShipping:  product.shippingInfo.freeShipping ?? false,
          notes:         product.shippingInfo.notes,
        }
      : undefined,

    // المواصفات التقنية
    specifications: product.specifications?.map((spec, i) => ({
      _type: "productSpecification",
      _key:  `spec-${i}`,
      key:   spec.key,
      value: spec.value,
    })),

    // محتويات الصندوق
    contents: product.contents?.map((item, i) => ({
      _type:       "productContent",
      _key:        `content-${i}`,
      name:        item.name,
      description: item.description,
      // icon/image: لن تُرفع تلقائياً
    })),

    // فئات الهدية
    giftTargets: product.giftTargets?.map((target, i) => ({
      _type: "productGiftTarget",
      _key:  `gift-${i}`,
      label: target.label,
      text:  target.text,
    })),

    // الشهادات
    testimonials: product.testimonials?.map((t, i) => ({
      _type:    "productTestimonial",
      _key:     `testimonial-${i}`,
      name:     t.name,
      location: t.location,
      text:     t.text,
      rating:   t.rating,
      // image: لن تُرفع تلقائياً
    })),

    // الأسئلة الشائعة
    faqs: product.faqs?.map((faq, i) => ({
      _type:    "productFAQ",
      _key:     `faq-${i}`,
      question: faq.question,
      answer:   faq.answer,
    })),

    // القصة
    story: product.story
      ? {
          _type:      "productStory",
          title:      product.story.title,
          paragraphs: product.story.paragraphs,
          // image: لن تُرفع تلقائياً
        }
      : undefined,
  };
}

// ─── التنفيذ الرئيسي ──────────────────────────────────────────────────────────

async function migrate() {
  console.log("🚀 بدء migration من seed إلى Sanity...\n");

  // التحقق من الإعدادات
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    console.error("❌ NEXT_PUBLIC_SANITY_PROJECT_ID غير مضبوط في .env.local");
    process.exit(1);
  }
  if (!process.env.SANITY_API_TOKEN) {
    console.error("❌ SANITY_API_TOKEN غير مضبوط في .env.local");
    process.exit(1);
  }

  const results = { success: 0, skipped: 0, failed: 0 };

  for (const product of SEED_PRODUCTS) {
    try {
      console.log(`⏳ جاري رفع: "${product.title}" (${product.slug})...`);

      const doc = toSanityDocument(product);

      // createOrReplace — idempotent (يُحدِّث إذا وُجد بنفس الـ _id)
      await client.createOrReplace(doc);

      console.log(`  ✅ تم: ${product.title}`);
      results.success++;
    } catch (err) {
      console.error(`  ❌ فشل: ${product.title}`, err);
      results.failed++;
    }
  }

  console.log("\n─────────────────────────────────────────");
  console.log(`✅ نجح:   ${results.success} منتج`);
  if (results.skipped > 0) console.log(`⏭️  تخطّى: ${results.skipped} منتج`);
  if (results.failed > 0)  console.log(`❌ فشل:   ${results.failed} منتج`);
  console.log("─────────────────────────────────────────");
  console.log("\n📌 تذكير: الصور لم تُرفع تلقائياً.");
  console.log("   افتحي Studio وارفعي الصور يدوياً لكل منتج.\n");
}

migrate().catch((err) => {
  console.error("❌ خطأ غير متوقع:", err);
  process.exit(1);
});
