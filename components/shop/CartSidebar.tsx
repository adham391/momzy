"use client";

import { useEffect, useState } from "react";
import { Link } from "@/lib/i18n/navigation";
import Image from "next/image";
import { useRouter } from "@/lib/i18n/navigation";
import { useCart } from "@/lib/store/cart";
import CartItemRow from "@/components/shop/CartItemRow";

/** سلة التسوق — sidebar من اليسار (RTL) + overlay */
export default function CartSidebar() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const isOpen    = useCart((s) => s.isOpen);
  const closeCart = useCart((s) => s.closeCart);
  const items     = useCart((s) => s.items);
  const getTotal  = useCart((s) => s.getTotal);
  const router    = useRouter();

  /* منع تمرير الصفحة خلف الـ sidebar */
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!hydrated || !isOpen) return null;

  const total = getTotal();
  const isEmpty = items.length === 0;

  return (
    <>
      {/* ── Overlay ── */}
      <div
        role="presentation"
        onClick={closeCart}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(37,34,32,0.4)",
          backdropFilter: "blur(4px)",
          zIndex: 870,
        }}
      />

      {/* ── Sidebar ── */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="سلة التسوق"
        className="bg-white flex flex-col"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: "min(380px, 100vw)",
          zIndex: 880,
          boxShadow: "-8px 0 40px rgba(0,0,0,0.12)",
        }}
      >
        {/* ── هيدر السلة ── */}
        <div
          className="flex items-center justify-between shrink-0"
          style={{
            padding: "20px 24px",
            borderBottom: "1.5px solid var(--bord)",
          }}
        >
          <div className="font-heading text-[20px] font-bold text-teal flex items-center gap-2">
            سلة التسوق
            <Image src="/icons/cart-icon.png" alt="سلة" width={44} height={44} className="object-contain" />
          </div>
          <button
            onClick={closeCart}
            aria-label="إغلاق السلة"
            className="w-9 h-9 rounded-full flex items-center justify-center text-light hover:bg-rosepale hover:text-rose transition-colors font-label text-[20px]"
            style={{ border: "none", background: "none", cursor: "pointer" }}
          >
            ×
          </button>
        </div>

        {/* ── المحتوى ── */}
        <div
          className="flex-1 overflow-y-auto"
          style={{
            padding: "0 24px",
            background: "linear-gradient(to bottom, white 0%, var(--offwh) 100%)",
          }}
        >
          {isEmpty ? (
            <div className="text-center py-16">
              <div className="mb-4 flex justify-center">
                <Image src="/icons/cart-icon.png" alt="سلة" width={72} height={72} className="object-contain" />
              </div>
              <div className="font-heading text-[18px] font-bold text-teal mb-2">
                سلتك فارغة
              </div>
              <div className="text-[14px] text-rose mb-6">
                اكتشفي منتجاتنا وأضيفي ما يعجبك
              </div>
              <Link
                href="/shop"
                onClick={closeCart}
                className="inline-flex items-center font-label font-bold text-[14px]"
                style={{
                  background: "var(--teal)",
                  color: "white",
                  padding: "10px 24px",
                  borderRadius: 50,
                  textDecoration: "none",
                }}
              >
                اكتشفي المنتجات
              </Link>
            </div>
          ) : (
            <>
              {items.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}

            </>
          )}
        </div>

        {/* ── فوتر السلة ── */}
        {!isEmpty && (
          <div
            className="shrink-0"
            style={{
              padding: "20px 24px",
              borderTop: "1.5px solid var(--bord)",
              background: "var(--offwh)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="font-label font-semibold text-[15px] text-mid">المجموع</span>
              <span className="font-label font-extrabold text-[22px] text-teal">
                ₪{total}
              </span>
            </div>

            <button
              onClick={() => { closeCart(); router.push("/checkout"); }}
              className="w-full font-label font-bold text-white text-[15px] mb-3 [transition:transform_200ms_cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-[2px]"
              style={{
                background: "var(--rose)",
                color: "var(--dark)",
                border: "none",
                borderRadius: 50,
                padding: "14px",
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(242,167,181,0.4)",
              }}
            >
              إتمام الشراء ←
            </button>

            <button
              onClick={closeCart}
              className="w-full font-label font-semibold text-mid text-[13px] transition-colors hover:text-dark"
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              مواصلة التسوق
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
