import { defineType, defineField } from "sanity";

/**
 * مقال — document عادي (عدّة نسخ)
 * تظهر أحدث 3 في الصفحة الرئيسية، وكلها في /articles لاحقًا.
 */
export const article = defineType({
  name: "article",
  title: "مقال",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "العنوان",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "الرابط (Slug)",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "category",
      title: "التصنيف",
      type: "string",
      description: "يظهر كـ chip فوق المقال (مثال: رضاعة، ما بعد الولادة)",
    }),
    defineField({
      name: "coverImage",
      title: "صورة الغلاف",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "excerpt",
      title: "مقتطف قصير",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "publishedAt",
      title: "تاريخ النشر",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "body",
      title: "محتوى المقال",
      type: "array",
      of: [{ type: "block" }, { type: "image", options: { hotspot: true } }],
    }),
    defineField({
      name: "isPublished",
      title: "منشور؟",
      type: "boolean",
      initialValue: true,
      description: "أزيليه لإخفاء المقال مؤقتًا",
    }),
  ],
  orderings: [
    { title: "الأحدث", name: "publishedDesc", by: [{ field: "publishedAt", direction: "desc" }] },
  ],
  preview: {
    select: { title: "title", subtitle: "category", media: "coverImage" },
  },
});
