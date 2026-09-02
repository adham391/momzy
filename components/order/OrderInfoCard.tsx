import { useTranslations } from "next-intl";
import type { OrderCustomer } from "@/lib/utils/orders";

interface OrderInfoCardProps {
  customer:    OrderCustomer;
  notes?:      string;
  building?:   string;
  postalCode?: string;
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
export default function OrderInfoCard({ customer, notes, building, postalCode }: OrderInfoCardProps) {
  const t = useTranslations("order");
  /** الطلب الرقمي البحت يُنشأ بلا عنوان — فلا نعرض كارد توصيل فارغاً */
  const hasDelivery = customer.city.trim().length > 0 || customer.address.trim().length > 0;
  const cardStyle = {
    background: "white",
    border: "1.5px solid var(--bord)",
    borderRadius: 22,
    padding: "22px 24px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
  } as const;

  return (
    <div className={`grid grid-cols-1 gap-5 ${hasDelivery ? "md:grid-cols-2" : ""}`}>
      {/* بيانات العميل */}
      <div style={cardStyle}>
        <h3
          className="font-heading font-bold text-dark text-[16px] mb-4 pb-3"
          style={{ borderBottom: "1.5px solid var(--bord)" }}
        >
          {t("customerTitle")}
        </h3>
        <div className="flex flex-col gap-3">
          <InfoRow label={t("nameLabel")} value={customer.name} />
          <InfoRow label={t("emailLabel")} value={customer.email} ltr />
          <InfoRow label={t("phoneLabel")} value={customer.phone} ltr />
          {!hasDelivery && notes && notes.trim().length > 0 && (
            <InfoRow label={t("notesLabel")} value={notes} />
          )}
        </div>
      </div>

      {/* عنوان التوصيل — يُخفى في الطلب الرقمي البحت */}
      {hasDelivery && (
        <div style={cardStyle}>
          <h3
            className="font-heading font-bold text-dark text-[16px] mb-4 pb-3"
            style={{ borderBottom: "1.5px solid var(--bord)" }}
          >
            {t("deliveryTitle")}
          </h3>
          <div className="flex flex-col gap-3">
            <InfoRow label={t("cityLabel")} value={customer.city} />
            {postalCode && postalCode.trim().length > 0 && (
              <InfoRow label={t("postalCodeLabel")} value={postalCode} ltr />
            )}
            <InfoRow label={t("addressLabel")} value={customer.address} />
            {building && building.trim().length > 0 && (
              <InfoRow label={t("buildingLabel")} value={building} />
            )}
            {notes && notes.trim().length > 0 && (
              <InfoRow label={t("notesLabel")} value={notes} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
