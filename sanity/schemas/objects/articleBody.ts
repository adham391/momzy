import { defineType, defineArrayMember } from "sanity";

/**
 * محتوى المقال — Portable Text.
 *
 * يُسجَّل كنوع مستقلّ كي تغلّفه إضافة internationalized-array فيصير
 * `internationalizedArrayArticleBody` — نسخة كاملة لكل لغة، لا نصًّا واحدًا
 * يُترجَم جزئيًا. (الإضافة تسمّي النوع بـ PascalCase: articleBody ⇒ ArticleBody.)
 *
 * الأنماط مقصودة القِلّة: العناوين الفرعية والفقرات والقوائم والاقتباس فقط.
 * لا H1 — عنوان المقال وحده يشغلها، فلا يُنافسه عنوان داخل النص.
 */
export const articleBody = defineType({
  name: "articleBody",
  title: "المحتوى",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "فقرة", value: "normal" },
        { title: "عنوان فرعي", value: "h2" },
        { title: "عنوان أصغر", value: "h3" },
        { title: "اقتباس", value: "blockquote" },
      ],
      lists: [
        { title: "نقاط", value: "bullet" },
        { title: "ترقيم", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "عريض", value: "strong" },
          { title: "مائل", value: "em" },
        ],
        annotations: [
          {
            name: "link",
            type: "object",
            title: "رابط",
            fields: [
              {
                name: "href",
                type: "url",
                title: "العنوان",
                validation: (r) => r.required(),
              },
            ],
          },
        ],
      },
    }),
    defineArrayMember({
      type: "image",
      title: "صورة داخل المقال",
      options: { hotspot: true },
      fields: [
        { name: "alt", type: "string", title: "وصف الصورة (للقارئ الضرير)" },
      ],
    }),
  ],
});
