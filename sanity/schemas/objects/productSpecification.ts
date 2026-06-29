import { defineType, defineField } from "sanity";

/** مواصفة تقنية — مادة، أبعاد، سعة... */
export const productSpecification = defineType({
  name: "productSpecification",
  title: "مواصفة تقنية",
  type: "object",
  preview: {
    select: { title: "key", subtitle: "value" },
  },
  fields: [
    defineField({
      name: "key",
      title: "الخاصية",
      type: "string",
      placeholder: "مثال: المادة",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "value",
      title: "القيمة",
      type: "string",
      placeholder: "مثال: قطن عضوي 100%",
      validation: (r) => r.required(),
    }),
  ],
});
