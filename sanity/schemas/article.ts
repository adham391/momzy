import { defineType, defineField } from "sanity";
import { arValue } from "./i18n";
import { ARTICLE_CATEGORIES, CATEGORY_TITLES_AR } from "../../lib/articles/categories";

/**
 * مقال — document عادي (عدّة نسخ).
 * تظهر أحدث 3 في الصفحة الرئيسية، وكلها في /articles.
 *
 * العنوان والمقتطف والمحتوى مُدوّلة (ar/he/en). التصنيف مفتاح ثابت
 * يُترجَم من messages لا من هنا — انظر lib/articles/categories.ts.
 */
export const article = defineType({
  name: "article",
  title: "مقال",
  type: "document",
  groups: [
    { name: "content", title: "المحتوى", default: true },
    { name: "meta", title: "التصنيف والنشر" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "العنوان",
      type: "internationalizedArrayString",
      group: "content",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "الرابط (Slug)",
      type: "slug",
      group: "meta",
      // المصدر = القيمة العربية من الحقل المُدوّل
      options: { source: "title.0.value", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "category",
      title: "التصنيف",
      type: "string",
      group: "meta",
      description: "يُفلتَر به في صفحة المقالات، ويظهر كـ chip فوق المقال",
      options: {
        list: ARTICLE_CATEGORIES.map((value) => ({ value, title: CATEGORY_TITLES_AR[value] })),
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "coverImage",
      title: "صورة الغلاف",
      type: "image",
      group: "content",
      options: { hotspot: true },
      fields: [{ name: "alt", type: "string", title: "وصف الصورة (للقارئ الضرير)" }],
    }),
    defineField({
      name: "excerpt",
      title: "مقتطف قصير",
      type: "internationalizedArrayText",
      group: "content",
      description: "سطران يظهران في بطاقة المقال وفي نتائج البحث",
    }),
    defineField({
      name: "body",
      title: "محتوى المقال",
      type: "internationalizedArrayArticleBody",
      group: "content",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "sources",
      title: "المصادر",
      type: "array",
      group: "content",
      of: [{ type: "string" }],
      description:
        "مرجع في كل سطر — تظهر في صندوق أسفل المقال. لا تُترجَم: أسماء المراجع تبقى بلغتها.",
    }),
    defineField({
      name: "publishedAt",
      title: "تاريخ النشر",
      type: "datetime",
      group: "meta",
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "isPublished",
      title: "منشور؟",
      type: "boolean",
      group: "meta",
      initialValue: true,
      description: "أزيليه لإخفاء المقال مؤقتًا",
    }),
  ],
  orderings: [
    { title: "الأحدث", name: "publishedDesc", by: [{ field: "publishedAt", direction: "desc" }] },
  ],
  preview: {
    select: { title: "title", subtitle: "category", media: "coverImage" },
    prepare({ title, subtitle, media }) {
      const key = subtitle as keyof typeof CATEGORY_TITLES_AR;
      return {
        title: arValue(title) ?? "مقال بدون عنوان",
        subtitle: CATEGORY_TITLES_AR[key] ?? "",
        media,
      };
    },
  },
});
