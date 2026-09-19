import type { MetadataRoute } from "next";
import { routing } from "@/lib/i18n/routing";
import { localizedUrl } from "@/lib/seo/site";
import { getAllProductSlugs } from "@/lib/sanity/queries/products";
import { getAllServiceSlugs } from "@/lib/sanity/queries/services";
import { getAllArticleSlugs } from "@/lib/sanity/queries/articles";

/** تُبنى الخريطة من جديد كل ساعة — فيظهر ما يُنشر في Studio دون نشر للموقع */
export const revalidate = 3600;

/** الصفحات العامة الثابتة — بلا صفحات العميلة الخاصة (الدفع والطلب والحجز والقراءة والمكتبة) */
const STATIC_PATHS = ["", "/shop", "/services", "/articles", "/about", "/contact", "/privacy", "/terms"];

/** مدخل لكل لغة من الصفحة، وكلٌّ منها يدلّ Google على نسخها الأخرى (hreflang) */
function entriesFor(path: string): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(routing.locales.map((l) => [l, localizedUrl(path, l)]));
  return routing.locales.map((locale) => ({ url: localizedUrl(path, locale), alternates: { languages } }));
}

/**
 * خريطة الموقع لمحركات البحث — /sitemap.xml
 * الصفحات الثابتة + كل منتج وخدمة، والمقالات المنشورة فقط، باللغات الثلاث.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, services, articles] = await Promise.all([
    getAllProductSlugs(),
    getAllServiceSlugs(),
    getAllArticleSlugs(),
  ]);
  const paths = [
    ...STATIC_PATHS,
    ...products.map((slug) => `/shop/${slug}`),
    ...services.map((slug) => `/services/${slug}`),
    ...articles.map((slug) => `/articles/${slug}`),
  ];
  return paths.flatMap(entriesFor);
}
