import { useTranslations } from "next-intl";
import type { Service } from "@/lib/services/types";

interface ServiceMetaProps {
  service: Service;
}

/**
 * بطاقة معلومات الخدمة — تصميم موحّد مع باقي الموقع
 * Grid 2 أعمدة على الديسكتوب، عمود واحد على الموبايل
 * أيقونات SVG بسيطة + label صغير رمادي + قيمة بـ bold
 */
export default function ServiceMeta({ service }: ServiceMetaProps) {
  const t = useTranslations("services");
  const items: { icon: React.ReactNode; label: string; value: string }[] = [
    { icon: <ClockIcon />,    label: t("meta.duration"),  value: service.duration },
    ...(service.ageRange ? [{ icon: <BabyIcon />, label: t("meta.ageRange"), value: service.ageRange }] : []),
    { icon: <LocationIcon />, label: t("meta.location"), value: service.location },
    ...(service.maxParticipants ? [{ icon: <UsersIcon />, label: t("meta.participants"), value: t("meta.participantsValue", { count: service.maxParticipants }) }] : []),
  ];

  return (
    <div
      className="rounded-[18px] overflow-hidden"
      style={{
        background: "white",
        border: "1.5px solid var(--bord)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
      }}
    >
      {/* Grid التفاصيل */}
      <div className="grid grid-cols-1 sm:grid-cols-2">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 p-4"
            style={{
              borderBottom: idx < items.length - (items.length % 2 === 0 ? 2 : 1) ? "1px solid var(--bord)" : "none",
              borderInlineStart: idx % 2 === 1 ? "1px solid var(--bord)" : "none",
            }}
          >
            <span
              className="flex items-center justify-center shrink-0 mt-0.5"
              style={{ color: "var(--rose)" }}
            >
              {item.icon}
            </span>
            <div className="min-w-0">
              <div
                className="font-label font-semibold text-[12px] md:text-[13px] mb-0.5"
                style={{ color: "var(--mid)", letterSpacing: "0.3px" }}
              >
                {item.label}
              </div>
              <div
                className="font-heading font-bold text-[15px] md:text-[17px]"
                style={{ color: "#3D2C24", lineHeight: 1.3 }}
              >
                {item.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* بلوك السعر — منفصل في الأسفل */}
      {service.price && (
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{
            background: "linear-gradient(135deg, #F4FAFA 0%, #ECF5F4 100%)",
            borderTop: "1px solid var(--bord)",
          }}
        >
          <span
            className="font-label font-semibold text-[12px]"
            style={{ color: "var(--mid)", letterSpacing: "0.5px" }}
          >
            {t("meta.price")}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span
              className="font-label font-extrabold"
              dir="ltr"
              style={{ fontSize: 28, color: "var(--teal)", lineHeight: 1 }}
            >
              ₪{service.price}
            </span>
            <span className="font-label text-[12px]" style={{ color: "var(--mid)" }}>
              {t("meta.perSession")}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── أيقونات SVG monochrome ──────────────────────────────────── */

function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function BabyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9 12h.01M15 12h.01M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
