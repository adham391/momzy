import type { Locale } from "@/lib/i18n/routing";
import type { Product } from "@/lib/products/types";
import type { ArticleFull } from "@/lib/sanity/queries/articles";
import type { Service } from "@/lib/services/types";
import { isDigitalProduct } from "@/lib/products/helpers";
import { siteOrigin } from "@/lib/resend/emails/brand";
import { SOCIAL_LINKS } from "@/lib/sanity/queries/siteSettings";
import { SUPPORT_EMAIL } from "@/lib/utils/contactEmail";
import { SITE_ALTERNATE_NAMES, SITE_NAME, absoluteImageUrl, localizedUrl, metaDescription } from "./site";

/**
 * البيانات المنظَّمة (schema.org JSON-LD) — تخبر Google مَن نحن وما في كل صفحة:
 * العلامة وهبة (لبحث الاسم ولوحة المعرفة)، المنتج بسعره وتوفّره وشحنه، المقال بكاتبته،
 * الخدمة بمقدّمتها، ومسار التنقّل. لا تقييمات هنا — لا نختلقها.
 */

const SCHEMA = "https://schema.org";
const orgId = () => `${siteOrigin()}/#organization`;
const websiteId = () => `${siteOrigin()}/#website`;
const hebaId = () => `${siteOrigin()}/#heba`;

/** شعار العلامة كما يطلبه Google (مربع أو مستطيل، بأبعاده) */
const LOGO = { path: "/icons/momzy-logo.png", width: 1280, height: 706 };

/** صورة هبة الرسمية */
const HEBA_PHOTO = "/images/heba.jpg";

const HEBA_NAME: Record<Locale, string> = { ar: "هبة حسن", he: "היבה חסן", en: "Heba Hasan" };
const HEBA_JOB: Record<Locale, string> = {
  ar: "ممرضة معتمدة ومرشدة رضاعة ومرافقة ولادة",
  he: "אחות מוסמכת, יועצת הנקה ודולה",
  en: "Certified nurse, lactation consultant and birth doula",
};

/** حسابات العلامة في الشبكات — روابط حقيقية فقط (بلا «#») */
function socialProfiles(): string[] {
  const links = [SOCIAL_LINKS.instagram, SOCIAL_LINKS.tiktok, SOCIAL_LINKS.whatsappChannel];
  return links.filter((u): u is string => Boolean(u && u.startsWith("http")));
}

/** هبة كشخص — مرجع واحد (@id) تشير إليه المقالات والعلامة */
function hebaRef(locale: Locale) {
  return { "@type": "Person", "@id": hebaId(), name: HEBA_NAME[locale], url: localizedUrl("/about", locale) };
}

/** العلامة كمنظمة — مرجع واحد (@id) للناشر والبائع ومقدّم الخدمة */
function orgRef() {
  return { "@type": "Organization", "@id": orgId(), name: SITE_NAME };
}

/** العلامة والموقع وهبة — في كل صفحة */
export function siteJsonLd(locale: Locale) {
  return {
    "@context": SCHEMA,
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId(),
        name: SITE_NAME,
        alternateName: SITE_ALTERNATE_NAMES,
        url: siteOrigin(),
        logo: { "@type": "ImageObject", url: absoluteImageUrl(LOGO.path), width: LOGO.width, height: LOGO.height },
        email: SUPPORT_EMAIL,
        sameAs: socialProfiles(),
        founder: { "@id": hebaId() },
        areaServed: { "@type": "Country", name: "Israel" },
        knowsLanguage: ["ar", "he", "en"],
      },
      {
        "@type": "Person",
        "@id": hebaId(),
        name: HEBA_NAME[locale],
        jobTitle: HEBA_JOB[locale],
        image: absoluteImageUrl(HEBA_PHOTO),
        url: localizedUrl("/about", locale),
        worksFor: { "@id": orgId() },
        sameAs: socialProfiles().filter((u) => !u.includes("whatsapp")),
      },
      {
        "@type": "WebSite",
        "@id": websiteId(),
        name: SITE_NAME,
        alternateName: SITE_ALTERNATE_NAMES,
        url: siteOrigin(),
        inLanguage: locale,
        publisher: { "@id": orgId() },
      },
    ],
  };
}

/** المنتج بسعره بالشيكل وتوفّره — والشحن المجاني حين يُعلَّم في Sanity */
export function productJsonLd(product: Product, locale: Locale) {
  const url = localizedUrl(`/shop/${product.slug}`, locale);
  const images = [product.mainImage, ...(product.gallery ?? [])]
    .filter((u): u is string => Boolean(u))
    .map((u) => absoluteImageUrl(u));
  const freeShipping = !isDigitalProduct(product) && product.shippingInfo?.freeShipping === true;

  return {
    "@context": SCHEMA,
    "@type": "Product",
    name: product.title,
    description: metaDescription(product.description, 500),
    image: [...new Set(images)],
    sku: product.slug,
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "ILS",
      price: product.price,
      availability: product.inStock ? `${SCHEMA}/InStock` : `${SCHEMA}/OutOfStock`,
      itemCondition: `${SCHEMA}/NewCondition`,
      seller: orgRef(),
      ...(freeShipping
        ? {
            shippingDetails: {
              "@type": "OfferShippingDetails",
              shippingRate: { "@type": "MonetaryAmount", value: 0, currency: "ILS" },
              shippingDestination: { "@type": "DefinedRegion", addressCountry: "IL" },
            },
          }
        : {}),
    },
  };
}

/** المقال بكاتبته هبة وناشره Momzy */
export function articleJsonLd(article: ArticleFull, locale: Locale) {
  const url = localizedUrl(`/articles/${article.slug}`, locale);
  const cover = article.coverImageLarge ?? article.coverImage;
  return {
    "@context": SCHEMA,
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    ...(cover ? { image: [absoluteImageUrl(cover)] } : {}),
    ...(article.publishedIso ? { datePublished: article.publishedIso } : {}),
    inLanguage: locale,
    author: hebaRef(locale),
    publisher: {
      ...orgRef(),
      logo: { "@type": "ImageObject", url: absoluteImageUrl(LOGO.path) },
    },
    mainEntityOfPage: url,
  };
}

/** الخدمة (ورشة أو لقاء) بمقدّمتها وسعرها */
export function serviceJsonLd(service: Service, locale: Locale) {
  const url = localizedUrl(`/services/${service.slug}`, locale);
  return {
    "@context": SCHEMA,
    "@type": "Service",
    name: service.title,
    description: service.shortDescription,
    url,
    ...(service.coverImage ? { image: absoluteImageUrl(service.coverImage) } : {}),
    provider: orgRef(),
    areaServed: { "@type": "Country", name: "Israel" },
    ...(service.price
      ? { offers: { "@type": "Offer", url, price: service.price, priceCurrency: "ILS" } }
      : {}),
  };
}

/** مسار التنقّل (الرئيسية ← القسم ← الصفحة) — يظهر في نتائج البحث بدل الرابط الخام */
export function breadcrumbJsonLd(locale: Locale, items: { name: string; path: string }[]) {
  return {
    "@context": SCHEMA,
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: localizedUrl(item.path, locale),
    })),
  };
}
