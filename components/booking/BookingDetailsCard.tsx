import { formatSlotDate, formatTimeShort, formatILS } from "@/lib/utils/format";
import type { BookingRow } from "@/lib/db/bookings";

interface BookingDetailsCardProps {
  booking: BookingRow;
  /** كشف رابط اللقاء/المكان — بعد تثبيت التسجيل (الدفع) فقط */
  revealSession: boolean;
}

/** صف بيان: تسمية + قيمة */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5" style={{ borderBottom: "1px solid var(--bord)" }}>
      <span className="font-label text-[13px] text-light shrink-0">{label}</span>
      <span className="font-label text-[14px] font-semibold text-dark text-left">{children}</span>
    </div>
  );
}

/** بطاقة تفاصيل التسجيل — الورشة والموعد وطريقة الحضور وبيانات المسجِّلة */
export default function BookingDetailsCard({ booking, revealSession }: BookingDetailsCardProps) {
  const hasOnline = Boolean(booking.meeting_link);
  const hasOnsite = Boolean(booking.location);

  return (
    <div className="flex flex-col gap-6">
      {/* ── تفاصيل الورشة ── */}
      <div
        className="rounded-[22px]"
        style={{ background: "white", border: "1.5px solid var(--bord)", padding: "24px 26px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
      >
        <h2 className="font-heading font-bold text-dark text-[17px] mb-3">تفاصيل الورشة</h2>
        <Row label="الورشة">{booking.service_name ?? "—"}</Row>
        <Row label="التاريخ">{formatSlotDate(booking.date)}</Row>
        <Row label="الوقت">
          <span dir="ltr">
            {formatTimeShort(booking.start_time)}
            {booking.end_time ? ` – ${formatTimeShort(booking.end_time)}` : ""}
          </span>
        </Row>
        {booking.amount > 0 && <Row label="المبلغ">{formatILS(booking.amount)}</Row>}
      </div>

      {/* ── كيف أحضر؟ ── */}
      <div
        className="rounded-[22px]"
        style={{
          background: revealSession ? "var(--tealpale)" : "var(--yellowlt)",
          border: `1.5px solid ${revealSession ? "var(--mint)" : "var(--yellow)"}`,
          padding: "24px 26px",
        }}
      >
        <h2 className="font-heading font-bold text-dark text-[17px] mb-2">كيف أحضر؟</h2>

        {!revealSession ? (
          <p className="font-label text-[13.5px] text-mid leading-[1.9]">
            تفاصيل الحضور (رابط اللقاء أو المكان) تظهر هنا فور تثبيت تسجيلكِ.
          </p>
        ) : hasOnline ? (
          <>
            <p className="font-label text-[13.5px] text-mid leading-[1.9] mb-4">
              ورشة أونلاين — انضمي عبر الرابط في موعد الورشة. أرسلناه أيضًا على بريدكِ.
            </p>
            <a
              href={booking.meeting_link ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block font-label font-bold text-white text-[15px] active:scale-[0.98]"
              style={{
                background: "var(--teal)",
                borderRadius: 50,
                padding: "13px 30px",
                boxShadow: "0 6px 18px rgba(130,201,196,0.45)",
              }}
            >
              انضمي للقاء ←
            </a>
          </>
        ) : hasOnsite ? (
          <>
            <p className="font-label text-[13.5px] text-mid leading-[1.9] mb-2">ورشة حضورية — مكان اللقاء:</p>
            <p className="font-label text-[15px] font-bold text-dark leading-[1.8]">{booking.location}</p>
          </>
        ) : (
          <p className="font-label text-[13.5px] text-mid leading-[1.9]">
            سنرسل لكِ تفاصيل الحضور على بريدكِ وواتساب قبل موعد الورشة.
          </p>
        )}
      </div>

      {/* ── بياناتكِ ── */}
      <div
        className="rounded-[22px]"
        style={{ background: "white", border: "1.5px solid var(--bord)", padding: "24px 26px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
      >
        <h2 className="font-heading font-bold text-dark text-[17px] mb-3">بياناتكِ</h2>
        <Row label="الاسم">{booking.customer_name}</Row>
        <Row label="البريد الإلكتروني">
          <span dir="ltr">{booking.customer_email}</span>
        </Row>
        <Row label="رقم الهاتف">
          <span dir="ltr">{booking.customer_phone}</span>
        </Row>
        {booking.notes && <Row label="ملاحظات">{booking.notes}</Row>}
      </div>
    </div>
  );
}
