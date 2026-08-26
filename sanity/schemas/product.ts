import { defineType, defineField } from "sanity";
import { arValue } from "./i18n";

/** التصنيفات المتاحة — تطابق قيم category في TypeScript */
const CATEGORIES = [
  { title: "صناديق الأمومة", value: "صناديق الأمومة" },
  { title: "إكسسوارات الطفل", value: "إكسسوارات الطفل" },
  { title: "كتب ودلائل", value: "كتب ودلائل" },
  { title: "عام", value: "عام" },
];

/**
 * Schema المنتج الرئيسي — يعكس Product interface في lib/products/types.ts
 * كل حقل مطابق 1:1 مع TypeScript type
 */
export const product = defineType({
  name: "product",
  title: "منتج",
  type: "document",

  /** معاينة في قائمة الـ Studio */
  preview: {
    select: {
      title: "title",
      subtitle: "category",
      media: "mainImage",
    },
    prepare({ title, subtitle, media }) {
      return {
        title: arValue(title) ?? "منتج بدون اسم",
        subtitle: subtitle ?? "",
        media,
      };
    },
  },

  fields: [
    // ─── المعلومات الأساسية ───────────────────────────────────────
    defineField({
      name: "title",
      title: "اسم المنتج",
      type: "internationalizedArrayString",
      validation: (r) => r.required().error("اسم المنتج مطلوب"),
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
      name: "description",
      title: "الوصف القصير",
      type: "internationalizedArrayText",
      description: "جملة أو جملتان تُعرضان في بطاقة المنتج وأعلى صفحته...",
      validation: (r) => r.required().error("الوصف مطلوب"),
    }),

    defineField({
      name: "category",
      title: "التصنيف",
      type: "string",
      options: { list: CATEGORIES, layout: "radio" },
      initialValue: "صناديق الأمومة",
      validation: (r) => r.required().error("التصنيف مطلوب"),
    }),

    defineField({
      name: "label",
      title: "الـ Label (اختياري)",
      type: "internationalizedArrayString",
      description: "نص صغير يظهر فوق العنوان في الكارد الكبير بالصفحة الرئيسية — مثال: Limited Edition، أو اتركيه فارغاً لإخفائه",
    }),

    defineField({
      name: "badge",
      title: "الـ Badge (اختياري)",
      type: "internationalizedArrayString",
      description: "نص يظهر فوق الكارد الكبير في الصفحة الرئيسية — اكتبي ما تريدين، مثال: جديد الآن، عرض محدود، مخزون محدود. اتركيه فارغاً لإخفائه.",
    }),

    defineField({
      name: "badgeColor",
      title: "لون الـ Badge",
      type: "string",
      initialValue: "yellow",
      options: {
        list: [
          { title: "🟡 أصفر (افتراضي)", value: "yellow" },
          { title: "🌸 وردي",           value: "rose"   },
          { title: "🩵 تيل",            value: "teal"   },
        ],
        layout: "radio",
        direction: "horizontal",
      },
    }),

    defineField({
      name: "tags",
      title: "الـ Tags (اختياري)",
      type: "array",
      of: [{ type: "productTag" }],
      description: "تظهر كـ badges فوق الصورة في بطاقة المنتج — أضيفي ما تريدين واختاري اللون لكل واحدة",
    }),

    // ─── السعر والمخزون ────────────────────────────────────────────
    defineField({
      name: "price",
      title: "السعر (₪)",
      type: "number",
      validation: (r) => r.required().min(0).error("السعر مطلوب"),
    }),

    defineField({
      name: "compareAtPrice",
      title: "السعر الأصلي قبل الخصم (₪) — اختياري",
      type: "number",
      description: "يُعرض مشطوباً بجانب السعر الحالي",
      validation: (r) => r.min(0),
    }),

    defineField({
      name: "inStock",
      title: "متوفر في المخزون؟",
      type: "boolean",
      initialValue: true,
    }),

    defineField({
      name: "stockQuantity",
      title: "الكمية المتوفرة (اختياري)",
      type: "number",
      description:
        "ملاحظة: سيتم ربط المخزون مع Supabase لاحقاً للتحديث التلقائي مع كل طلب",
      validation: (r) => r.min(0).integer(),
    }),

    defineField({
      name: "weight",
      title: "الوزن بالكيلوغرام (اختياري)",
      type: "number",
      description: "يُستخدم لحسابات الشحن لاحقاً",
      validation: (r) => r.min(0),
    }),

    // ─── الصور والفيديو ────────────────────────────────────────────
    defineField({
      name: "mainImage",
      title: "الصورة الرئيسية",
      type: "image",
      options: { hotspot: true },
      validation: (r) => r.required().error("الصورة الرئيسية مطلوبة"),
    }),

    defineField({
      name: "gallery",
      title: "معرض الصور",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      description: "الصور الإضافية للمنتج (ارفعي 2 صور على الأقل)",
      validation: (r) => r.min(2).error("معرض الصور يحتاج صورتين على الأقل"),
    }),

    defineField({
      name: "videoUrl",
      title: "رابط فيديو المنتج (اختياري)",
      type: "string",
      description: "الصق رابط YouTube أو Vimeo — مثال: https://www.youtube.com/watch?v=xxxxx",
      placeholder: "https://www.youtube.com/watch?v=...",
    }),

    // ─── النصوص التفصيلية ─────────────────────────────────────────
    defineField({
      name: "longDescription",
      title: "الوصف التفصيلي (اختياري)",
      type: "internationalizedArrayText",
      description: "وصف مطوّل عن المنتج، قيمته، مكوناته...",
    }),

    defineField({
      name: "specifications",
      title: "المواصفات التقنية (اختياري)",
      type: "array",
      of: [{ type: "productSpecification" }],
      description: "مفيد للمنتجات التقنية: مادة، أبعاد، سعة...",
    }),

    // ─── معلومات الشحن ────────────────────────────────────────────
    defineField({
      name: "shippingInfo",
      title: "معلومات الشحن (اختياري)",
      type: "productShippingInfo",
    }),

    // ─── الأقسام الغنية (الشرطية) ─────────────────────────────────
    defineField({
      name: "story",
      title: "قصة المنتج — 'من قلب هبة' (اختياري)",
      type: "productStory",
      description: "إذا تركتِه فارغاً، قسم القصة لن يظهر في الصفحة",
    }),

    defineField({
      name: "contents",
      title: "محتويات الصندوق (اختياري)",
      type: "array",
      of: [{ type: "productContent" }],
      description: "كل عنصر في الصندوق بوصف عاطفي",
    }),

    defineField({
      name: "giftTargets",
      title: "لمين هاي الهدية؟ (اختياري)",
      type: "array",
      of: [{ type: "productGiftTarget" }],
      description: "الفئات المستهدفة: صديقة، أخت، الأم نفسها...",
    }),

    defineField({
      name: "testimonials",
      title: "شهادات العميلات (اختياري)",
      type: "array",
      of: [{ type: "productTestimonial" }],
      description: "تُعرض في قسم الشهادات أسفل الصفحة",
    }),

    defineField({
      name: "faqs",
      title: "الأسئلة الشائعة (اختياري)",
      type: "array",
      of: [{ type: "productFAQ" }],
    }),

    // ─── حقول الكتيب الرقمي (خاصة بتصنيف "كتب ودلائل") ──────────────
    defineField({
      name: "bookletHook",
      title: "الكتيب — الخطّاف الافتتاحي (اختياري)",
      type: "internationalizedArrayText",
      description: "فقرة تشويقية أعلى صفحة الكتيب — خاصة بتصنيف «كتب ودلائل».",
    }),
    defineField({
      name: "bookletAbout",
      title: "الكتيب — نبذة عن الكتيب (فقرات)",
      type: "internationalizedArrayText",
      description: "كل سطر = فقرة مستقلة (لكل لغة).",
    }),
    defineField({
      name: "bookletChapters",
      title: "الكتيب — ماذا ستجدين داخل الكتيب؟",
      type: "internationalizedArrayText",
      description: "قائمة المواضيع/الفصول — كل سطر بند (لكل لغة). وجودها يجعل الصفحة تظهر كـ«كتيب».",
    }),
    defineField({
      name: "bookletBenefits",
      title: "الكتيب — ماذا سيفيدك هذا الكتيب؟",
      type: "internationalizedArrayText",
      description: "قائمة الفوائد — كل سطر بند (لكل لغة).",
    }),
    defineField({
      name: "bookletAudience",
      title: "الكتيب — لمن صُمّم هذا الكتيب؟",
      type: "internationalizedArrayText",
      description: "الفئات المستهدفة — كل سطر بند (لكل لغة).",
    }),

    // ملاحظة: لا حقل PDF هنا — الكتيبات الرقمية تُقرأ على الموقع فقط (flipbook).
    // الرفع عبر: npx tsx scripts/booklet-upload.ts "<pdf>" <slug> — انظري CLAUDE.md «حماية المحتوى الرقمي».
  ],
});
