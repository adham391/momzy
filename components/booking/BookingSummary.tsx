import { formatSlotDate, formatTimeShort, formatILS } from "@/lib/utils/format";
import type { BookingRow } from "@/lib/db/bookings";

interface BookingSummaryProps {
  booking: BookingRow;
}

/**
 * ملخّص التسجيل الجانبي في مرحلة الدفع — نظير OrderSummary في المتجر.
 * يعرض الورشة والموعد وطريقة الحضور والإجمالي.
 *
 * ⚠️ لا يكشف رابط اللقاء ولا العنوان الدقيق — هذه تُكشف بعد الدفع فقط
 * (كما في BookingDetailsCard)؛ هنا نكتفي بنوع الحضور.
 */
export default function BookingSummary({ booking }: BookingSummaryProps) {
  const attendance = booking.meeting_link
    ? "💻 ورشة أونلاين"
    : booking.location
      ? "📍 ورشة حضورية"
      : null;

  return (
    <div
      className="rounded-[22px]"
      style={{
        background: "white",
        border: "1.5px solid var(--bord)",
        padding: "24px 26px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }}
    >
      <h2 className="font-heading font-bold text-dark text-[17px] mb-4">ملخّص التسجيل</h2>

      {/* ── الورشة والموعد ── */}
      <div className="pb-4" style={{ borderBottom: "1px solid var(--bord)" }}>
        <p className="font-label font-bold text-dark text-[14.5px] leading-[1.7] mb-2">
          {booking.service_name ?? "ورشة"}
        </p>
        <p className="font-label text-[13px] text-mid leading-[1.9]">
          {formatSlotDate(booking.date)} ·{" "}
          <span dir="ltr" style={{ display: "inline-block" }}>
            {formatTimeShort(booking.start_time)}
            {booking.end_time ? `–${formatTimeShort(booking.end_time)}` : ""}
          </span>
        </p>
        {attendance && (
          <p className="font-label text-[12.5px] text-light mt-1">{attendance}</p>
        )}
      </div>

      {/* ── المقعد ── */}
      <div className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid var(--bord)" }}>
        <span className="font-label text-[13.5px] text-mid">مقعد واحد باسم {booking.customer_name}</span>
        <span className="font-label text-[13.5px] font-semibold text-dark">{formatILS(booking.amount)}</span>
      </div>

      {/* ── الإجمالي ── */}
      <div className="flex items-center justify-between pt-4">
        <span className="font-label font-bold text-dark text-[15px]">الإجمالي</span>
        <span className="font-label font-extrabold text-[19px]" style={{ color: "var(--rose)" }}>
          {formatILS(booking.amount)}
        </span>
      </div>

      {/* ── طمأنة: المقعد محجوز ── */}
      <div
        className="mt-4 rounded-[12px] text-center"
        style={{ background: "var(--tealpale)", border: "1px solid var(--mint)", padding: "10px 14px" }}
      >
        <span className="font-label text-[12.5px]" style={{ color: "var(--mid)" }}>
          🎟️ مقعدكِ محجوز باسمكِ أثناء إتمام الدفع
        </span>
      </div>
    </div>
  );
}
