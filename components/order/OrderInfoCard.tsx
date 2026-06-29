import type { OrderCustomer } from "@/lib/utils/orders";

interface OrderInfoCardProps {
  customer: OrderCustomer;
  notes?:   string;
}

/** سطر معلومة (label + value) */
function InfoRow({ label, value, ltr }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <span
        className="font-label text-[11px] text-light"
        style={{ letterSpacing: "1.5px", textTransform: "uppercase" }}
      >
        {label}
      </span>
      <span
        className="font-label text-[14px] text-dark"
        style={ltr ? { direction: "ltr", textAlign: "right" } : undefined}
      >
        {value}
      </span>
    </div>
  );
}

/** كاردا بيانات العميل وعنوان التوصيل */
export default function OrderInfoCard({ customer, notes }: OrderInfoCardProps) {
  const cardStyle = {
    background: "white",
    border: "1.5px solid var(--bord)",
    borderRadius: 22,
    padding: "22px 24px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
  } as const;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* بيانات العميل */}
      <div style={cardStyle}>
        <h3
          className="font-heading font-bold text-dark text-[16px] mb-4 pb-3"
          style={{ borderBottom: "1.5px solid var(--bord)" }}
        >
          بياناتكِ
        </h3>
        <div className="flex flex-col gap-3">
          <InfoRow label="الاسم"          value={customer.name} />
          <InfoRow label="البريد الإلكتروني" value={customer.email} ltr />
          <InfoRow label="رقم الهاتف"     value={customer.phone} ltr />
        </div>
      </div>

      {/* عنوان التوصيل */}
      <div style={cardStyle}>
        <h3
          className="font-heading font-bold text-dark text-[16px] mb-4 pb-3"
          style={{ borderBottom: "1.5px solid var(--bord)" }}
        >
          عنوان التوصيل
        </h3>
        <div className="flex flex-col gap-3">
          <InfoRow label="البلدة"  value={customer.city} />
          <InfoRow label="العنوان" value={customer.address} />
          {notes && notes.trim().length > 0 && (
            <InfoRow label="ملاحظات" value={notes} />
          )}
        </div>
      </div>
    </div>
  );
}
