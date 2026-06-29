import { defineType, defineField } from "sanity";

/** تاق واحد للمنتج — نص + لون */
export default defineType({
  name: "productTag",
  title: "تاق",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "النص",
      type: "string",
      validation: (r) => r.required().error("النص مطلوب"),
      placeholder: "مثال: هدية مميزة",
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
      return { title: `${emoji} ${label ?? "—"}` };
    },
  },
});
