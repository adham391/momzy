import { defineType, defineField } from "sanity";

/**
 * إعدادات الموقع — Singleton (نسخة واحدة فقط)
 * يتحكم في: TopBar، روابط السوشيال، معلومات التواصل، الفوتير
 */
export const siteSettings = defineType({
  name: "siteSettings",
  title: "إعدادات الموقع",
  type: "document",

  preview: {
    prepare() {
      return { title: "إعدادات الموقع" };
    },
  },

  fields: [
    // ─── شريط الإعلانات (TopBar) ──────────────────────────────────
    defineField({
      name: "topBar",
      title: "شريط الإعلانات العلوي",
      type: "object",
      fields: [
        defineField({
          name: "enabled",
          title: "تفعيل الشريط؟",
          type: "boolean",
          initialValue: true,
        }),
        defineField({
          name: "badge",
          title: "الـ Badge",
          type: "internationalizedArrayString",
          description: "كلمة صغيرة بخلفية وردية (اختياري) — مثال: جديد",
        }),
        defineField({
          name: "message",
          title: "رسالة الشريط",
          type: "internationalizedArrayString",
          description: "مثال: صندوق مشوار أم — اطلبي الآن قبل نفاد الكمية",
        }),
        defineField({
          name: "featuredProduct",
          title: "منتج مميز (اختياري)",
          type: "reference",
          to: [{ type: "product" }],
          description: "رابط 'اطلبي الآن' يوجه لهذا المنتج",
        }),
      ],
    }),

    // ─── روابط السوشيال ───────────────────────────────────────────
    defineField({
      name: "socialLinks",
      title: "روابط التواصل الاجتماعي",
      type: "object",
      description:
        "ما تتركينه فارغاً هنا لا يظهر في الموقع إطلاقاً — لا يُستبدل بقيمة جاهزة. " +
        "الروابط الحالية معبّأة مسبقاً عند إنشاء الإعدادات لأول مرة.",
      fields: [
        defineField({
          name: "instagram",
          title: "Instagram",
          type: "url",
          placeholder: "https://instagram.com/momzyworld",
          // القيم المبدئية تطابق DEFAULT_SETTINGS في lib/sanity/queries/siteSettings.ts
          // فلا يفقد الموقع روابطه لحظة إنشاء الإعدادات في Studio
          initialValue: "https://www.instagram.com/hebahasan._",
        }),
        defineField({
          name: "tiktok",
          title: "TikTok",
          type: "url",
          placeholder: "https://tiktok.com/@momzyworld",
          initialValue: "https://www.tiktok.com/@heba.the.nurse",
        }),
        defineField({
          name: "whatsapp",
          title: "رقم WhatsApp",
          type: "string",
          placeholder: "مثال: +972501234567",
          description: "رقم كامل مع رمز البلد — يُستخدم لرابط wa.me. فارغ = تختفي أيقونة واتساب",
        }),
        defineField({
          name: "whatsappChannel",
          title: "قناة WhatsApp",
          type: "url",
          placeholder: "https://whatsapp.com/channel/xxxxxxxx",
          description: "رابط القناة — يظهر في الفوتر وفي قسم القناة بالصفحة الرئيسية. اتركيه فارغاً لإخفائهما",
          initialValue: "https://whatsapp.com/channel/0029Vb7W941KWEKrvB5s7B3Q",
        }),
      ],
    }),

    // ─── معلومات التواصل ──────────────────────────────────────────
    defineField({
      name: "contact",
      title: "معلومات التواصل",
      type: "object",
      fields: [
        defineField({
          name: "email",
          title: "البريد الإلكتروني",
          type: "string",
          placeholder: "hello@momzyworld.com",
        }),
        defineField({
          name: "whatsappNumber",
          title: "رقم WhatsApp للتواصل",
          type: "string",
          placeholder: "+972501234567",
          description: "قد يختلف عن رابط السوشيال",
        }),
        defineField({
          name: "address",
          title: "العنوان (اختياري)",
          type: "internationalizedArrayString",
        }),
      ],
    }),

    // ─── الفوتير ──────────────────────────────────────────────────
    defineField({
      name: "footer",
      title: "إعدادات الفوتير",
      type: "object",
      fields: [
        defineField({
          name: "tagline",
          title: "الشعار الثانوي",
          type: "internationalizedArrayString",
          description: "مثال: نحن هنا للمساعدة في كل خطوة من رحلتك",
        }),
        defineField({
          name: "description",
          title: "الوصف",
          type: "internationalizedArrayText",
          description: "مثال: مؤسسة متخصصة ترافق الأمهات — خدمات، منتجات، ومحتوى لكل أم.",
        }),
        defineField({
          name: "copyright",
          title: "حقوق النشر",
          type: "internationalizedArrayString",
          description: "مثال: © 2026 Momzy — جميع الحقوق محفوظة",
        }),
      ],
    }),
  ],
});
