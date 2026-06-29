"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/lib/store/cart";
import QuantityInput from "@/components/shop/QuantityInput";

/** حالة الكوبون */
type CouponStatus = "idle" | "checking" | "valid" | "invalid";

/** ملخص الطلب مع تحكم بالكمية وحقل كوبون */
export default function OrderSummary() {
  const items          = useCart((s) => s.items);
  const getTotal       = useCart((s) => s.getTotal);
  const updateQuantity = useCart((s) => s.updateQuantity);
  const removeItem     = useCart((s) => s.removeItem);

  const [couponOpen,    setCouponOpen]    = useState(false);
  const [couponCode,    setCouponCode]    = useState("");
  const [couponStatus,  setCouponStatus]  = useState<CouponStatus>("idle");
  const [discount,      setDiscount]      = useState(0);
  const [couponLabel,   setCouponLabel]   = useState("");

  const total        = getTotal();
  /* كل العناصر فيزيائية الآن — لاحقاً يمكن إضافة منطق shippingInfo.freeShipping للعناصر */
  const shippingCost = items.length > 0 ? 40 : 0;
  const grandTotal   = total + shippingCost - discount;

  /** تطبيق الكوبون — TODO: استبدل بـ POST /api/coupons/validate */
  async function applyCoupon() {
    if (!couponCode.trim()) return;
    setCouponStatus("checking");

    await new Promise((r) => setTimeout(r, 800)); // محاكاة الطلب

    /* TODO: اربط بـ Supabase — جدول coupons */
    setCouponStatus("invalid");
    setDiscount(0);
    setCouponLabel("");
  }

  /** إزالة الكوبون */
  function removeCoupon() {
    setCouponCode("");
    setCouponStatus("idle");
    setDiscount(0);
    setCouponLabel("");
  }

  return (
    <div
      className="rounded-[22px] overflow-hidden"
      style={{
        border: "1.5px solid var(--bord)",
        background: "var(--white, #fff)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }}
    >
      {/* هيدر */}
      <div
        className="font-heading font-bold text-dark"
        style={{
          padding: "18px 22px",
          borderBottom: "1.5px solid var(--bord)",
          fontSize: 17,
        }}
      >
        ملخص الطلب
      </div>

      {/* العناصر */}
      <div style={{ padding: "12px 22px" }}>
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 py-3"
            style={{ borderBottom: "1px solid var(--bord)" }}
          >
            <div
              className="rounded-[10px] shrink-0 flex items-center justify-center overflow-hidden"
              style={{
                width: 52,
                height: 52,
                background: "linear-gradient(140deg, var(--rosepale), var(--tealpale))",
              }}
            >
              <Image
                src={item.mainImage}
                alt={item.title}
                width={52}
                height={52}
                className="rounded-[10px] object-cover"
                unoptimized
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-label font-semibold text-dark text-[13px] leading-tight truncate mb-2">
                {item.title}
              </div>
              <div className="flex items-center gap-2">
                <QuantityInput
                  value={item.quantity}
                  onChange={(q) => updateQuantity(item.id, q)}
                  size="sm"
                  min={0}
                />
                <button
                  onClick={() => removeItem(item.id)}
                  className="font-label text-[11px] text-light hover:text-rose transition-colors"
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                >
                  حذف
                </button>
              </div>
            </div>

            <div className="font-label font-extrabold text-teal text-[15px] shrink-0">
              ₪{item.price * item.quantity}
            </div>
          </div>
        ))}
      </div>

      {/* ── حقل الكوبون ── */}
      <div style={{ padding: "14px 22px", borderTop: "1px solid var(--bord)" }}>

        {couponStatus === "valid" ? (
          /* كوبون مطبّق */
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-label font-bold text-teal text-[13px]">✓ {couponLabel}</span>
              <span className="font-label text-[12px] text-teal">— خصم ₪{discount}</span>
            </div>
            <button
              onClick={removeCoupon}
              className="font-label text-[12px] text-light hover:text-rose transition-colors"
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              إزالة
            </button>
          </div>
        ) : (
          <>
            {!couponOpen && (
              <button
                onClick={() => setCouponOpen(true)}
                className="w-full flex items-center justify-center gap-2 font-label text-[14px] text-mid transition-colors hover:text-dark"
                style={{
                  border: "1.5px solid var(--bord)",
                  borderRadius: 12,
                  padding: "11px",
                  background: "none",
                  cursor: "pointer",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                  <line x1="7" y1="7" x2="7.01" y2="7"/>
                </svg>
                هل لديكِ كوبون خصم؟
              </button>
            )}

            {couponOpen && (
              <div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponStatus("idle"); }}
                    onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                    placeholder="أدخلي كود الخصم"
                    dir="ltr"
                    autoFocus
                    className="flex-1 font-label text-[13px] text-dark outline-none"
                    style={{
                      border: `1.5px solid ${couponStatus === "invalid" ? "var(--rose)" : "var(--bord)"}`,
                      borderRadius: 10,
                      padding: "9px 12px",
                      background: "var(--offwh)",
                      textAlign: "right",
                      transition: "border-color 0.15s",
                    }}
                  />
                  <button
                    onClick={applyCoupon}
                    disabled={!couponCode.trim() || couponStatus === "checking"}
                    className="font-label font-bold text-[13px] text-white shrink-0"
                    style={{
                      background: couponCode.trim() ? "var(--teal)" : "var(--light)",
                      border: "none",
                      borderRadius: 10,
                      padding: "9px 16px",
                      cursor: couponCode.trim() ? "pointer" : "not-allowed",
                    }}
                  >
                    {couponStatus === "checking" ? "..." : "تطبيق"}
                  </button>
                </div>
                {couponStatus === "invalid" && (
                  <div className="font-label text-[12px] text-rose mt-1.5">
                    كود الخصم غير صحيح أو منتهي الصلاحية
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* الأرقام */}
      <div style={{ padding: "12px 22px" }}>
        <div className="flex justify-between items-center mb-2">
          <span className="font-label text-[14px] text-mid">المجموع</span>
          <span className="font-label font-bold text-dark text-[14px]">₪{total}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between items-center mb-2">
            <span className="font-label text-[14px] text-teal">الخصم</span>
            <span className="font-label font-bold text-teal text-[14px]">− ₪{discount}</span>
          </div>
        )}

        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="font-label text-[14px] text-mid">الشحن</div>
            {shippingCost > 0 && (
              <div className="font-label text-[11px] text-light mt-0.5">
                توصيل حتى البيت (خلال 5 أيام عمل)
              </div>
            )}
          </div>
          {shippingCost === 0 ? (
            <span className="font-label font-bold text-teal text-[14px]">مجاني 🎉</span>
          ) : (
            <span className="font-label font-bold text-dark text-[14px]">₪{shippingCost}</span>
          )}
        </div>

        <div
          className="flex justify-between items-center pt-3"
          style={{ borderTop: "1.5px solid var(--bord)" }}
        >
          <span className="font-heading font-bold text-dark text-[16px]">الإجمالي</span>
          <span className="font-label font-extrabold text-teal text-[22px]">₪{grandTotal}</span>
        </div>
      </div>

      {/* شعار الأمان */}
      <div
        className="flex items-center justify-center gap-2 text-[12px] text-light"
        style={{
          padding: "12px 22px",
          borderTop: "1px solid var(--bord)",
          background: "var(--offwh)",
        }}
      >
        <span>🔒</span>
        <span className="font-label">دفع آمن ومشفر — بياناتك محمية</span>
      </div>
    </div>
  );
}
