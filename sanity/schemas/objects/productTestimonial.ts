import { defineType, defineField } from "sanity";

/** شهادة عميلة — يُعرض في قسم "شهادات" */
export const productTestimonial = defineType({
  name: "productTestimonial",
  title: "شهادة عميلة",
  type: "object",
  preview: {
    select: { title: "name", subtitle: "location" },
  },
  fields: [
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
      type: "string",
      placeholder: "مثال: حيفا",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "text",
      title: "نص الشهادة",
      type: "text",
      rows: 3,
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
