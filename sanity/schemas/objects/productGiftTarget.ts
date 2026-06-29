import { defineType, defineField } from "sanity";

/** فئة مستهدفة بالهدية — يُعرض في قسم "لمين هاي الهدية؟" */
export const productGiftTarget = defineType({
  name: "productGiftTarget",
  title: "فئة الهدية",
  type: "object",
  preview: {
    select: { title: "label", subtitle: "text" },
  },
  fields: [
    defineField({
      name: "label",
      title: "العنوان",
      type: "string",
      placeholder: "مثال: للصديقة اللي صارت أم",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "text",
      title: "نص الترغيب",
      type: "text",
      rows: 3,
      placeholder: "اشرحي لماذا هذه الهدية مناسبة لهذه الفئة...",
      validation: (r) => r.required(),
    }),
  ],
});
