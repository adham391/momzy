import { defineType, defineField } from "sanity";

/**
 * محتوى صفحة "عن هبة" — Singleton
 * كل الحقول اختيارية — الفارغ يأخذ النص الافتراضي في الكود.
 */
export const aboutPage = defineType({
  name: "aboutPage",
  title: "صفحة عن هبة",
  type: "document",
  preview: { prepare: () => ({ title: "صفحة عن هبة" }) },
  groups: [
    { name: "hero", title: "الترويسة" },
    { name: "story", title: "القصة" },
    { name: "philosophy", title: "الفلسفة" },
    { name: "cta", title: "عناوين + دعوة" },
  ],
  fields: [
    // ═══ الترويسة ═══
    defineField({ name: "image", title: "صورة هبة", type: "image", group: "hero", options: { hotspot: true } }),
    defineField({ name: "heroLabel", title: "العنوان الصغير", type: "string", group: "hero", placeholder: "تعرّفي على المؤسِّسة" }),
    defineField({ name: "name", title: "الاسم", type: "string", group: "hero", placeholder: "هبة حسن" }),
    defineField({ name: "tagline", title: "الوصف تحت الاسم", type: "text", rows: 2, group: "hero" }),
    defineField({ name: "credentials", title: "الشهادات", type: "array", of: [{ type: "string" }], group: "hero", description: "مثال: ممرضة معتمدة" }),
    defineField({ name: "signature", title: "التوقيع", type: "string", group: "hero", placeholder: "هبة حسن" }),
    defineField({
      name: "stats",
      title: "الأرقام (3)",
      type: "array",
      group: "hero",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "number", title: "الرقم", type: "string", placeholder: "آلاف" }),
          defineField({ name: "label", title: "الوصف", type: "string", placeholder: "أم رافقتهنّ" }),
        ],
        preview: { select: { title: "number", subtitle: "label" } },
      }],
    }),

    // ═══ القصة ═══
    defineField({ name: "storyLabel", title: "العنوان الصغير", type: "string", group: "story", placeholder: "قصتها" }),
    defineField({ name: "storyQuote", title: "الاقتباس الكبير", type: "text", rows: 2, group: "story" }),
    defineField({ name: "storyParagraphs", title: "فقرات القصة", type: "array", of: [{ type: "text", rows: 3 }], group: "story" }),

    // ═══ الفلسفة ═══
    defineField({ name: "philosophyLabel", title: "العنوان الصغير", type: "string", group: "philosophy", placeholder: "فلسفتها" }),
    defineField({ name: "philosophyHeading", title: "العنوان", type: "string", group: "philosophy", placeholder: "كيف ترافقك هبة" }),
    defineField({
      name: "philosophyValues",
      title: "القيم (4)",
      type: "array",
      group: "philosophy",
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

    // ═══ عناوين + دعوة ═══
    defineField({ name: "servicesLabel", title: "خدماتها — عنوان صغير", type: "string", group: "cta", placeholder: "خدماتها" }),
    defineField({ name: "servicesHeading", title: "خدماتها — العنوان", type: "string", group: "cta", placeholder: "ماذا تقدّم هبة؟" }),
    defineField({ name: "ctaLabel", title: "الدعوة — عنوان صغير", type: "string", group: "cta", placeholder: "جاهزة للبدء؟" }),
    defineField({ name: "ctaHeading", title: "الدعوة — العنوان", type: "string", group: "cta" }),
    defineField({ name: "ctaText", title: "الدعوة — النص", type: "text", rows: 2, group: "cta" }),
  ],
});
