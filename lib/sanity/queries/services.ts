import type { Service, ServiceFilters } from "@/lib/services/types";
import { sanityFetch } from "@/lib/sanity/client";
import { tf, tl, activeLocale } from "@/lib/sanity/i18n";

/**
 * GROQ projection — يحوّل Sanity assets إلى URL strings ويحلّ الحقول المُدوّلة
 * إلى نص اللغة الفعّالة ($loc) مع سقوط للعربية.
 * المكونات تتلقى نفس string paths — لا تغيير في الـ UI layer.
 */
const SERVICE_FIELDS = `{
  "slug":             slug.current,
  ${tf("title")},
  type,
  category,
  ${tf("duration")},
  ${tf("location")},
  ${tf("ageRange")},
  ageMinMonths,
  ageMaxMonths,
  maxParticipants,
  ${tf("shortDescription")},
  ${tl("longDescription")},
  ${tl("topics")},
  ${tl("benefits")},
  faqs[]{ ${tf("question")}, ${tf("answer")} },
  color,
  price,
  order,
  "coverImage":       coverImage.asset->url,
  "icon":             icon.asset->url,
  "createdAt":        _createdAt,
  "updatedAt":        _updatedAt
}`;

/** جلب خدمة واحدة بالـ slug */
export async function getServiceBySlug(slug: string, locale?: string): Promise<Service | null> {
  const loc = await activeLocale(locale);
  const query = `*[_type == "service" && slug.current == $slug][0]${SERVICE_FIELDS}`;
  return sanityFetch<Service>(query, { slug, loc });
}

/** جلب كل الخدمات مع فلترة اختيارية */
export async function getAllServices(filters?: ServiceFilters, locale?: string): Promise<Service[]> {
  const loc = await activeLocale(locale);
  const conditions: string[] = ['_type == "service"'];

  if (filters?.category) conditions.push("category == $category");
  if (filters?.type)     conditions.push("type == $type");

  const filter = conditions.join(" && ");
  const order  = "| order(order asc, _createdAt asc)";
  const query  = `*[${filter}]${order}${SERVICE_FIELDS}`;

  const params: Record<string, unknown> = { loc };
  if (filters?.category) params.category = filters.category;
  if (filters?.type)     params.type     = filters.type;

  const result = await sanityFetch<Service[]>(query, params);
  return result ?? [];
}

/** جلب slugs كل الخدمات — لـ generateStaticParams (لا يحتاج لغة) */
export async function getAllServiceSlugs(): Promise<string[]> {
  const query  = `*[_type == "service" && defined(slug.current)].slug.current`;
  const result = await sanityFetch<string[]>(query, {}, 3600);
  return result ?? [];
}
