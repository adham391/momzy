import { defineType, defineField } from "sanity";

/** سؤال شائع — يُعرض في قسم "أسئلة شائعة" */
export const productFAQ = defineType({
  name: "productFAQ",
  title: "سؤال شائع",
  type: "object",
  preview: {
    select: { title: "question" },
  },
  fields: [
    defineField({
      name: "question",
      title: "السؤال",
      type: "string",
      placeholder: "مثال: كم تستغرق مدة التوصيل؟",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "answer",
      title: "الإجابة",
      type: "text",
      rows: 3,
      validation: (r) => r.required(),
    }),
  ],
});
