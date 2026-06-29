import { defineType, defineField } from "sanity";

/** عنصر داخل الصندوق — يُعرض في قسم "محتويات الصندوق" */
export const productContent = defineType({
  name: "productContent",
  title: "محتوى الصندوق",
  type: "object",
  preview: {
    select: { title: "name", subtitle: "description" },
  },
  fields: [
    defineField({
      name: "name",
      title: "اسم العنصر",
      type: "string",
      placeholder: "مثال: بطاقات التحديات (30 بطاقة)",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "description",
      title: "الوصف العاطفي",
      type: "text",
      rows: 2,
      placeholder: "جملة أو جملتان تصف أثر هذا العنصر...",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "icon",
      title: "أيقونة (اختياري)",
      type: "image",
      description: "صورة أيقونة صغيرة تُعرض فوق الاسم",
      options: { hotspot: false },
    }),
    defineField({
      name: "image",
      title: "صورة معاينة (اختياري)",
      type: "image",
      options: { hotspot: true },
    }),
  ],
});
