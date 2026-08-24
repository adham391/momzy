import { defineType, defineField } from "sanity";
import { arValue } from "../i18n";

/** تاق واحد للمنتج — نص + لون */
export default defineType({
  name: "productTag",
  title: "تاق",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "النص",
      type: "internationalizedArrayString",
      validation: (r) => r.required().error("النص مطلوب"),
    }),
    defineField({
      name: "color",
      title: "اللون",
      type: "string",
      initialValue: "rose",
      options: {
        list: [
          { title: "🌸 وردي", value: "rose" },
          { title: "🩵 تيل",  value: "teal" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
    }),
  ],
  preview: {
    select: { label: "label", color: "color" },
    prepare({ label, color }) {
      const emoji = color === "teal" ? "🩵" : "🌸";
      return { title: `${emoji} ${arValue(label) ?? "—"}` };
    },
  },
});
