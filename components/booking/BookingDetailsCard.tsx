import { useTranslations } from "next-intl";
import { formatSlotDate, formatTimeShort } from "@/lib/utils/format";
import { formatCharged } from "@/lib/currency";
import type { BookingRow } from "@/lib/db/bookings";

interface BookingDetailsCardProps {
  booking: BookingRow;
  /** التسجيل مثبَّت (مدفوع أو مجاني) */
  confirmed: boolean;
  /** كشف رابط اللقاء/المكان — حين تصبح الجلسة خلال يوم (نفس مهلة تذكير اليوم السابق) */
  revealSession: boolean;
}

/** المكان قد يكون رابط خريطة (Waze) — يُعرض زرًّا لا نصًّا */
const isUrl = (s: string) => /^https?:\/\//i.test(s.trim());

/** صف بيان: تسمية + قيمة */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5" style={{ borderBottom: "1px solid var(--bord)" }}>
      <span className="font-label text-[13px] text-light shrink-0">{label}</span>
      <span className="font-label text-[14px] font-semibold text-dark text-end">{children}</span>
    </div>
  );
}

function ActionLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block font-label font-bold text-white text-[15px] active:scale-[0.98]"
      style={{ background: "var(--teal)", borderRadius: 50, padding: "13px 30px", boxShadow: "0 6px 18px rgba(130,201,196,0.45)" }}
    >
      {label}
    </a>
  );
}

/**
 * بطاقة تفاصيل التسجيل — الورشة والموعد وطريقة الحضور وبيانات المسجِّلة.
 * رابط اللقاء أو المكان لا يظهران فور الدفع: يصلان في تذكير اليوم السابق، ويظهران هنا حينها.
 */
export default function BookingDetailsCard({ booking, confirmed, revealSession }: BookingDetailsCardProps) {
  const t = useTranslations("booking");
  const hasOnline = Boolean(booking.meeting_link);
  const hasOnsite = Boolean(booking.location);
  const revealed = confirmed && revealSession;

  return (
    <div className="flex flex-col gap-6">
      {/* ── تفاصيل الورشة ── */}
      <div
        className="rounded-[22px]"
        style={{ background: "white", border: "1.5px solid var(--bord)", padding: "24px 26px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
      >
        <h2 className="font-heading font-bold text-dark text-[17px] mb-3">{t("details.title")}</h2>
        <Row label={t("details.workshop")}>{booking.service_name ?? "—"}</Row>
        <Row label={t("details.date")}>{formatSlotDate(booking.date)}</Row>
        <Row label={t("details.time")}>
          <span dir="ltr">
            {formatTimeShort(booking.start_time)}
            {booking.end_time ? ` – ${formatTimeShort(booking.end_time)}` : ""}
          </span>
        </Row>
        {booking.amount > 0 && <Row label={t("details.amount")}>{formatCharged(booking.amount, booking.currency, booking.charged_amount)}</Row>}
      </div>

      {/* ── كيف أحضر؟ ── */}
      <div
        className="rounded-[22px]"
        style={{
          background: revealed ? "var(--tealpale)" : "var(--yellowlt)",
          border: `1.5px solid ${revealed ? "var(--mint)" : "var(--yellow)"}`,
          padding: "24px 26px",
        }}
      >
        <h2 className="font-heading font-bold text-dark text-[17px] mb-2">{t("details.howToAttend")}</h2>

        {!confirmed ? (
          <p className="font-label text-[13.5px] text-mid leading-[1.9]">{t("details.revealAfterPayment")}</p>
        ) : !revealSession ? (
          <p className="font-label text-[13.5px] text-mid leading-[1.9]">{t("details.detailsDayBefore")}</p>
        ) : hasOnline ? (
          <>
            <p className="font-label text-[13.5px] text-mid leading-[1.9] mb-4">{t("details.onlineIntro")}</p>
            <ActionLink href={booking.meeting_link ?? "#"} label={t("details.joinMeeting")} />
          </>
        ) : hasOnsite && isUrl(booking.location ?? "") ? (
          <>
            <p className="font-label text-[13.5px] text-mid leading-[1.9] mb-4">{t("details.onsiteIntro")}</p>
            <ActionLink href={booking.location ?? "#"} label={t("details.openMap")} />
          </>
        ) : hasOnsite ? (
          <>
            <p className="font-label text-[13.5px] text-mid leading-[1.9] mb-2">{t("details.onsiteIntro")}</p>
            <p className="font-label text-[15px] font-bold text-dark leading-[1.8]">{booking.location}</p>
          </>
        ) : (
          <p className="font-label text-[13.5px] text-mid leading-[1.9]">{t("details.attendanceDetailsSoon")}</p>
        )}
      </div>

      {/* ── بياناتكِ ── */}
      <div
        className="rounded-[22px]"
        style={{ background: "white", border: "1.5px solid var(--bord)", padding: "24px 26px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
      >
        <h2 className="font-heading font-bold text-dark text-[17px] mb-3">{t("details.yourInfo")}</h2>
        <Row label={t("details.name")}>{booking.customer_name}</Row>
        <Row label={t("details.email")}>
          <span dir="ltr">{booking.customer_email}</span>
        </Row>
        <Row label={t("details.phone")}>
          <span dir="ltr">{booking.customer_phone}</span>
        </Row>
        {booking.topic && <Row label={t("details.topic")}>{booking.topic}</Row>}
        {booking.notes && <Row label={t("details.notes")}>{booking.notes}</Row>}
      </div>
    </div>
  );
}
