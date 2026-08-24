import type { Service, ServiceFilters } from "./types";
import { getAllServices } from "@/lib/sanity/queries/services";
import { SEED_SERVICES } from "./seed";

/**
 * إحضار قائمة الخدمات مع فلترة اختيارية.
 *
 * المصدر: Sanity CMS (أولاً)
 * Fallback: seed.ts في بيئة التطوير فقط إذا Sanity فارغ أو غير مضبوط
 */
export async function getServices(filters?: ServiceFilters, locale?: string): Promise<Service[]> {
  // إذا لم يُضبط projectId، ارجع للـ seed مباشرة
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    return applyFiltersToSeed(filters);
  }

  // المصدر الأساسي: Sanity
  const sanityServices = await getAllServices(filters, locale);
  if (sanityServices.length > 0) return sanityServices;

  // Fallback: seed في بيئة التطوير فقط
  if (process.env.NODE_ENV === "development") {
    return applyFiltersToSeed(filters);
  }

  return [];
}

/** تطبيق الفلاتر على بيانات الـ seed (للـ fallback فقط) */
function applyFiltersToSeed(filters?: ServiceFilters): Service[] {
  let services = [...SEED_SERVICES];

  if (filters?.category) {
    services = services.filter((s) => s.category === filters.category);
  }
  if (filters?.type) {
    services = services.filter((s) => s.type === filters.type);
  }

  return services.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}
