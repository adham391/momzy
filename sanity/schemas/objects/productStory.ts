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
      type: "internationalizedArrayString",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "paragraphs",
      title: "فقرات القصة",
      type: "internationalizedArrayText",
      description: "كل سطر = فقرة مستقلة. أضيفي 3-4 فقرات (لكل لغة).",
      validation: (r) => r.required().error("أضيفي فقرة واحدة على الأقل"),
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
