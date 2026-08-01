interface OrderTotalsProps {
  subtotal:     number;
  shippingCost: number;
  discount:     number;
  total:        number;
}

/** ملخص الأرقام — مجموع، شحن، خصم، إجمالي */
export default function OrderTotals({ subtotal, shippingCost, discount, total }: OrderTotalsProps) {
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
        ملخص الدفع
      </div>

      {/* الأرقام */}
      <div style={{ padding: "16px 24px" }}>
        {/* المجموع الجزئي */}
        <div className="flex justify-between items-center mb-2">
          <span className="font-label text-[14px] text-mid">المجموع</span>
          <span className="font-label font-bold text-dark text-[14px]">₪{subtotal}</span>
        </div>

        {/* الخصم */}
        {discount > 0 && (
          <div className="flex justify-between items-center mb-2">
            <span className="font-label text-[14px] text-teal">الخصم</span>
            <span className="font-label font-bold text-teal text-[14px]">− ₪{discount}</span>
          </div>
        )}

        {/* الشحن */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="font-label text-[14px] text-mid">الشحن</div>
            {shippingCost > 0 && (
              <div className="font-label text-[11px] text-light mt-0.5">
                توصيل حتى البيت (خلال 7 أيام عمل)
              </div>
            )}
          </div>
          {shippingCost === 0 ? (
            <span className="font-label font-bold text-teal text-[14px]">مجاني 🎉</span>
          ) : (
            <span className="font-label font-bold text-dark text-[14px]">₪{shippingCost}</span>
          )}
        </div>

        {/* الإجمالي */}
        <div
          className="flex justify-between items-center pt-3"
          style={{ borderTop: "1.5px solid var(--bord)" }}
        >
          <span className="font-heading font-bold text-dark text-[16px]">الإجمالي</span>
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
        <span className="font-label">دفع آمن ومشفر — بياناتك محمية</span>
      </div>
    </div>
  );
}
