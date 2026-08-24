import { defineType, defineField } from "sanity";
import { arValue } from "../i18n";

/** مواصفة تقنية — مادة، أبعاد، سعة... */
export const productSpecification = defineType({
  name: "productSpecification",
  title: "مواصفة تقنية",
  type: "object",
  preview: {
    select: { key: "key", value: "value" },
    prepare({ key, value }) {
      return { title: arValue(key) ?? "—", subtitle: arValue(value) };
    },
  },
  fields: [
    defineField({
      name: "key",
      title: "الخاصية",
      type: "internationalizedArrayString",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "value",
      title: "القيمة",
      type: "internationalizedArrayString",
      validation: (r) => r.required(),
    }),
  ],
});
