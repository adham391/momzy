"use client";

import { useCart } from "@/lib/store/cart";
import type { Product } from "@/lib/products/types";

interface AddToCartButtonProps {
  product: Product;
  /** "icon" = زر + مربع، "full" = زر بعرض كامل */
  variant?: "icon" | "full";
}

/** زر إضافة للسلة */
export default function AddToCartButton({ product, variant = "icon" }: AddToCartButtonProps) {
  const addItem = useCart((s) => s.addItem);

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
  }

  if (variant === "full") {
    return (
      <button
        onClick={handleAdd}
        className="w-full font-label font-bold text-[15px] [transition:transform_200ms_cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-[2px]"
        style={{
          background: "transparent",
          color: "var(--teal)",
          border: "2px solid var(--teal)",
          borderRadius: 50,
          padding: "13px 28px",
          cursor: "pointer",
        }}
      >
        إضافة إلى السلة
      </button>
    );
  }

  return (
    <button
      onClick={handleAdd}
      aria-label="أضيفي للسلة"
      className="flex items-center justify-center font-label font-extrabold text-[22px] [transition:transform_160ms_cubic-bezier(0.23,1,0.32,1)] hover:scale-110 active:scale-95"
      style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        background: "var(--teal)",
        color: "white",
        border: "none",
        cursor: "pointer",
        flexShrink: 0,
        lineHeight: 1,
      }}
    >
      +
    </button>
  );
}
