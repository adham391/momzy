import ProductCard from "@/components/shop/ProductCard";
import { getProducts } from "@/lib/products/getProducts";

interface RelatedProductsProps {
  /** slug المنتج الحالي — يُستثنى من النتائج */
  currentSlug: string;
}

/** منتجات أخرى في المتجر — تُعرض في صفحة المنتج (بدون h2 داخلي، يُضاف في الـ parent) */
export default async function RelatedProducts({ currentSlug }: RelatedProductsProps) {
  const all = await getProducts({ inStockOnly: true });
  const related = all.filter((p) => p.slug !== currentSlug).slice(0, 3);

  if (related.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
      {related.map((product) => (
        <ProductCard key={product.slug} product={product} />
      ))}
    </div>
  );
}
