import { defineType, defineField } from "sanity";

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
        title: title ?? "خدمة بدون اسم",
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
      type: "string",
      placeholder: "مثال: ورشة الأيام الأولى بعد الولادة",
      validation: (r) => r.required().min(3).error("اسم الخدمة مطلوب"),
    }),

    defineField({
      name: "slug",
      title: "الرابط (Slug)",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required().error("الرابط مطلوب"),
    }),

    defineField({
      name: "shortDescription",
      title: "الوصف القصير",
      type: "text",
      rows: 3,
      placeholder: "سطران يظهران في كارد الخدمة...",
      validation: (r) => r.required().min(20).error("الوصف القصير مطلوب"),
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
      type: "string",
      placeholder: "مثال: ساعة ونصف – ساعتين",
      validation: (r) => r.required().error("المدة مطلوبة"),
    }),

    defineField({
      name: "location",
      title: "المكان",
      type: "string",
      placeholder: "مثال: الناصرة / عبر تطبيق Zoom / في منزل الأم",
      validation: (r) => r.required().error("المكان مطلوب"),
    }),

    defineField({
      name: "ageRange",
      title: "الفئة العمرية (اختياري)",
      type: "string",
      placeholder: "مثال: 0-3 أشهر",
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

    // ─── المحتوى التفصيلي ─────────────────────────────────────────
    defineField({
      name: "longDescription",
      title: "الوصف الطويل (paragraphs)",
      type: "array",
      of: [{ type: "text", rows: 4 }],
      description: "كل عنصر = فقرة مستقلة",
    }),

    defineField({
      name: "topics",
      title: "المواضيع التي نتطرق لها",
      type: "array",
      of: [{ type: "string" }],
      description: "قائمة المواضيع — كل سطر يظهر كـ bullet مع ✦",
    }),

    defineField({
      name: "benefits",
      title: "ما الذي ستحصلين عليه (اختياري)",
      type: "array",
      of: [{ type: "string" }],
      description: "النتائج/الفوائد — كل سطر يظهر كـ bullet",
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
