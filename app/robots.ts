import type { MetadataRoute } from "next";
import { routing } from "@/lib/i18n/routing";
import { siteOrigin } from "@/lib/resend/emails/brand";

/** مسارات بلا لغة لا تُؤرشَف: اللوحة والاستوديو وواجهات API */
const PRIVATE_ROOT_PATHS = ["/admin", "/studio", "/api"];

/** صفحات خاصة بكل عميلة أو تقنية — بكل لغة (الدفع والطلب والحجز والقراءة والمكتبة وإلغاء النشرة) */
const PRIVATE_LOCALIZED_PATHS = ["/checkout", "/order", "/booking", "/read", "/library", "/newsletter", "/not-available"];

/** /robots.txt — كل الموقع مفتوح للأرشفة إلا الخاص، مع رابط خريطة الموقع */
export default function robots(): MetadataRoute.Robots {
  const prefixes = routing.locales.map((l) => (l === routing.defaultLocale ? "" : `/${l}`));
  const disallow = [
    ...PRIVATE_ROOT_PATHS,
    ...prefixes.flatMap((prefix) => PRIVATE_LOCALIZED_PATHS.map((path) => `${prefix}${path}`)),
  ];
  return {
    rules: { userAgent: "*", allow: "/", disallow },
    sitemap: `${siteOrigin()}/sitemap.xml`,
  };
}
