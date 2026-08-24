import { defineType, defineField } from "sanity";
import { arValue } from "./i18n";

/**
 * محتوى الصفحة الرئيسية — Singleton (نسخة واحدة)
 * يتحكم في نصوص: الهيرو، قسم "ليش Momzy"، قسم هبة، وعناوين الأقسام.
 * الحقول النصّية مُدوّلة (ar/he/en) — إذا فُرِّغ حقل يُستخدم النص الافتراضي المُترجَم في الكود.
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
    defineField({ name: "heroTagline", title: "العنوان — السطر الأول", type: "internationalizedArrayString", group: "hero", description: "مثال: نرافقك من الحمل" }),
    defineField({ name: "heroTaglineAccent", title: "العنوان — السطر الثاني (مميّز)", type: "internationalizedArrayString", group: "hero", description: "مثال: حتى السنوات الأولى" }),
    defineField({ name: "heroIntro", title: "جملة التعريف", type: "internationalizedArrayText", group: "hero", description: "مثال: تأسست Momzy على يد هبة حسن — ممرضة معتمدة ومرافقة ولادة، رافقت +1000 أم برحلتهنّ." }),
    defineField({ name: "heroPoints", title: "النقاط (3)", type: "internationalizedArrayText", group: "hero", description: "نقاط مختصرة تظهر مع علامة ✓ — كل سطر نقطة." }),

    // ═══════════ ليش Momzy ═══════════
    defineField({ name: "whyLabel", title: "العنوان الصغير", type: "internationalizedArrayString", group: "why", description: "مثال: قصتنا" }),
    defineField({ name: "whyHeading", title: "العنوان الرئيسي", type: "internationalizedArrayString", group: "why", description: "مثال: ليش Momzy؟" }),
    defineField({ name: "whyIntro", title: "المقدمة", type: "internationalizedArrayText", group: "why" }),
    defineField({
      name: "whyValues",
      title: "القيم (4)",
      type: "array",
      group: "why",
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
    defineField({ name: "whyQuote", title: "الاقتباس الختامي", type: "internationalizedArrayText", group: "why" }),

    // ═══════════ قسم هبة ═══════════
    defineField({ name: "hebaLabel", title: "العنوان الصغير", type: "internationalizedArrayString", group: "heba", description: "مثال: مؤسِّسة Momzy" }),
    defineField({ name: "hebaHeadingLine1", title: "العنوان — سطر 1", type: "internationalizedArrayString", group: "heba", description: "مثال: القلب النابض" }),
    defineField({ name: "hebaHeadingLine2", title: "العنوان — سطر 2", type: "internationalizedArrayString", group: "heba", description: "مثال: وراء Momzy" }),
    defineField({ name: "hebaBio", title: "السيرة (فقرات)", type: "internationalizedArrayText", group: "heba", description: "كل سطر = فقرة مستقلة." }),
    // التوقيع اسم علم لشخص — يبقى نصًّا عاديًا (غير مُدوّل)
    defineField({ name: "hebaSignature", title: "التوقيع", type: "string", group: "heba", placeholder: "هبة حسن" }),
    defineField({
      name: "hebaStat",
      title: "الإحصائية العائمة",
      type: "object",
      group: "heba",
      fields: [
        // الرقم إحصائية — يبقى نصًّا عاديًا (غير مُدوّل)
        defineField({ name: "number", title: "الرقم", type: "string", placeholder: "+1000" }),
        defineField({ name: "label", title: "الوصف", type: "internationalizedArrayString", description: "مثال: أمّ رافقتهنّ هبة" }),
      ],
    }),

    // ═══════════ عناوين الأقسام ═══════════
    defineField({ name: "bestSellersLabel", title: "الأكثر مبيعاً — عنوان صغير", type: "internationalizedArrayString", group: "headings", description: "مثال: الأكثر طلبًا" }),
    defineField({ name: "bestSellersTitle", title: "الأكثر مبيعاً — العنوان", type: "internationalizedArrayString", group: "headings", description: "مثال: الأكثر مبيعاً" }),
    defineField({ name: "articlesLabel", title: "المقالات — عنوان صغير", type: "internationalizedArrayString", group: "headings", description: "مثال: أحدث المقالات" }),
    defineField({ name: "articlesTitle", title: "المقالات — العنوان", type: "internationalizedArrayString", group: "headings" }),
    defineField({ name: "reviewsLabel", title: "التقييمات — عنوان صغير", type: "internationalizedArrayString", group: "headings" }),
    defineField({ name: "reviewsTitle", title: "التقييمات — العنوان", type: "internationalizedArrayString", group: "headings", description: "مثال: ماذا قالت الأمهات؟" }),
  ],
});
