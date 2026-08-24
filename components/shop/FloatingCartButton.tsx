"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useCart } from "@/lib/store/cart";

/** زر السلة العائم — أسفل اليسار، يظهر فقط عند وجود منتجات */
export default function FloatingCartButton() {
  const t = useTranslations("cart");
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const count    = useCart((s) => s.getCount());
  const openCart = useCart((s) => s.openCart);

  if (!hydrated || count === 0) return null;

  return (
    <button
      onClick={openCart}
      aria-label={t("openCartAria", { count })}
      className="btn-wobble fixed z-[700] inline-flex items-center gap-2 font-label font-bold text-white [transition:transform_200ms_cubic-bezier(0.23,1,0.32,1),box-shadow_200ms_ease] hover:-translate-y-[3px] hover:shadow-[0_8px_28px_rgba(242,167,181,0.5)] active:scale-95"
      style={{
        bottom: 28,
        insetInlineStart: 28,
        background: "var(--rose)",
        border: "none",
        borderRadius: 50,
        padding: "12px 22px",
        boxShadow: "0 4px 20px rgba(242,167,181,0.4)",
        cursor: "pointer",
        fontSize: 15,
      }}
    >
      <span>🛒</span>
      <span>{count}</span>
    </button>
  );
}
