import { defineType, defineField } from "sanity";
import { arValue } from "./i18n";

/** ألوان الأفاتار — تطابق ReviewColor في lib/reviews/types.ts */
const COLORS = [
  { title: "🌸 وردي", value: "rose"   },
  { title: "🩵 تيل",  value: "teal"   },
  { title: "🟡 أصفر", value: "yellow" },
  { title: "🌿 منت",  value: "mint"   },
];

/**
 * Schema التقييم — يعكس Review interface في lib/reviews/types.ts
 */
export const review = defineType({
  name: "review",
  title: "تقييم",
  type: "document",

  preview: {
    select: { title: "name", subtitle: "info", rating: "rating" },
    prepare({ title, subtitle, rating }) {
      const stars = "★".repeat(rating ?? 5);
      return {
        title: title ?? "تقييم بدون اسم",
        subtitle: `${stars} — ${arValue(subtitle) ?? ""}`,
      };
    },
  },

  fields: [
    defineField({
      name: "name",
      title: "اسم الأم",
      type: "string",
      placeholder: "مثال: سارة م.",
      validation: (r) => r.required().min(2).error("الاسم مطلوب"),
    }),

    defineField({
      name: "slug",
      title: "المعرّف (Slug)",
      type: "slug",
      options: { source: "name", maxLength: 60 },
      validation: (r) => r.required().error("المعرّف مطلوب"),
    }),

    defineField({
      name: "quote",
      title: "نص التقييم",
      type: "internationalizedArrayText",
      description: "ما الذي قالته الأم عن تجربتها مع هبة (لكل لغة)",
      validation: (r) => r.required().error("نص التقييم مطلوب"),
    }),

    defineField({
      name: "info",
      title: "معلومة إضافية",
      type: "internationalizedArrayString",
      description: "تظهر تحت الاسم — مثال: أم لطفلة ٤ أشهر",
      validation: (r) => r.required().error("المعلومة الإضافية مطلوبة"),
    }),

    defineField({
      name: "initial",
      title: "حرف الأفاتار",
      type: "string",
      description: "الحرف الذي يظهر داخل دائرة الأفاتار",
      placeholder: "س",
      validation: (r) => r.required().max(2).error("حرف واحد أو حرفين"),
    }),

    defineField({
      name: "color",
      title: "لون الأفاتار",
      type: "string",
      options: { list: COLORS, layout: "radio", direction: "horizontal" },
      initialValue: "rose",
      validation: (r) => r.required(),
    }),

    defineField({
      name: "rating",
      title: "التقييم بالنجوم",
      type: "number",
      description: "من 1 إلى 5",
      initialValue: 5,
      validation: (r) => r.required().min(1).max(5).integer(),
    }),

    defineField({
      name: "order",
      title: "ترتيب العرض",
      type: "number",
      description: "الأرقام الأصغر تظهر أولاً",
      initialValue: 0,
    }),
  ],

  orderings: [
    {
      title: "حسب الترتيب",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
});
