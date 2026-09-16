import { defineType, defineField } from "sanity";
import { arValue } from "../i18n";

/** سؤال شائع — يُعرض في قسم "أسئلة شائعة" */
export const productFAQ = defineType({
  name: "productFAQ",
  title: "سؤال شائع",
  type: "object",
  preview: {
    select: { question: "question", hidden: "hidden" },
    prepare({ question, hidden }) {
      return { title: arValue(question) ?? "—", subtitle: hidden ? "مخفي من الموقع" : undefined };
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
    defineField({
      name: "hidden",
      title: "إخفاء من الموقع",
      description: "يبقى السؤال محفوظًا هنا ولا يظهر في الموقع — أزيلي العلامة ليعود.",
      type: "boolean",
      initialValue: false,
    }),
  ],
});
