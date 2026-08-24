"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useCart } from "@/lib/store/cart";

const TOAST_DURATION = 2500;

/** رسالة "أُضيف للسلة" — تظهر لـ 2.5 ثانية */
export default function Toast() {
  const t = useTranslations("shop");
  const lastAdded = useCart((s) => s.lastAdded);
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!lastAdded) return;

    setText(lastAdded.title);
    setVisible(true);

    const timer = setTimeout(() => setVisible(false), TOAST_DURATION);
    return () => clearTimeout(timer);
  }, [lastAdded]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed z-[1000] font-label font-semibold text-white text-[14px] flex items-center gap-2"
      style={{
        bottom: 28,
        insetInlineEnd: 28,
        background: "var(--dark)",
        padding: "12px 20px",
        borderRadius: 12,
        boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
        animation: "toast-in 0.3s ease",
      }}
    >
      <span className="text-teal text-[16px]">✓</span>
      <span>
        {t("addedToCart", { title: text })}
      </span>
    </div>
  );
}
