import { defineType, defineField } from "sanity";

/**
 * محتوى الصفحة الرئيسية — Singleton (نسخة واحدة)
 * يتحكم في نصوص: الهيرو، قسم "ليش Momzy"، قسم هبة، وعناوين الأقسام.
 * كل الحقول اختيارية — إذا فُرِّغ حقل يُستخدم النص الافتراضي في الكود.
 */
export const homePage = defineType({
  name: "homePage",
  title: "الصفحة الرئيسية",
  type: "document",
  preview: { prepare: () => ({ title: "الصفحة الرئيسية" }) },
  groups: [
    { name: "hero", title: "الهيرو" },
    { name: "why", title: "ليش Momzy" },
    { name: "heba", title: "قسم هبة" },
    { name: "headings", title: "عناوين الأقسام" },
  ],
  fields: [
    // ═══════════ الهيرو ═══════════
    defineField({
      name: "heroImage",
      title: "صورة هبة في الهيرو",
      type: "image",
      group: "hero",
      options: { hotspot: true },
      description: "الصورة الرئيسية في أعلى الصفحة",
    }),
    defineField({ name: "heroTagline", title: "العنوان — السطر الأول", type: "string", group: "hero", placeholder: "نرافقك من الحمل" }),
    defineField({ name: "heroTaglineAccent", title: "العنوان — السطر الثاني (مميّز)", type: "string", group: "hero", placeholder: "حتى السنوات الأولى" }),
    defineField({ name: "heroIntro", title: "جملة التعريف", type: "text", rows: 2, group: "hero", placeholder: "تأسست Momzy على يد هبة حسن — ممرضة معتمدة ومرافقة ولادة، رافقت +1000 أم برحلتهنّ." }),
    defineField({ name: "heroPoints", title: "النقاط (3)", type: "array", of: [{ type: "string" }], group: "hero", description: "نقاط مختصرة تظهر مع علامة ✓" }),

    // ═══════════ ليش Momzy ═══════════
    defineField({ name: "whyLabel", title: "العنوان الصغير", type: "string", group: "why", placeholder: "قصتنا" }),
    defineField({ name: "whyHeading", title: "العنوان الرئيسي", type: "string", group: "why", placeholder: "ليش Momzy؟" }),
    defineField({ name: "whyIntro", title: "المقدمة", type: "text", rows: 3, group: "why" }),
    defineField({
      name: "whyValues",
      title: "القيم (4)",
      type: "array",
      group: "why",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "icon", title: "الأيقونة", type: "image" }),
          defineField({ name: "title", title: "العنوان", type: "string" }),
          defineField({ name: "desc", title: "الوصف", type: "text", rows: 2 }),
        ],
        preview: { select: { title: "title", media: "icon" } },
      }],
    }),
    defineField({ name: "whyQuote", title: "الاقتباس الختامي", type: "text", rows: 2, group: "why" }),

    // ═══════════ قسم هبة ═══════════
    defineField({ name: "hebaLabel", title: "العنوان الصغير", type: "string", group: "heba", placeholder: "مؤسِّسة Momzy" }),
    defineField({ name: "hebaHeadingLine1", title: "العنوان — سطر 1", type: "string", group: "heba", placeholder: "القلب النابض" }),
    defineField({ name: "hebaHeadingLine2", title: "العنوان — سطر 2", type: "string", group: "heba", placeholder: "وراء Momzy" }),
    defineField({ name: "hebaBio", title: "السيرة (فقرات)", type: "array", of: [{ type: "text", rows: 3 }], group: "heba" }),
    defineField({ name: "hebaSignature", title: "التوقيع", type: "string", group: "heba", placeholder: "هبة حسن" }),
    defineField({
      name: "hebaStat",
      title: "الإحصائية العائمة",
      type: "object",
      group: "heba",
      fields: [
        defineField({ name: "number", title: "الرقم", type: "string", placeholder: "+1000" }),
        defineField({ name: "label", title: "الوصف", type: "string", placeholder: "أمّ رافقتهنّ هبة" }),
      ],
    }),

    // ═══════════ عناوين الأقسام ═══════════
    defineField({ name: "bestSellersLabel", title: "الأكثر مبيعاً — عنوان صغير", type: "string", group: "headings", placeholder: "الأكثر طلبًا" }),
    defineField({ name: "bestSellersTitle", title: "الأكثر مبيعاً — العنوان", type: "string", group: "headings", placeholder: "الأكثر مبيعاً" }),
    defineField({ name: "articlesLabel", title: "المقالات — عنوان صغير", type: "string", group: "headings", placeholder: "أحدث المقالات" }),
    defineField({ name: "articlesTitle", title: "المقالات — العنوان", type: "string", group: "headings" }),
    defineField({ name: "reviewsLabel", title: "التقييمات — عنوان صغير", type: "string", group: "headings" }),
    defineField({ name: "reviewsTitle", title: "التقييمات — العنوان", type: "string", group: "headings", placeholder: "ماذا قالت الأمهات؟" }),
  ],
});
