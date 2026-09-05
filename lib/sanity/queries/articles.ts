import type { PortableTextBlock } from "@portabletext/types";
import { sanityClient, sanityFetch } from "@/lib/sanity/client";
import { urlFor } from "@/lib/sanity/image";
import { tf, activeLocale, type AppLocale } from "@/lib/sanity/i18n";
import { isArticleCategory, CATEGORY_CHIP_COLOR, type ArticleCategory } from "@/lib/articles/categories";
import { ARTICLE_PREVIEWS } from "@/lib/utils/constants";

/**
 * استعلامات المقالات.
 *
 * التصنيف يُقرأ كمفتاح ثابت (`sleep`) لا كنص معروض — الترجمة تحدث في
 * الواجهة من messages، فيبقى الفلتر صالحًا في اللغات الثلاث.
 */

/** بطاقة مقال — للقوائم والصفحة الرئيسية */
export interface ArticleCard {
  title: string;
  slug?: string;
  href: string;
  /** مفتاح التصنيف — null لبطاقات الاحتياطي الثابتة */
  category: ArticleCategory | null;
  /** اسم تصنيف جاهز — للاحتياطي الثابت وحده، إذ لا مفتاح له يُترجَم */
  staticCategoryLabel?: string;
  chipColor: "rose" | "teal" | "yellow";
  excerpt?: string;
  /** تاريخ منسّق للعرض */
  publishedAt: string;
  /** ISO — للترتيب وللـ <time> */
  publishedIso?: string;
  /** رابط مقصوص لمقاس البطاقة (3:2) */
  coverImage?: string;
  /** رابط مقصوص لمقاس الهيرو (16:9) */
  coverImageLarge?: string;
  coverAlt?: string;
  readMinutes?: number;
  /** الاحتياطي الثابت فقط */
  emoji?: string;
  imageBg?: string;
}

/** مقال كامل — لصفحة /articles/[slug] */
export interface ArticleFull extends ArticleCard {
  slug: string;
  body: PortableTextBlock[];
  sources: string[];
}

const CHIP_COLORS: ("rose" | "teal" | "yellow")[] = ["rose", "teal", "yellow"];

/**
 * لغة عرض التاريخ. العربية تُجبَر على الأرقام اللاتينية (`-u-nu-latn`):
 * الافتراضي فيها أرقام هندية (٥) بينما بقية الموقع — الأسعار والكميات —
 * لاتينية، فلا نخلط النظامين في صفحة واحدة.
 */
const DATE_LOCALE: Record<AppLocale, string> = {
  ar: "ar-u-nu-latn",
  he: "he",
  en: "en-GB",
};

/**
 * تنسيق تاريخ ISO بلغة الصفحة: «5 سبتمبر 2026» · «5 בספטמבר 2026» · «5 September 2026».
 * timeZone: UTC يجعل الناتج واحدًا على السيرفر والمتصفّح — فلا اختلاف hydration.
 */
function formatDate(iso: string | undefined, loc: AppLocale): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(DATE_LOCALE[loc], {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  }).format(d);
}

/**
 * زمن القراءة بالدقائق — يُحسب من النص لا يُدخَل يدويًا،
 * فلا يتقادم حين تُعدّل هبة المقال.
 */
/**
 * سرعة القراءة الصامتة بالكلمة/دقيقة — لكل لغة رقمها.
 * الرقم الشائع (200) إنجليزي، والعربية تُقرأ أبطأ لكثافة حروفها وغياب
 * التشكيل، فاستعماله لها يَعِد القارئة بأقلّ مما ستقضيه فعلًا.
 */
const WORDS_PER_MINUTE: Record<AppLocale, number> = { ar: 170, he: 190, en: 230 };

export function readingMinutes(body: PortableTextBlock[] | undefined, loc: AppLocale): number {
  if (!body?.length) return 1;
  let words = 0;
  for (const block of body) {
    if (block._type !== "block") continue;
    const children = (block as { children?: { text?: string }[] }).children ?? [];
    for (const child of children) {
      words += (child.text ?? "").trim().split(/\s+/).filter(Boolean).length;
    }
  }
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE[loc]));
}

/** لون الـ chip: ثابت حسب التصنيف، ودوّار للاحتياطي بلا تصنيف */
function chipFor(category: string | undefined, index: number): {
  category: ArticleCategory | null;
  chipColor: "rose" | "teal" | "yellow";
} {
  if (isArticleCategory(category)) {
    return { category, chipColor: CATEGORY_CHIP_COLOR[category] };
  }
  return { category: null, chipColor: CHIP_COLORS[index % 3] };
}

/** حقول البطاقة المشتركة في GROQ */
const CARD_FIELDS = `
  "slug": slug.current, ${tf("title")}, ${tf("excerpt")}, category,
  "cover": coverImage, "coverAlt": coverImage.alt,
  publishedAt, ${tf("body")}
`;

interface RawCard {
  slug?: string;
  title: string;
  excerpt?: string;
  category?: string;
  /** كائن الصورة الخام — يحمل مرجع الأصل وhotspot فيمكن القصّ */
  cover?: { asset?: { _ref?: string } };
  coverAlt?: string;
  publishedAt?: string;
  body?: PortableTextBlock[];
}

/**
 * مقاسات الغلاف. نطلبها من Sanity مقصوصة بدل تحميل الأصل (1400px+)
 * في مكان 300px — وfit("crop") يحترم نقطة التركيز التي تضبطها هبة،
 * فلا يُقصّ رأس الطفل حين لا تكون الصورة بنسبة الإطار.
 */
