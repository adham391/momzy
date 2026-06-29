import { defineType, defineField } from "sanity";

/** قصة هبة — يُعرض في قسم "من قلب هبة" */
export const productStory = defineType({
  name: "productStory",
  title: "قصة المنتج",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "عنوان القسم",
      type: "string",
      placeholder: "مثال: من قلب هبة",
      initialValue: "من قلب هبة",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "paragraphs",
      title: "فقرات القصة",
      type: "array",
      of: [{ type: "text" }],
      description: "كل عنصر = فقرة مستقلة. أضيفي 3-4 فقرات.",
      validation: (r) => r.required().min(1).error("أضيفي فقرة واحدة على الأقل"),
    }),
    defineField({
      name: "image",
      title: "صورة هبة (اختياري)",
      type: "image",
      options: { hotspot: true },
      description: "صورة دائرية تُعرض بجانب النص",
    }),
  ],
});
