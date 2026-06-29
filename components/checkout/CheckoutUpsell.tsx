"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useCart } from "@/lib/store/cart";
import { getProducts } from "@/lib/products/getProducts";
import type { Product } from "@/lib/products/types";

/** قسم البيع الإضافي — منتجات مقترحة في صفحة الدفع */
export default function CheckoutUpsell() {
  const cartItems = useCart((s) => s.items);
  const addItem   = useCart((s) => s.addItem);

  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    getProducts({ inStockOnly: true }).then(setProducts);
  }, []);

  /** المنتجات غير الموجودة في السلة */
  const suggestions = products.filter(
    (p) => !cartItems.some((c) => c.slug === p.slug)
  );

  if (suggestions.length === 0) return null;

  return (
    <div className="mt-8">
      {/* العنوان */}
      <div className="flex items-center gap-3 mb-5">
        <div
          className="font-label font-extrabold text-dark text-[13px] px-4 py-1.5 rounded-full"
          style={{ background: "var(--yellow)", letterSpacing: "0.5px" }}
        >
          قد يعجبكِ أيضاً
        </div>
        <div style={{ flex: 1, height: 1, background: "var(--bord)" }} />
      </div>

      {/* الشبكة */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}
      >
        {suggestions.map((product) => (
          <div
            key={product.slug}
            className="rounded-[18px] overflow-hidden flex flex-col"
            style={{
              border: "2px dashed var(--roselt)",
              background: "white",
            }}
          >
            {/* صورة المنتج */}
            <div
              className="flex items-center justify-center overflow-hidden"
              style={{
                height: 140,
                background: "linear-gradient(140deg, var(--rosepale), var(--tealpale))",
              }}
            >
              <Image
                src={product.mainImage}
                alt={product.title}
                width={120}
                height={120}
                className="object-contain"
                unoptimized
              />
            </div>

            {/* اسم المنتج */}
            <div
              className="font-heading font-bold text-dark text-[14px] text-center leading-snug px-3 py-2"
              style={{ background: "var(--rosepale)" }}
            >
              {product.title}
            </div>

            {/* السعر */}
            <div className="flex items-center justify-center gap-2 px-3 py-2">
              <span className="font-label font-extrabold text-dark text-[16px]">
                ₪ {product.price}.00
              </span>
              {product.compareAtPrice && (
                <span className="font-label text-light text-[13px] line-through">
                  ₪ {product.compareAtPrice}.00
                </span>
              )}
            </div>

            {/* زر الإضافة */}
            <div className="px-3 pb-3 mt-auto">
              <button
                onClick={() => addItem(product)}
                className="w-full font-label font-bold text-white text-[13px] [transition:transform_200ms_cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-[2px]"
                style={{
                  background: "var(--rose)",
                  border: "none",
                  borderRadius: 50,
                  padding: "10px",
                  cursor: "pointer",
                }}
              >
                + أضيفي للطلب
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
