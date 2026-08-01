import Link from "next/link";
import { CalendarDays, MessageCircle } from "lucide-react";
import { listBookings } from "@/lib/db/bookings";
import type { BookingRow, BookingStatus } from "@/lib/db/bookings";
import BookingsFilterBar from "@/components/admin/bookings/BookingsFilterBar";
import { BookingStatusBadge } from "@/components/admin/StatusBadge";
import { changeBookingStatusAction } from "./actions";
import { formatSlotDate, formatTimeShort, formatILS } from "@/lib/utils/format";
import { ageInMonthsAt, monthsLabel } from "@/lib/utils/age";

export const dynamic = "force-dynamic";
export const metadata = { title: "الحجوزات — لوحة Momzy" };

interface PageProps {
  searchParams: Promise<{ status?: string; date?: string }>;
}

export default async function AdminBookingsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const status = sp.status ?? "all";
  const date = sp.date ?? "";

  const bookings = await listBookings({
    status: status as BookingStatus | "all",
    date: date || undefined,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-heading text-h2 font-bold text-dark">الحجوزات</h1>
        <Link
          href="/admin/bookings/availability"
          className="inline-flex items-center gap-1.5 text-body-sm text-teal font-bold hover:underline"
        >
          <CalendarDays size={15} /> إتاحة المواعيد
        </Link>
      </div>
      <p className="text-mid text-body-sm mb-6">{bookings.length} حجز</p>

      <BookingsFilterBar status={status} date={date} />

      {bookings.length === 0 ? (
        <div className="bg-white rounded-[var(--rl)] border border-bord py-16 text-center">
          <CalendarDays size={40} className="mx-auto text-light mb-3" strokeWidth={1.5} />
          <p className="text-mid text-body-sm">لا توجد حجوزات مطابقة</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {bookings.map((b) => (
            <BookingCard key={b.id} booking={b} />
          ))}
        </div>
      )}
    </div>
  );
}

/** عمر الطفل يوم الجلسة — يُحسب لا يُخزَّن، كي يبقى صحيحاً لو تغيّر موعد الورشة */
function babyAgeAtSession(b: BookingRow): string {
  const months = b.baby_birth_date ? ageInMonthsAt(b.baby_birth_date, b.date) : null;
  return months === null ? "—" : monthsLabel(months);
}

function BookingCard({ booking: b }: { booking: BookingRow }) {
  const phone = b.customer_phone.replace(/\D/g, "");
  const waMessage = encodeURIComponent(
    `مرحباً ${b.customer_name} 🌸، تذكير بموعدك «${b.service_name ?? ""}» يوم ${formatSlotDate(b.date)} الساعة ${formatTimeShort(b.start_time)} مع Momzy. بانتظارك!`
  );
  const waLink = `https://wa.me/${phone}?text=${waMessage}`;
  const closed = b.status === "cancelled" || b.status === "completed";

  return (
    <div className="bg-white rounded-[var(--rl)] border border-bord p-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-label font-bold text-dark" style={{ direction: "ltr" }}>{b.booking_number}</span>
            <BookingStatusBadge status={b.status} />
          </div>
          <div className="font-semibold text-dark text-body-sm">{b.customer_name}</div>
          <div className="text-micro text-light" style={{ direction: "ltr", textAlign: "right" }}>{b.customer_phone}</div>
          <div className="text-body-sm text-mid mt-1">
            {b.service_name} · {formatSlotDate(b.date)} · {formatTimeShort(b.start_time)}
            {b.amount > 0 ? ` · ${formatILS(b.amount)}` : ""}
          </div>
          {/* عمر الطفل يوم الورشة — للورشات ذات الفئة العمرية */}
          {b.baby_birth_date && (
            <div className="text-micro text-light mt-0.5">
              👶 {babyAgeAtSession(b)} · مواليد{" "}
              <span style={{ direction: "ltr", display: "inline-block" }}>
                {formatSlotDate(b.baby_birth_date)}
              </span>
            </div>
          )}
        </div>

        {/* إجراءات */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {!closed && (
            <>
              {b.status !== "confirmed" && (
                <StatusButton bookingId={b.id} status="confirmed" label="تأكيد" tone="green" />
              )}
              <StatusButton bookingId={b.id} status="completed" label="إتمام" tone="blue" />
              <StatusButton bookingId={b.id} status="cancelled" label="إلغاء" tone="rose" />
            </>
          )}
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-body-sm font-bold border border-bord text-teal hover:bg-tealpale transition"
          >
            <MessageCircle size={15} /> تذكير
          </a>
        </div>
      </div>
    </div>
  );
}

function StatusButton({
  bookingId,
  status,
  label,
  tone,
}: {
  bookingId: string;
  status: BookingStatus;
  label: string;
  tone: "green" | "blue" | "rose";
}) {
  const styles: Record<string, React.CSSProperties> = {
    green: { background: "#DCFCE7", color: "#166534", borderColor: "#BBF7D0" },
    blue: { background: "#DBEAFE", color: "#1E40AF", borderColor: "#BFDBFE" },
    rose: { background: "var(--rosepale)", color: "var(--rose)", borderColor: "var(--roselt)" },
  };
  return (
    <form action={changeBookingStatusAction}>
      <input type="hidden" name="bookingId" value={bookingId} />
      <input type="hidden" name="status" value={status} />
      <button type="submit" className="px-3 py-1.5 rounded-lg text-body-sm font-bold border transition" style={styles[tone]}>
        {label}
      </button>
    </form>
  );
}
