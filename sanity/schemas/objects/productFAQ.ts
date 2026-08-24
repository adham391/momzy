import { defineType, defineField } from "sanity";
import { arValue } from "../i18n";

/** سؤال شائع — يُعرض في قسم "أسئلة شائعة" */
export const productFAQ = defineType({
  name: "productFAQ",
  title: "سؤال شائع",
  type: "object",
  preview: {
    select: { question: "question" },
    prepare({ question }) {
      return { title: arValue(question) ?? "—" };
    },
  },
  fields: [
    defineField({
      name: "question",
      title: "السؤال",
      type: "internationalizedArrayString",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "answer",
      title: "الإجابة",
      type: "internationalizedArrayText",
      validation: (r) => r.required(),
    }),
  ],
});
