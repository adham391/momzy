import type { Product } from "./types";
import { getProductBySlug } from "@/lib/sanity/queries/products";
import { SEED_PRODUCTS }    from "./seed";

/**
 * إحضار منتج واحد بالـ slug.
 *
 * المصدر: Sanity CMS (أولاً)
 * Fallback: seed.ts في بيئة التطوير فقط إذا Sanity فارغ أو غير مضبوط
 *
 * التوقيع لا يتغير — كل المكونات تعمل بدون تعديل
 */
export async function getProduct(slug: string, locale?: string): Promise<Product | null> {
  // إذا لم يُضبط projectId، ارجع للـ seed مباشرة (بيئة تطوير بدون Sanity)
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    return SEED_PRODUCTS.find((p) => p.slug === slug) ?? null;
  }

  // المصدر الأساسي: Sanity
  const sanityProduct = await getProductBySlug(slug, locale);
  if (sanityProduct) return sanityProduct;

  // Fallback: seed في بيئة التطوير فقط
  if (process.env.NODE_ENV === "development") {
    return SEED_PRODUCTS.find((p) => p.slug === slug) ?? null;
  }

  return null;
}
