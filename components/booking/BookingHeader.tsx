import Image from "next/image";
import { useTranslations } from "next-intl";
import { formatDateTime } from "@/lib/utils/format";

type BookingState = "confirmed" | "awaiting" | "cancelled";

interface BookingHeaderProps {
  bookingNumber: string;
  createdAt: string;
  state: BookingState;
}

/** أيقونة الحالة — ✓ مؤكَّد · ⏱ بانتظار الدفع · ✕ ملغى */
function StateIcon({ state }: { state: BookingState }) {
  const t = useTranslations("booking");
  if (state === "confirmed") {
    return <Image src="/icons/correct-icon.png" alt={t("header.iconConfirmed")} width={48} height={48} className="object-contain" />;
  }
  if (state === "awaiting") {
    return (
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label={t("header.iconAwaiting")}>
        <circle cx="12" cy="12" r="9" />
        <polyline points="12 7 12 12 15.5 14" />
      </svg>
    );
  }
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--mid)" strokeWidth="2" strokeLinecap="round" aria-label={t("header.iconCancelled")}>
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  );
}

/** ترويسة صفحة تأكيد التسجيل — حالة + رقم التسجيل + التاريخ */
export default function BookingHeader({ bookingNumber, createdAt, state }: BookingHeaderProps) {
  const t = useTranslations("booking");
  const title = t(`header.${state}Title`);
  const subtitle = t(`header.${state}Subtitle`);
  const circleBg =
    state === "confirmed" ? "var(--tealpale)" : state === "awaiting" ? "var(--yellow)" : "var(--cream)";

  return (
    <div
      className="text-center rounded-[22px]"
      style={{
        background: "white",
        border: "1.5px solid var(--bord)",
        padding: "40px 28px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }}
    >
      <div
        className="mx-auto rounded-full flex items-center justify-center mb-5"
        style={{ width: 80, height: 80, background: circleBg }}
      >
        <StateIcon state={state} />
      </div>

      <h1 className="font-heading font-bold text-dark text-h2 mb-2">{title}</h1>
      <p className="font-label text-[14px] text-mid mb-6">{subtitle}</p>

      <div
        className="inline-flex items-center gap-3 mb-3"
        style={{ background: "var(--offwh)", border: "1.5px solid var(--bord)", borderRadius: 50, padding: "10px 20px" }}
      >
        <span className="font-label text-[13px] text-mid">{t("header.bookingNumber")}</span>
        <span className="font-label font-extrabold text-dark text-[16px]" style={{ letterSpacing: "0.5px", direction: "ltr" }}>
          {bookingNumber}
        </span>
      </div>

      <div className="font-label text-[12px] text-light">{formatDateTime(createdAt)}</div>
    </div>
  );
}
