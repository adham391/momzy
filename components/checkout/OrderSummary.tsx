"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { BOOKLET_COVER_RATIO } from "@/lib/products/helpers";
import { useCart } from "@/lib/store/cart";
import QuantityInput from "@/components/shop/QuantityInput";
import { computeShipping, type ShippingConfig } from "@/lib/shipping";
import { couponDiscount } from "@/lib/coupons";

/** حالة الكوبون */
type CouponStatus = "idle" | "checking" | "valid" | "invalid";

/** ملخص الطلب مع تحكم بالكمية وحقل كوبون. readOnly = عرض فقط (مرحلة الدفع) */
export default function OrderSummary({ shipping, readOnly = false }: { shipping: ShippingConfig; readOnly?: boolean }) {
  const t              = useTranslations("checkout");
  const items          = useCart((s) => s.items);
  const getTotal       = useCart((s) => s.getTotal);
  const updateQuantity = useCart((s) => s.updateQuantity);
  const removeItem     = useCart((s) => s.removeItem);
  const getEffectivePrice = useCart((s) => s.getEffectivePrice);
  const getBundleSavings  = useCart((s) => s.getBundleSavings);

  const appliedCoupon = useCart((s) => s.appliedCoupon);
  const setCoupon     = useCart((s) => s.setCoupon);

  const [couponOpen,   setCouponOpen]   = useState(false);
  const [couponCode,   setCouponCode]   = useState("");
  const [couponStatus, setCouponStatus] = useState<CouponStatus>("idle");

  const total         = getTotal();
  const bundleSavings = getBundleSavings();
  const discount      = couponDiscount(appliedCoupon, total);
  // الشحن للعناصر الفيزيائية فقط — الرقمية (كتيبات PDF) تُرسل بالبريد بلا شحن
  const physicalCount = items.filter((i) => !i.isDigital).length;
  const shippingCost = computeShipping(total, physicalCount, shipping);
  const grandTotal   = total + shippingCost - discount;

  /** تطبيق الكوبون عبر /api/coupons/validate */
  async function applyCoupon() {
    if (!couponCode.trim()) return;
    setCouponStatus("checking");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, subtotal: total }),
      });
      const data = await res.json();
      if (data.valid) {
        setCoupon({
          code: data.code,
          type: data.type,
          value: data.value,
          minOrderAmount: data.minOrderAmount,
          label: data.label,
        });
        setCouponStatus("valid");
      } else {
        setCoupon(null);
        setCouponStatus("invalid");
      }
    } catch {
      setCoupon(null);
      setCouponStatus("invalid");
    }
  }

  /** إزالة الكوبون */
  function removeCoupon() {
    setCoupon(null);
    setCouponCode("");
    setCouponStatus("idle");
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
        {t("orderSummary")}
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
                // الكتيب بحاوية طولية بنسبة الغلاف — ملء تام بلا قص ولا هوامش
                ...(item.isDigital && item.mainImage
                  ? { height: 52, aspectRatio: BOOKLET_COVER_RATIO }
                  : { width: 52, height: 52 }),
                background: "linear-gradient(140deg, var(--rosepale), var(--tealpale))",
              }}
            >
              {item.mainImage ? (
                <Image
                  src={item.mainImage}
                  alt={item.title}
                  width={52}
                  height={52}
                  className="w-full h-full rounded-[10px] object-cover"
                  unoptimized
                />
              ) : (
                <span aria-hidden style={{ color: "var(--rose)", opacity: 0.4, fontSize: 16 }}>✦</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-label font-semibold text-dark text-[13px] leading-tight truncate mb-2">
                {item.title}
              </div>
              {readOnly ? (
                <div className="font-label text-[12px] text-light">{t("quantity", { count: item.quantity })}</div>
              ) : (
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
                    {t("remove")}
                  </button>
                </div>
              )}
            </div>

            <div className="font-label font-extrabold text-teal text-[15px] shrink-0 text-end">
              {(() => {
                const unit = getEffectivePrice(item);
                const disc = unit < item.price;
                return (
                  <>
                    <div>₪{unit * item.quantity}</div>
                    {disc && (
                      <div className="font-normal line-through text-light text-[11px]">
                        ₪{item.price * item.quantity}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        ))}

        {/* شارة توفير الباقة — إعلامية (الأسعار أعلاه مخفّضة أصلًا) */}
        {bundleSavings > 0 && (
          <div
            className="flex items-center justify-center gap-2 rounded-[12px] py-2.5 px-3 mt-2"
            style={{ background: "var(--rosepale)", border: "1px solid rgba(242,167,181,0.30)" }}
          >
            <span>🎁</span>
            <span className="font-label font-bold text-[13px]" style={{ color: "var(--rose)" }}>
              {t("bundleSavingsNote", { amount: bundleSavings })}
            </span>
          </div>
        )}
      </div>

      {/* ── حقل الكوبون — مخفي في وضع القراءة إلا إن وُجد كوبون مطبّق ── */}
      {(!readOnly || appliedCoupon) && (
      <div style={{ padding: "14px 22px", borderTop: "1px solid var(--bord)" }}>

        {appliedCoupon ? (
          /* كوبون مطبّق */
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-label font-bold text-teal text-[13px]">✓ {appliedCoupon.label}</span>
              <span className="font-label text-[12px] text-teal">{t("couponDiscountNote", { amount: discount })}</span>
            </div>
            {!readOnly && (
              <button
                onClick={removeCoupon}
                className="font-label text-[12px] text-light hover:text-rose transition-colors"
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                {t("removeCoupon")}
              </button>
            )}
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
                {t("haveCoupon")}
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
                    placeholder={t("couponPlaceholder")}
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
                    {couponStatus === "checking" ? "..." : t("apply")}
                  </button>
                </div>
                {couponStatus === "invalid" && (
                  <div className="font-label text-[12px] text-rose mt-1.5">
                    {t("couponInvalid")}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
      )}

      {/* الأرقام */}
      <div style={{ padding: "12px 22px" }}>
        <div className="flex justify-between items-center mb-2">
          <span className="font-label text-[14px] text-mid">{t("subtotal")}</span>
          <span className="font-label font-bold text-dark text-[14px]">₪{total}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between items-center mb-2">
            <span className="font-label text-[14px] text-teal">{t("discountLabel")}</span>
            <span className="font-label font-bold text-teal text-[14px]">− ₪{discount}</span>
          </div>
        )}

        {/* الشحن — يُخفى في الطلب الرقمي البحت (لا شيء يُشحن) */}
        {physicalCount > 0 && (
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="font-label text-[14px] text-mid">{t("shipping")}</div>
              {shippingCost > 0 && (
                <div className="font-label text-[11px] text-light mt-0.5">
                  {t("deliveryNote")}
                </div>
              )}
            </div>
            {shippingCost === 0 ? (
              <span className="font-label font-bold text-teal text-[14px]">{t("free")}</span>
            ) : (
              <span className="font-label font-bold text-dark text-[14px]">₪{shippingCost}</span>
            )}
          </div>
        )}

        <div
          className="flex justify-between items-center pt-3"
          style={{ borderTop: "1.5px solid var(--bord)" }}
        >
          <span className="font-heading font-bold text-dark text-[16px]">{t("total")}</span>
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
        <span className="font-label">{t("securePaymentNote")}</span>
      </div>
    </div>
  );
}
