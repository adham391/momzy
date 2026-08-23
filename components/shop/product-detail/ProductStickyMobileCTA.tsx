"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/lib/i18n/navigation";
import { useCart } from "@/lib/store/cart";
import type { Product } from "@/lib/products/types";

interface ProductStickyMobileCTAProps {
  product: Product;
}

/** Sticky CTA الموبايل — يظهر فقط بعد أن يخرج زر "اشتري الآن" الرئيسي من الشاشة */
export default function ProductStickyMobileCTA({ product }: ProductStickyMobileCTAProps) {
  const [visible, setVisible] = useState(false);

  const addItemSilent = useCart((s) => s.addItemSilent);
  const router        = useRouter();

  useEffect(() => {
    /** نراقب زر CTA الرئيسي في الـ Hero — نظهر الـ sticky فقط عند خروجه من viewport */
    const heroCta = document.querySelector("[data-hero-cta]");
    if (!heroCta) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0, rootMargin: "0px" }
    );
    observer.observe(heroCta);
    return () => observer.disconnect();
  }, []);

  function handleBuy() {
    addItemSilent(product);
    router.push("/checkout");
  }

  if (!visible) return null;

  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-[700] flex items-center gap-3"
      style={{
        background: "white",
        borderTop: "1.5px solid rgba(242,167,181,0.20)",
        padding: "12px 16px",
        boxShadow: "0 -4px 16px rgba(0,0,0,0.05)",
        animation: "toast-in 0.3s ease",
      }}
    >
      {/* السعر */}
      <div className="flex flex-col">
        <span
          className="font-label font-extrabold"
          dir="ltr"
          style={{ fontSize: 20, color: "var(--teal)", lineHeight: 1 }}
        >
          ₪{product.price}
        </span>
        {product.compareAtPrice && (
          <span
            className="font-label line-through"
            dir="ltr"
            style={{ fontSize: 12, color: "#252220" }}
          >
            ₪{product.compareAtPrice}
          </span>
        )}
      </div>

      {/* CTA */}
      <button
        onClick={handleBuy}
        className="flex-1 font-label font-bold text-[15px]"
        style={{
          background: "var(--rose)",
          color: "var(--dark)",
          border: "none",
          borderRadius: 50,
          padding: "13px",
          cursor: "pointer",
        }}
      >
        اشتري الآن ←
      </button>
    </div>
  );
}
