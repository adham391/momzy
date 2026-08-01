import type { Service, ServiceFilters } from "@/lib/services/types";
import { sanityFetch } from "@/lib/sanity/client";

/**
 * GROQ projection — يحوّل Sanity assets إلى URL strings
 * مطابق 1:1 مع Service interface في lib/services/types.ts
 */
const SERVICE_FIELDS = `{
  "slug":             slug.current,
  title,
  type,
  category,
  duration,
  location,
  ageRange,
  ageMinMonths,
  ageMaxMonths,
  maxParticipants,
  shortDescription,
  longDescription,
  topics,
  benefits,
  faqs[]{ question, answer },
  color,
  price,
  order,
  "coverImage":       coverImage.asset->url,
  "icon":             icon.asset->url,
  "createdAt":        _createdAt,
  "updatedAt":        _updatedAt
}`;

/** جلب خدمة واحدة بالـ slug */
export async function getServiceBySlug(slug: string): Promise<Service | null> {
  const query = `*[_type == "service" && slug.current == $slug][0]${SERVICE_FIELDS}`;
  return sanityFetch<Service>(query, { slug });
}

/** جلب كل الخدمات مع فلترة اختيارية */
export async function getAllServices(filters?: ServiceFilters): Promise<Service[]> {
  const conditions: string[] = ['_type == "service"'];

  if (filters?.category) conditions.push("category == $category");
  if (filters?.type)     conditions.push("type == $type");

  const filter = conditions.join(" && ");
  const order  = "| order(order asc, _createdAt asc)";
  const query  = `*[${filter}]${order}${SERVICE_FIELDS}`;

  const params: Record<string, unknown> = {};
  if (filters?.category) params.category = filters.category;
  if (filters?.type)     params.type     = filters.type;

  const result = await sanityFetch<Service[]>(query, params);
  return result ?? [];
}

/** جلب slugs كل الخدمات — لـ generateStaticParams */
export async function getAllServiceSlugs(): Promise<string[]> {
  const query  = `*[_type == "service" && defined(slug.current)].slug.current`;
  const result = await sanityFetch<string[]>(query, {}, 3600);
  return result ?? [];
}
