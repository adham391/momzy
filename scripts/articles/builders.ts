import { randomUUID } from "crypto";
import type { ArticleCategory } from "../../lib/articles/categories";

/**
 * أدوات بناء المقالات ورفعها.
 *
 * المحتوى يُكتب كبنية Portable Text مباشرة لا كنصّ يُحوَّل: التحويل التلقائي
 * يخطئ في تمييز العنوان من الفقرة ويفقد التشديد، والمقال الطبي لا يحتمل ذلك.
 * بعد الرفع تُعدّله هبة من /studio كأي مقال.
 */

export type Lang = "ar" | "he" | "en";
export const LANGS: Lang[] = ["ar", "he", "en"];

type Span = { _type: "span"; _key: string; text: string; marks: string[] };

export type Block = {
  _type: "block";
  _key: string;
  style: string;
  markDefs: [];
  children: Span[];
  listItem?: "bullet";
  level?: number;
};

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

/** نصّ عادي، أو [نص, "strong"] لجزء مشدَّد */
export type Piece = string | [string, ...string[]];

function spans(pieces: Piece[]): Span[] {
  return pieces.map((piece) => {
    const [text, ...marks] = Array.isArray(piece) ? piece : [piece];
    return { _type: "span" as const, _key: key(), text, marks };
  });
}

function block(style: string, pieces: Piece[], list?: true): Block {
  return {
    _type: "block",
    _key: key(),
    style,
    markDefs: [],
    children: spans(pieces),
    ...(list ? { listItem: "bullet" as const, level: 1 } : {}),
  };
}

export const p = (...pieces: Piece[]) => block("normal", pieces);
export const h2 = (text: string) => block("h2", [text]);
export const h3 = (text: string) => block("h3", [text]);
export const li = (...pieces: Piece[]) => block("normal", pieces, true);
export const quote = (text: string) => block("blockquote", [text]);

/** نصّ المقال في لغة واحدة */
export interface Content {
  title: string;
  excerpt: string;
  body: Block[];
}

/** مقال جاهز للرفع */
export interface ArticleSeed {
  /** _id ثابت — يجعل إعادة التشغيل تحديثًا لا تكرارًا */
  id: string;
  slug: string;
  category: ArticleCategory;
  /** لا تُترجَم: أسماء المؤسسات والدوريات تبقى بلغتها */
  sources: string[];
  content: Record<Lang, Content>;
}

const VALUE_TYPE = {
  string: "internationalizedArrayStringValue",
  text: "internationalizedArrayTextValue",
  articleBody: "internationalizedArrayArticleBodyValue",
} as const;

/** يبني حقلاً مُدوّلاً بلغاته الثلاث */
function intl(
  type: keyof typeof VALUE_TYPE,
  content: Record<Lang, Content>,
  pick: (c: Content) => unknown
) {
  return LANGS.map((language) => ({
    _key: language,
    _type: VALUE_TYPE[type],
    language,
    value: pick(content[language]),
  }));
}

/**
 * يرفع مقالاً — idempotent.
 * `createOrReplace` يمسح ما لا نمرّره، فنقرأ تاريخ النشر أولاً كي لا
 * يُعاد ضبطه في كل تشغيل فيقفز المقال إلى رأس القائمة بلا سبب.
 */
export async function seedArticle(article: ArticleSeed): Promise<void> {
  const { sanityWriteClient } = await import("../../lib/sanity/client");

  const existing = await sanityWriteClient.fetch<{ publishedAt?: string } | null>(
    `*[_id == $id][0]{ publishedAt }`,
    { id: article.id }
  );

  await sanityWriteClient.createOrReplace({
    _id: article.id,
    _type: "article",
    title: intl("string", article.content, (c) => c.title),
    slug: { _type: "slug", current: article.slug },
    category: article.category,
    excerpt: intl("text", article.content, (c) => c.excerpt),
    body: intl("articleBody", article.content, (c) => c.body),
    sources: article.sources,
    isPublished: true,
    publishedAt: existing?.publishedAt ?? new Date().toISOString(),
  });

  const blocks = LANGS.map((l) => article.content[l].body.length).join("/");
  console.log(
    `  ${existing ? "↻" : "＋"} /articles/${article.slug} — ${blocks} كتلة · ${article.sources.length} مصادر`
  );
  console.log(`     ${article.content.ar.title}`);
}
