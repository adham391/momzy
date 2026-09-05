import { defineType, defineField } from "sanity";
import { arValue } from "./i18n";

/** أنواع الخدمات — تطابق ServiceType في lib/services/types.ts */
const TYPES = [
  { title: "ورشة جماعية",   value: "workshop"   },
  { title: "لقاء فردي",     value: "individual" },
  { title: "لقاء أونلاين",  value: "online"     },
  { title: "زيارة بيتية",   value: "home"       },
];

/** فئة العرض في صفحة /services */
const CATEGORIES = [
  { title: "ورشات جماعية", value: "group"      },
  { title: "لقاءات فردية", value: "individual" },
];

/** ألوان الكارد — من design tokens */
const COLORS = [
  { title: "🌸 وردي",  value: "rose"   },
  { title: "🩵 تيل",   value: "teal"   },
  { title: "🟡 أصفر",  value: "yellow" },
  { title: "🌿 منت",   value: "mint"   },
];

/**
 * Schema الخدمة — يعكس Service interface في lib/services/types.ts
 * كل حقل مطابق 1:1 مع TypeScript type
 */
export const service = defineType({
  name: "service",
  title: "خدمة",
  type: "document",

  /** معاينة في قائمة الـ Studio */
  preview: {
    select: {
      title: "title",
      subtitle: "category",
      media: "coverImage",
    },
    prepare({ title, subtitle, media }) {
      const subMap: Record<string, string> = {
        group:      "ورشة جماعية",
        individual: "لقاء فردي",
      };
      return {
        title: arValue(title) ?? "خدمة بدون اسم",
        subtitle: subMap[subtitle] ?? subtitle ?? "",
        media,
      };
    },
  },

  fields: [
    // ─── المعلومات الأساسية ───────────────────────────────────────
    defineField({
      name: "title",
      title: "اسم الخدمة",
      type: "internationalizedArrayString",
      description: "مثال: ورشة الأيام الأولى بعد الولادة",
      validation: (r) => r.required().error("اسم الخدمة مطلوب"),
    }),

    defineField({
      name: "slug",
      title: "الرابط (Slug)",
      type: "slug",
      // المصدر = القيمة العربية من الحقل المُدوّل
      options: { source: "title.0.value", maxLength: 96 },
      validation: (r) => r.required().error("الرابط مطلوب"),
    }),

    defineField({
      name: "shortDescription",
      title: "الوصف القصير",
      type: "internationalizedArrayText",
      description: "سطران يظهران في كارد الخدمة...",
      validation: (r) => r.required().error("الوصف القصير مطلوب"),
    }),

    defineField({
      name: "type",
      title: "نوع الخدمة",
      type: "string",
      options: { list: TYPES, layout: "radio" },
      initialValue: "workshop",
      validation: (r) => r.required().error("نوع الخدمة مطلوب"),
    }),

    defineField({
      name: "category",
      title: "فئة العرض",
      type: "string",
      description: "تحدد القسم الذي تظهر فيه الخدمة في صفحة /services",
      options: { list: CATEGORIES, layout: "radio" },
      initialValue: "group",
      validation: (r) => r.required().error("فئة العرض مطلوبة"),
    }),

    // ─── تفاصيل الخدمة ────────────────────────────────────────────
    defineField({
      name: "duration",
      title: "المدة",
      type: "internationalizedArrayString",
      description: "نص وصفي — مثال: ساعة ونصف – ساعتين",
      validation: (r) => r.required().error("المدة مطلوبة"),
    }),

    defineField({
      name: "location",
      title: "المكان",
      type: "internationalizedArrayString",
      description: "مثال: الناصرة / عبر تطبيق Zoom / في منزل الأم",
      validation: (r) => r.required().error("المكان مطلوب"),
    }),

    defineField({
      name: "ageRange",
      title: "الفئة العمرية (اختياري)",
      type: "internationalizedArrayString",
      description: "نص للعرض فقط — بكلماتك أنتِ. مثال: 0-3 أشهر",
    }),

    defineField({
      name: "ageMinMonths",
      title: "أصغر عمر بالأشهر (اختياري)",
      type: "number",
      description:
        "لمنع تسجيل طفل خارج الفئة تلقائياً. اتركيه فارغاً إن لم تكن الورشة محدودة العمر (مثل ورشات الحوامل).",
      validation: (r) => r.min(0).integer(),
    }),

    defineField({
      name: "ageMaxMonths",
      title: "أكبر عمر بالأشهر (اختياري)",
      type: "number",
      description: "مثال: ورشة 0-3 أشهر ⇒ أصغر عمر 0 · أكبر عمر 3",
      validation: (r) =>
        r
          .min(0)
          .integer()
          .custom((max, ctx) => {
            const min = (ctx.parent as { ageMinMonths?: number })?.ageMinMonths;
            if (typeof max === "number" && typeof min === "number" && max < min) {
              return "أكبر عمر يجب أن يكون أكبر من أصغر عمر";
            }
            return true;
          }),
    }),

    defineField({
      name: "maxParticipants",
      title: "العدد الأقصى للمشاركين (اختياري)",
      type: "number",
      description: "للورشات الجماعية فقط",
      validation: (r) => r.min(1).integer(),
    }),

    defineField({
      name: "price",
      title: "السعر بالشيكل (اختياري)",
      type: "number",
      description: "اتركيه فارغاً إذا كان السعر حسب الطلب",
      validation: (r) => r.min(0),
    }),

    defineField({
      name: "whatsappOnly",
      title: "التسجيل عبر واتساب لا عبر الموقع",
      type: "boolean",
      initialValue: false,
      description:
        "للخدمات التي لا يصلح لها سعر ثابت ولا حجز آلي — كالزيارة البيتية التي يختلف سعرها بحسب البلدة. " +
        "يُستبدل زر التسجيل برسالة واتساب لكِ، فتتفقان على الموعد والسعر مباشرة.",
    }),

    // ─── المحتوى التفصيلي ─────────────────────────────────────────
    defineField({
      name: "longDescription",
      title: "الوصف الطويل (paragraphs)",
      type: "internationalizedArrayText",
      description: "كل سطر = فقرة مستقلة (لكل لغة)",
    }),

    defineField({
      name: "topics",
      title: "المواضيع التي نتطرق لها",
      type: "internationalizedArrayText",
      description: "قائمة المواضيع — كل سطر يظهر كـ bullet مع ✦ (لكل لغة)",
    }),

    defineField({
      name: "benefits",
      title: "ما الذي ستحصلين عليه (اختياري)",
      type: "internationalizedArrayText",
      description: "النتائج/الفوائد — كل سطر يظهر كـ bullet (لكل لغة)",
    }),

    defineField({
      name: "faqs",
      title: "الأسئلة الشائعة (اختياري)",
      type: "array",
      // نفس كائن أسئلة المنتج — بنية واحدة (سؤال + جواب) لا تُكرَّر
      of: [{ type: "productFAQ" }],
      description: "تظهر كقسم قابل للطي في صفحة الورشة. اتركيه فارغًا فلا يظهر القسم.",
    }),

    // ─── الصور والتصميم ───────────────────────────────────────────
    defineField({
      name: "coverImage",
      title: "صورة الغلاف",
      type: "image",
      options: { hotspot: true },
      description: "تظهر في الكارد وأعلى صفحة التفاصيل",
    }),

    defineField({
      name: "icon",
      title: "أيقونة (اختياري)",
      type: "image",
      description: "أيقونة صغيرة تظهر فوق العنوان في الكارد",
    }),

    defineField({
      name: "color",
      title: "لون الكارد",
      type: "string",
      initialValue: "rose",
      options: { list: COLORS, layout: "radio", direction: "horizontal" },
      validation: (r) => r.required(),
    }),

    // ─── الترتيب ──────────────────────────────────────────────────
    defineField({
      name: "order",
      title: "ترتيب العرض",
      type: "number",
      description: "الأرقام الأصغر تظهر أولاً",
      initialValue: 0,
    }),
  ],

  orderings: [
    {
      title: "حسب الترتيب",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
});
