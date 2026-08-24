import { defineType, defineField } from "sanity";
import { arValue } from "./i18n";

/**
 * محتوى صفحة "عن هبة" — Singleton
 * كل الحقول اختيارية — الفارغ يأخذ النص الافتراضي المُترجم في الكود.
 * الحقول النصّية مُدوّلة (ar/he/en) — تُملأ لكل لغة على حدة.
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
    defineField({ name: "heroLabel", title: "العنوان الصغير", type: "internationalizedArrayString", group: "hero", description: "مثال: تعرّفي على المؤسِّسة" }),
    defineField({ name: "name", title: "الاسم", type: "internationalizedArrayString", group: "hero", description: "مثال: هبة حسن" }),
    defineField({ name: "tagline", title: "الوصف تحت الاسم", type: "internationalizedArrayText", group: "hero" }),
    defineField({ name: "credentials", title: "الشهادات", type: "internationalizedArrayText", group: "hero", description: "كل سطر = شهادة (مثال: ممرضة معتمدة)" }),
    defineField({ name: "signature", title: "التوقيع", type: "internationalizedArrayString", group: "hero", description: "مثال: هبة حسن" }),
    defineField({
      name: "stats",
      title: "الأرقام (3)",
      type: "array",
      group: "hero",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "number", title: "الرقم", type: "string", placeholder: "+1000" }),
          defineField({ name: "label", title: "الوصف", type: "internationalizedArrayString", description: "مثال: أم رافقتهنّ" }),
        ],
        preview: {
          select: { number: "number", label: "label" },
          prepare({ number, label }) {
            return { title: number ?? "—", subtitle: arValue(label) ?? "" };
          },
        },
      }],
    }),

    // ═══ القصة ═══
    defineField({ name: "storyLabel", title: "العنوان الصغير", type: "internationalizedArrayString", group: "story", description: "مثال: قصتها" }),
    defineField({ name: "storyQuote", title: "الاقتباس الكبير", type: "internationalizedArrayText", group: "story" }),
    defineField({ name: "storyParagraphs", title: "فقرات القصة", type: "internationalizedArrayText", group: "story", description: "كل سطر = فقرة مستقلة (لكل لغة)" }),

    // ═══ الفلسفة ═══
    defineField({ name: "philosophyLabel", title: "العنوان الصغير", type: "internationalizedArrayString", group: "philosophy", description: "مثال: فلسفتها" }),
    defineField({ name: "philosophyHeading", title: "العنوان", type: "internationalizedArrayString", group: "philosophy", description: "مثال: كيف ترافقك هبة" }),
    defineField({
      name: "philosophyValues",
      title: "القيم (4)",
      type: "array",
      group: "philosophy",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "icon", title: "الأيقونة", type: "image" }),
          defineField({ name: "title", title: "العنوان", type: "internationalizedArrayString" }),
          defineField({ name: "desc", title: "الوصف", type: "internationalizedArrayText" }),
        ],
        preview: {
          select: { title: "title", media: "icon" },
          prepare({ title, media }) {
            return { title: arValue(title) ?? "—", media };
          },
        },
      }],
    }),

    // ═══ عناوين + دعوة ═══
    defineField({ name: "servicesLabel", title: "خدماتها — عنوان صغير", type: "internationalizedArrayString", group: "cta", description: "مثال: خدماتها" }),
    defineField({ name: "servicesHeading", title: "خدماتها — العنوان", type: "internationalizedArrayString", group: "cta", description: "مثال: ماذا تقدّم هبة؟" }),
    defineField({ name: "ctaLabel", title: "الدعوة — عنوان صغير", type: "internationalizedArrayString", group: "cta", description: "مثال: جاهزة للبدء؟" }),
    defineField({ name: "ctaHeading", title: "الدعوة — العنوان", type: "internationalizedArrayString", group: "cta" }),
    defineField({ name: "ctaText", title: "الدعوة — النص", type: "internationalizedArrayText", group: "cta" }),
  ],
});
