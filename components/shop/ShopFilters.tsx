"use client";

import { useMemo, useState } from "react";
import FilterBar from "@/components/shop/FilterBar";
import ProductGrid from "@/components/shop/ProductGrid";
import type { Product, ProductSort } from "@/lib/products/types";

interface ShopFiltersProps {
  products: Product[];
}

/** الفلترة + البحث + الترتيب — كله client-side فوق قائمة المنتجات */
export default function ShopFilters({ products }: ShopFiltersProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery,    setSearchQuery]    = useState<string>("");
  const [sort,           setSort]           = useState<ProductSort>("newest");

  /** قائمة الـ categories الفريدة */
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.category));
    return Array.from(set);
  }, [products]);

  /** التطبيق التسلسلي للفلتر + البحث + الترتيب */
  const filtered = useMemo(() => {
    let result = products;

    // فلتر الـ category
    if (activeCategory !== "all") {
      result = result.filter((p) => p.category === activeCategory);
    }

    // فلتر البحث (في title و description)
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // ترتيب
    result = [...result];
    if (sort === "price-asc") result.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") result.sort((a, b) => b.price - a.price);
    else {
      // الأحدث = حسب createdAt تنازلياً
      result.sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      });
    }

    return result;
  }, [products, activeCategory, searchQuery, sort]);

  return (
    <>
      <FilterBar
        categories={categories}
        activeCategory={activeCategory}
        onChangeCategory={setActiveCategory}
        searchQuery={searchQuery}
        onChangeSearch={setSearchQuery}
        sort={sort}
        onChangeSort={setSort}
      />
      <ProductGrid products={filtered} />
    </>
  );
}
