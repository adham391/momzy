import { useTranslations } from "next-intl";
import ProductCard from "@/components/shop/ProductCard";
import type { Product } from "@/lib/products/types";

interface ProductGridProps {
  products: Product[];
}

/** شبكة المنتجات */
export default function ProductGrid({ products }: ProductGridProps) {
  const t = useTranslations("shop");

  if (products.length === 0) {
    return (
      <div
        className="text-center text-mid font-body py-20"
        style={{ fontSize: 16 }}
      >
        {t("noProductsMatch")}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
      {products.map((product) => (
        <ProductCard key={product.slug} product={product} />
      ))}
    </div>
  );
}
