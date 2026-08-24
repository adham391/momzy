import { defineType, defineField } from "sanity";
import { arValue } from "../i18n";

/** شهادة عميلة — يُعرض في قسم "شهادات" */
export const productTestimonial = defineType({
  name: "productTestimonial",
  title: "شهادة عميلة",
  type: "object",
  preview: {
    select: { name: "name", location: "location" },
    prepare({ name, location }) {
      return { title: name ?? "—", subtitle: arValue(location) };
    },
  },
  fields: [
    // اسم العميلة — اسم عَلَم لا يُترجَم
    defineField({
      name: "name",
      title: "الاسم",
      type: "string",
      placeholder: "مثال: ريم خ.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "location",
      title: "المدينة",
      type: "internationalizedArrayString",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "text",
      title: "نص الشهادة",
      type: "internationalizedArrayText",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "rating",
      title: "التقييم (1-5)",
      type: "number",
      initialValue: 5,
      validation: (r) =>
        r.required().min(1).max(5).integer().error("يجب أن يكون بين 1 و 5"),
    }),
    defineField({
      name: "image",
      title: "صورة العميلة (اختياري)",
      type: "image",
      options: { hotspot: true },
    }),
  ],
});
