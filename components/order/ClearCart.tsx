"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/store/cart";

/**
 * يُفرّغ السلة عند عرض صفحة تأكيد الطلب.
 * يُوضع داخل صفحة التأكيد (server component) كي يحدث التفريغ بعد نجاح الطلب فقط.
 */
export default function ClearCart() {
  const clearCart = useCart((s) => s.clearCart);
  useEffect(() => {
    clearCart();
  }, [clearCart]);
  return null;
}
