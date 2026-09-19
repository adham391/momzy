import type { Metadata } from "next";
import { routing, type Locale } from "@/lib/i18n/routing";
import { siteOrigin } from "@/lib/resend/emails/brand";
import { sanityImageAt } from "@/lib/sanity/imageUrl";

/**
 * أساس SEO للموقع — اسم العلامة، روابط كل لغة، والبيانات الوصفية لكل صفحة
 * (canonical + hreflang + Open Graph + Twitter) من مكان واحد.
 */

export const SITE_NAME = "Momzy";

/** كيف قد يكتب الناس اسمنا في البحث — تربطها البيانات المنظَّمة بالموقع */
export const SITE_ALTERNATE_NAMES = ["مومزي", "מומזי", "Momzy World", "momzyworld"];

/** صورة المعاينة الافتراضية عند مشاركة رابط (واتساب، إنستغرام، فيسبوك) — 1200×630 */
export const DEFAULT_OG_IMAGE = { url: "/images/og-momzy.jpg", width: 1200, height: 630, alt: "Momzy" };

/** عرض صور المعاينة من Sanity — كافٍ لكل المنصات وخفيف على واتساب */
const OG_IMAGE_WIDTH = 1200;

/** طول الوصف الذي يعرضه Google قبل أن يقصّه */
const META_DESCRIPTION_MAX = 160;

/** لغة المحتوى في Open Graph */
const OG_LOCALE: Record<Locale, string> = { ar: "ar_IL", he: "he_IL", en: "en_US" };

/** عنوان الصفحة الرئيسية ووصفها — فيهما الاسم بالحروف العربية والعبرية كما يبحث الناس */
export const HOME_META: Record<Locale, { title: string; description: string }> = {
  ar: {
    title: "Momzy مومزي — منصة الأمومة مع الممرضة هبة حسن",
    description:
      "مومزي (Momzy) ترافق الأم والطفل من الحمل حتى السنوات الأولى مع الممرضة ومرشدة الرضاعة هبة حسن: ورشات ولقاءات فردية، صندوق مشوار أم، ومقالات موثوقة.",
  },
  he: {
    title: "Momzy מומזי — פלטפורמת האימהות עם האחות היבה חסן",
    description:
      "מומזי (Momzy) מלווה את האם והילד מההריון ועד השנים הראשונות עם האחות ויועצת ההנקה היבה חסן: סדנאות ומפגשים אישיים, מארז מסע של אמא ומאמרים אמינים.",
  },
  en: {
    title: "Momzy — Motherhood Platform with Nurse Heba Hasan",
    description:
      "Momzy supports mother and child from pregnancy through the early years with nurse Heba Hasan: workshops, one-to-one sessions, gift boxes and trusted articles.",
  },
};

/** اللغة من معامل المسار — وإلا الافتراضية */
export function asLocale(value: string): Locale {
  return (routing.locales as readonly string[]).includes(value) ? (value as Locale) : routing.defaultLocale;
}

/** رابط كامل لمسار بلغة — العربية على الجذر بلا بادئة، والعبرية والإنجليزية بـ /he و/en */
export function localizedUrl(path: string, locale: Locale): string {
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  return `${siteOrigin()}${prefix}${path}`;
}

/** رابط كامل لصورة — صور Sanity بعرض المعاينة، والمحلية مسبوقة بعنوان الموقع */
export function absoluteImageUrl(url: string, width = OG_IMAGE_WIDTH): string {
  if (url.startsWith("http")) return sanityImageAt(url, width);
  return `${siteOrigin()}${url.startsWith("/") ? "" : "/"}${url}`;
}

/** وصف بطول يعرضه Google كاملًا — يُقصّ عند آخر كلمة كاملة */
export function metaDescription(text: string | undefined, max = META_DESCRIPTION_MAX): string | undefined {
  if (!text) return undefined;
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const words = lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut;
  return `${words.replace(/[\s،,.:;—–-]+$/, "")}…`;
}

/** روابط الصفحة نفسها بكل اللغات — x-default للعربية */
function languageAlternates(path: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const l of routing.locales) languages[l] = localizedUrl(path, l);
  languages["x-default"] = localizedUrl(path, routing.defaultLocale);
  return languages;
}

interface PageSeoInput {
  /** المسار بلا بادئة لغة — "" للرئيسية، "/shop"، "/shop/<slug>" ... */
  path: string;
  locale: string;
  title: string;
  description?: string;
  /** صورة المعاينة — وإلا الافتراضية */
  image?: string;
  /** مقال: تاريخ النشر يظهر في معاينات المنصات */
  article?: { publishedTime?: string };
}

/**
 * البيانات الوصفية الكاملة لصفحة عامة: عنوان ووصف، الرابط الأساسي (canonical) ضد النسخ المكررة
 * (momzyworld.vercel.app، روابط UTM)، روابط اللغات الأخرى (hreflang)، ومعاينة المشاركة.
 */
export function pageSeo(input: PageSeoInput): Metadata {
  const locale = asLocale(input.locale);
  const url = localizedUrl(input.path, locale);
  const description = metaDescription(input.description);
  const images = input.image
    ? [{ url: absoluteImageUrl(input.image), alt: input.title }]
    : [DEFAULT_OG_IMAGE];
  const shared = {
    url,
    siteName: SITE_NAME,
    locale: OG_LOCALE[locale],
    title: input.title,
    description,
    images,
  };

  return {
    title: input.title,
    description,
    alternates: { canonical: url, languages: languageAlternates(input.path) },
    openGraph: input.article
      ? { ...shared, type: "article", publishedTime: input.article.publishedTime }
      : { ...shared, type: "website" },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description,
      images: images.map((i) => i.url),
    },
  };
}
