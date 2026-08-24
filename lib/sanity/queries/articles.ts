import { sanityFetch } from "@/lib/sanity/client";
import { tf, activeLocale } from "@/lib/sanity/i18n";
import { ARTICLE_PREVIEWS } from "@/lib/utils/constants";

/** بطاقة مقال موحّدة (سواء من Sanity أو الاحتياطي) */
export interface ArticleCard {
  title: string;
  href: string;
  category: string;
  chipColor: "rose" | "teal" | "yellow";
  publishedAt: string;
  coverImage?: string;
  emoji?: string;
  imageBg?: string;
}

const CHIP_COLORS: ("rose" | "teal" | "yellow")[] = ["rose", "teal", "yellow"];
const AR_MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

/** تنسيق تاريخ ISO إلى "5 نوفمبر, 2025" — ثابت (بلا locale) لتجنّب hydration */
function formatDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return `${d.getUTCDate()} ${AR_MONTHS[d.getUTCMonth()]}, ${d.getUTCFullYear()}`;
}

/** الاحتياطي — المقالات الثابتة الحالية (إيموجي) */
const FALLBACK: ArticleCard[] = ARTICLE_PREVIEWS.map((a) => ({
  title: a.title,
  href: "/articles",
  category: a.chipLabel,
  chipColor: a.chipColor,
  publishedAt: a.publishedAt,
  emoji: a.emoji,
  imageBg: a.imageBg,
}));

/** أحدث 3 مقالات للصفحة الرئيسية — Sanity أولاً، fallback ثابت */
export async function getHomeArticles(locale?: string): Promise<ArticleCard[]> {
  const loc = await activeLocale(locale);
  const query = `*[_type == "article" && isPublished == true] | order(publishedAt desc)[0...3]{
    "slug": slug.current, ${tf("title")}, category,
    "coverImage": coverImage.asset->url, publishedAt
  }`;

  const data = await sanityFetch<Array<{ slug?: string; title: string; category?: string; coverImage?: string; publishedAt?: string }>>(query, { loc }, 60);
  if (!data || data.length === 0) return FALLBACK;

  return data.map((a, i) => ({
    title: a.title,
    href: a.slug ? `/articles/${a.slug}` : "/articles",
    category: a.category || "مقال",
    chipColor: CHIP_COLORS[i % 3],
    publishedAt: formatDate(a.publishedAt),
    coverImage: a.coverImage,
  }));
}