const COVER_CARD = { w: 720, h: 480 };   // 3:2
const COVER_HERO = { w: 1600, h: 900 };  // 16:9

function coverUrl(cover: RawCard["cover"], size: { w: number; h: number }): string | undefined {
  if (!cover?.asset?._ref) return undefined;
  return urlFor(cover).width(size.w).height(size.h).fit("crop").auto("format").url();
}

function toCard(a: RawCard, i: number, loc: AppLocale): ArticleCard {
  const { category, chipColor } = chipFor(a.category, i);
  return {
    title: a.title,
    slug: a.slug,
    href: a.slug ? `/articles/${a.slug}` : "/articles",
    category,
    chipColor,
    excerpt: a.excerpt,
    publishedAt: formatDate(a.publishedAt, loc),
    publishedIso: a.publishedAt,
    coverImage: coverUrl(a.cover, COVER_CARD),
    coverImageLarge: coverUrl(a.cover, COVER_HERO),
    coverAlt: a.coverAlt,
    readMinutes: readingMinutes(a.body, loc),
  };
}

/** الاحتياطي — البطاقات الثابتة، تُعرض فقط حين لا مقال في Sanity */
const FALLBACK: ArticleCard[] = ARTICLE_PREVIEWS.map((a) => ({
  title: a.title,
  href: "/articles",
  category: null,
  staticCategoryLabel: a.chipLabel,
  // لون البطاقة الاحتياطية مُصمَّم في constants — لا يُشتقّ من تصنيف غير موجود
  chipColor: a.chipColor,
  publishedAt: a.publishedAt,
  emoji: a.emoji,
  imageBg: a.imageBg,
}));

/** أحدث 3 مقالات للصفحة الرئيسية — Sanity أولاً، fallback ثابت */
export async function getHomeArticles(locale?: string): Promise<ArticleCard[]> {
  const loc = await activeLocale(locale);
  const query = `*[_type == "article" && isPublished == true] | order(publishedAt desc)[0...3]{${CARD_FIELDS}}`;
  const data = await sanityFetch<RawCard[]>(query, { loc }, 60);
  if (!data || data.length === 0) return FALLBACK;
  return data.map((a, i) => toCard(a, i, loc));
}

/** كل المقالات المنشورة — لصفحة /articles */
export async function getArticles(locale?: string): Promise<ArticleCard[]> {
  const loc = await activeLocale(locale);
  const query = `*[_type == "article" && isPublished == true] | order(publishedAt desc){${CARD_FIELDS}}`;
  const data = await sanityFetch<RawCard[]>(query, { loc }, 60);
  return (data ?? []).map((a, i) => toCard(a, i, loc));
}

/** مقال واحد بالـ slug — null إن لم يوجد أو كان مخفيًا */
export async function getArticleBySlug(slug: string, locale?: string): Promise<ArticleFull | null> {
  const loc = await activeLocale(locale);
  const query = `*[_type == "article" && slug.current == $slug && isPublished == true][0]{
    ${CARD_FIELDS}, "sources": coalesce(sources, [])
  }`;
  const data = await sanityFetch<(RawCard & { sources?: string[] }) | null>(query, { loc, slug }, 60);
  if (!data?.slug || !data.title) return null;

  return {
    ...toCard(data, 0, loc),
    slug: data.slug,
    body: data.body ?? [],
    sources: data.sources ?? [],
  };
}

/**
 * مقالات مقترحة — من التصنيف نفسه أولاً، ثم الأحدث لتكملة العدد.
 * تستثني المقال الحالي دائمًا.
 */
export async function getRelatedArticles(
  slug: string,
  category: ArticleCategory | null,
  locale?: string,
  limit = 3
): Promise<ArticleCard[]> {
  const loc = await activeLocale(locale);
  const query = `{
    "same": *[_type == "article" && isPublished == true && slug.current != $slug && category == $category]
      | order(publishedAt desc)[0...$limit]{${CARD_FIELDS}},
    "recent": *[_type == "article" && isPublished == true && slug.current != $slug]
      | order(publishedAt desc)[0...$limit]{${CARD_FIELDS}}
  }`;
  const data = await sanityFetch<{ same: RawCard[]; recent: RawCard[] }>(
    query,
    { loc, slug, category: category ?? "", limit },
    60
  );
  if (!data) return [];

  const picked: RawCard[] = [...(data.same ?? [])];
  for (const a of data.recent ?? []) {
    if (picked.length >= limit) break;
    if (!picked.some((p) => p.slug === a.slug)) picked.push(a);
  }
  return picked.slice(0, limit).map((a, i) => toCard(a, i, loc));
}

/**
 * كل الـ slugs — لـ generateStaticParams.
 * يستعمل العميل مباشرة لا sanityFetch: هذه تُنفَّذ وقت البناء، وفشلها
 * الصامت يعني موقعًا بلا صفحات مقالات — نفضّل أن يظهر الخطأ.
 */
export async function getAllArticleSlugs(): Promise<string[]> {
  try {
    const rows = await sanityClient.fetch<{ slug?: string }[]>(
      `*[_type == "article" && isPublished == true && defined(slug.current)]{ "slug": slug.current }`
    );
    return (rows ?? []).map((r) => r.slug).filter((s): s is string => Boolean(s));
  } catch {
    return [];
  }
}
