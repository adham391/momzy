import { randomUUID } from "crypto";
import { readFileSync } from "fs";
import { basename, resolve } from "path";
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

/** صورة الغلاف — تُرفع فقط لمقال لا غلاف له بعد */
export interface CoverSeed {
  /** مسار الصورة نسبةً إلى جذر المستودع */
  file: string;
  /** وصف الصورة للقارئ الضرير — حقل alt في Studio (غير مُدوّل) */
  alt: string;
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
  cover?: CoverSeed;
}

/** صورة Sanity كما تُخزَّن في المقال — تُمرَّر كما هي دون قراءة حقولها */
type SanityImage = Record<string, unknown>;

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

/** يرفع ملف الغلاف إلى Sanity — رفع الملف نفسه مرة ثانية يعيد الأصل نفسه لا نسخة جديدة */
async function uploadCover(cover: CoverSeed): Promise<SanityImage> {
  const { sanityWriteClient } = await import("../../lib/sanity/client");
  const file = resolve(process.cwd(), cover.file);
  const asset = await sanityWriteClient.assets.upload("image", readFileSync(file), {
    filename: basename(file),
  });
  return { _type: "image", asset: { _type: "reference", _ref: asset._id }, alt: cover.alt };
}

/**
 * يرفع مقالاً — idempotent.
 * `createOrReplace` يمسح ما لا نمرّره، فنقرأ أولاً ما لا يأتي من ملف المقال:
 * تاريخ النشر (كي لا يقفز المقال إلى رأس القائمة في كل تشغيل) والغلاف
 * (تغيّره هبة من Studio — وكان كل تشغيل يمحوه). ملف الغلاف يُرفع فقط لمقال بلا غلاف.
 */
export async function seedArticle(article: ArticleSeed): Promise<void> {
  const { sanityWriteClient } = await import("../../lib/sanity/client");

  const existing = await sanityWriteClient.fetch<{ publishedAt?: string; coverImage?: SanityImage } | null>(
    `*[_id == $id][0]{ publishedAt, coverImage }`,
    { id: article.id }
  );
  const coverImage =
    existing?.coverImage ?? (article.cover ? await uploadCover(article.cover) : undefined);

  await sanityWriteClient.createOrReplace({
    _id: article.id,
    _type: "article",
    title: intl("string", article.content, (c) => c.title),
    slug: { _type: "slug", current: article.slug },
    category: article.category,
    excerpt: intl("text", article.content, (c) => c.excerpt),
    body: intl("articleBody", article.content, (c) => c.body),
    sources: article.sources,
    ...(coverImage ? { coverImage } : {}),
    isPublished: true,
    publishedAt: existing?.publishedAt ?? new Date().toISOString(),
  });

  const blocks = LANGS.map((l) => article.content[l].body.length).join("/");
  const cover = existing?.coverImage ? "غلاف محفوظ" : coverImage ? "غلاف مرفوع" : "بلا غلاف";
  console.log(
    `  ${existing ? "↻" : "＋"} /articles/${article.slug} — ${blocks} كتلة · ${article.sources.length} مصادر · ${cover}`
  );
  console.log(`     ${article.content.ar.title}`);
}
