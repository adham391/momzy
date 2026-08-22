import Image from "next/image";
import type { CartItem } from "@/lib/store/cart";

interface OrderItemsListProps {
  items: CartItem[];
}

/** قائمة عناصر الطلب — للقراءة فقط */
export default function OrderItemsList({ items }: OrderItemsListProps) {
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
        عناصر الطلب ({items.length})
      </div>

      {/* العناصر */}
      <div style={{ padding: "8px 24px" }}>
        {items.map((item) => (
          <div
            key={item.id}
            className="py-4"
            style={{ borderBottom: "1px solid var(--bord)" }}
          >
            <div className="flex items-center gap-4">
              <div
                className="rounded-[12px] shrink-0 flex items-center justify-center overflow-hidden"
                style={{
                  width: 64,
                  height: 64,
                  background: "linear-gradient(140deg, var(--rosepale), var(--tealpale))",
                }}
              >
                <Image
                  src={item.mainImage}
                  alt={item.title}
                  width={64}
                  height={64}
                  className="rounded-[12px] object-cover"
                  unoptimized
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-label font-semibold text-dark text-[14px] mb-1.5 truncate">
                  {item.title}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-label text-[12px] text-mid">
                    {item.quantity} × ₪{item.price}
                  </span>
                </div>
              </div>

              <div className="font-label font-extrabold text-teal text-[16px] shrink-0">
                ₪{item.price * item.quantity}
              </div>
            </div>

            {/* ── تفاصيل الهدية إذا كان العنصر هدية ── */}
            {item.gift && (
              <div
                className="mt-3 p-4 rounded-[12px]"
                style={{ background: "var(--rosepale)", border: "1px solid rgba(242,167,181,0.30)" }}
              >
                <p className="font-label font-bold text-[12px] mb-2" style={{ color: "var(--rose)", letterSpacing: "1.5px" }}>
                  🎁 تفاصيل الهدية
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[13px]" style={{ color: "var(--dark)", fontFamily: "'Tajawal', sans-serif" }}>
                  {item.gift.recipientName && (
                    <div><span className="font-bold">المستلِمة:</span> {item.gift.recipientName}</div>
                  )}
                  {item.gift.recipientPhone && (
                    <div dir="ltr" style={{ textAlign: "right" }}><span className="font-bold" dir="rtl">الهاتف:</span> {item.gift.recipientPhone}</div>
                  )}
                  {item.gift.recipientEmail && (
                    <div dir="ltr" style={{ textAlign: "right" }}><span className="font-bold" dir="rtl">📧 بريد المستلِمة:</span> {item.gift.recipientEmail}</div>
                  )}
                  {(item.gift.recipientAddress || item.gift.recipientCity) && (
                    <div className="sm:col-span-2">
                      <span className="font-bold">العنوان:</span> {[item.gift.recipientAddress, item.gift.recipientCity].filter(Boolean).join(", ")}
                    </div>
                  )}
                </div>
                {item.gift.message && (
                  <div
                    className="mt-2.5 p-3 rounded-[8px] italic text-[13px]"
                    style={{ background: "white", color: "var(--mid)", fontFamily: "'Tajawal', sans-serif", border: "1px dashed var(--bord)" }}
                  >
                    &ldquo;{item.gift.message}&rdquo;
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
