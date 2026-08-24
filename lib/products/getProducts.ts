import type { Product, ProductFilters } from "./types";
import { getAllProducts, getProductCategories as getSanityCategories } from "@/lib/sanity/queries/products";
import { SEED_PRODUCTS } from "./seed";

/**
 * إحضار قائمة المنتجات مع فلترة اختيارية.
 *
 * المصدر: Sanity CMS (أولاً)
 * Fallback: seed.ts في بيئة التطوير فقط إذا Sanity فارغ أو غير مضبوط
 *
 * التوقيع لا يتغير — كل المكونات تعمل بدون تعديل
 */
export async function getProducts(filters?: ProductFilters, locale?: string): Promise<Product[]> {
  // إذا لم يُضبط projectId، ارجع للـ seed مباشرة
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    return applyFiltersToSeed(filters);
  }

  // المصدر الأساسي: Sanity
  const sanityProducts = await getAllProducts(filters, locale);
  if (sanityProducts.length > 0) return sanityProducts;

  // Fallback: seed في بيئة التطوير فقط
  if (process.env.NODE_ENV === "development") {
    return applyFiltersToSeed(filters);
  }

  return [];
}

/**
 * إحضار قائمة الـ categories الفريدة.
 * يستخدم في FilterBar لبناء أزرار الفلترة ديناميكياً.
 */
export async function getProductCategories(): Promise<string[]> {
  // إذا لم يُضبط projectId، ارجع للـ seed
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    const categories = new Set(SEED_PRODUCTS.map((p) => p.category));
    return Array.from(categories);
  }

  // المصدر الأساسي: Sanity
  const sanityCategories = await getSanityCategories();
  if (sanityCategories.length > 0) return sanityCategories;

  // Fallback: seed
  if (process.env.NODE_ENV === "development") {
    const categories = new Set(SEED_PRODUCTS.map((p) => p.category));
    return Array.from(categories);
  }

  return [];
}

/** تطبيق الفلاتر على بيانات الـ seed (للـ fallback فقط) */
function applyFiltersToSeed(filters?: ProductFilters): Product[] {
  let products = [...SEED_PRODUCTS];

  if (filters?.inStockOnly) {
    products = products.filter((p) => p.inStock);
  }
  if (filters?.category) {
    products = products.filter((p) => p.category === filters.category);
  }
  if (filters?.limit) {
    products = products.slice(0, filters.limit);
  }

  return products;
}
