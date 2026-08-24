import { defineType, defineField } from "sanity";
import { arValue } from "../i18n";

/** عنصر داخل الصندوق — يُعرض في قسم "محتويات الصندوق" */
export const productContent = defineType({
  name: "productContent",
  title: "محتوى الصندوق",
  type: "object",
  preview: {
    select: { name: "name", description: "description" },
    prepare({ name, description }) {
      return { title: arValue(name) ?? "—", subtitle: arValue(description) };
    },
  },
  fields: [
    defineField({
      name: "name",
      title: "اسم العنصر",
      type: "internationalizedArrayString",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "description",
      title: "الوصف العاطفي",
      type: "internationalizedArrayText",
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
