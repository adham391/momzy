import { defineType, defineField } from "sanity";

/** معلومات الشحن — تُعرض في trust signals في الـ Hero */
export const productShippingInfo = defineType({
  name: "productShippingInfo",
  title: "معلومات الشحن",
  type: "object",
  fields: [
    defineField({
      name: "estimatedDays",
      title: "مدة التوصيل",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "freeShipping",
      title: "شحن مجاني؟",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "notes",
      title: "ملاحظة الشحن",
      type: "internationalizedArrayString",
    }),
  ],
});
