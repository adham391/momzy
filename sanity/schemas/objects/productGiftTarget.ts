import { defineType, defineField } from "sanity";
import { arValue } from "../i18n";

/** فئة مستهدفة بالهدية — يُعرض في قسم "لمين هاي الهدية؟" */
export const productGiftTarget = defineType({
  name: "productGiftTarget",
  title: "فئة الهدية",
  type: "object",
  preview: {
    select: { label: "label", text: "text" },
    prepare({ label, text }) {
      return { title: arValue(label) ?? "—", subtitle: arValue(text) };
    },
  },
  fields: [
    defineField({
      name: "label",
      title: "العنوان",
      type: "internationalizedArrayString",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "text",
      title: "نص الترغيب",
      type: "internationalizedArrayText",
      validation: (r) => r.required(),
    }),
  ],
});
