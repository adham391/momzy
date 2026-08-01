import { getProducts } from "./getProducts";

/**
 * خريطة slug → mainImage لكل المنتجات (من Sanity، مع كاش getProducts).
 * تُستخدم لعرض صور عناصر الطلبات — الصور غير مخزّنة في order_items
 * (نخزّن الاسم والسعر snapshot فقط، والصورة تُجلب حيّة من المصدر).
 */
export async function getProductImageMap(): Promise<Map<string, string>> {
  const products = await getProducts();
  return new Map(products.map((p) => [p.slug, p.mainImage]));
}
