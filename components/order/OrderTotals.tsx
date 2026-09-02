import { useTranslations } from "next-intl";

interface OrderTotalsProps {
  subtotal:     number;
  shippingCost: number;
  discount:     number;
  total:        number;
  /** إظهار سطر الشحن — false في الطلب الرقمي البحت (لا شيء يُشحن) */
  showShipping?: boolean;
}

/** ملخص الأرقام — مجموع، شحن، خصم، إجمالي */
export default function OrderTotals({ subtotal, shippingCost, discount, total, showShipping = true }: OrderTotalsProps) {
  const t = useTranslations("order");
  return (
    <div
      className="rounded-[22px] overflow-hidden"
      style={{
        background: "white",
        border: "1.5px solid var(--bord)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }}
    >
      {/* هيدر */}
      <div
        className="font-heading font-bold text-dark"
        style={{
          padding: "18px 24px",
          borderBottom: "1.5px solid var(--bord)",
          fontSize: 17,
        }}
      >
        {t("paymentSummary")}
      </div>

      {/* الأرقام */}
      <div style={{ padding: "16px 24px" }}>
        {/* المجموع الجزئي */}
        <div className="flex justify-between items-center mb-2">
          <span className="font-label text-[14px] text-mid">{t("subtotal")}</span>
          <span className="font-label font-bold text-dark text-[14px]">₪{subtotal}</span>
        </div>

        {/* الخصم */}
        {discount > 0 && (
          <div className="flex justify-between items-center mb-2">
            <span className="font-label text-[14px] text-teal">{t("discount")}</span>
            <span className="font-label font-bold text-teal text-[14px]">− ₪{discount}</span>
          </div>
        )}

        {/* الشحن — يُخفى في الطلب الرقمي البحت */}
        {showShipping && (
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="font-label text-[14px] text-mid">{t("shipping")}</div>
              {shippingCost > 0 && (
                <div className="font-label text-[11px] text-light mt-0.5">
                  {t("shippingNote")}
                </div>
              )}
            </div>
            {shippingCost === 0 ? (
              <span className="font-label font-bold text-teal text-[14px]">{t("freeShipping")}</span>
            ) : (
              <span className="font-label font-bold text-dark text-[14px]">₪{shippingCost}</span>
            )}
          </div>
        )}

        {/* الإجمالي */}
        <div
          className="flex justify-between items-center pt-3"
          style={{ borderTop: "1.5px solid var(--bord)" }}
        >
          <span className="font-heading font-bold text-dark text-[16px]">{t("total")}</span>
          <span className="font-label font-extrabold text-teal text-[24px]">₪{total}</span>
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
        <span className="font-label">{t("secureNote")}</span>
      </div>
    </div>
  );
}
