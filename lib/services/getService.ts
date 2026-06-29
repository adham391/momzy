import type { Service } from "./types";
import { getServiceBySlug } from "@/lib/sanity/queries/services";
import { SEED_SERVICES } from "./seed";

/**
 * إحضار خدمة واحدة بالـ slug.
 *
 * المصدر: Sanity CMS (أولاً)
 * Fallback: seed.ts في بيئة التطوير فقط إذا Sanity فارغ أو غير مضبوط
 */
export async function getService(slug: string): Promise<Service | null> {
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    return SEED_SERVICES.find((s) => s.slug === slug) ?? null;
  }

  const sanityService = await getServiceBySlug(slug);
  if (sanityService) return sanityService;

  if (process.env.NODE_ENV === "development") {
    return SEED_SERVICES.find((s) => s.slug === slug) ?? null;
  }

  return null;
}
