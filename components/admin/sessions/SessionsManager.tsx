"use client";

import { useMemo, useState } from "react";
import type { SlotRow } from "@/lib/db/bookings";
import type { SessionBooking } from "@/lib/db/sessions";
import { weekdayAr } from "@/lib/sessions/time";
import { formatSlotDate } from "@/lib/utils/format";
import AdminCalendar, { type CalendarDaySummary } from "./AdminCalendar";
import DayShiftForm from "./DayShiftForm";
import SessionCard from "./SessionCard";
import SessionCreateForm from "./SessionCreateForm";
import type { ServiceOption } from "./types";

/**
 * صفحة المواعيد بعد التحميل: رزنامة تختار منها هبة يومًا، فتظهر جلساته للتعديل
 * والتحريك والإلغاء، ونموذج الإضافة مضبوط على اليوم نفسه. «كل الأيام القادمة» للنظرة الشاملة.
 */
export default function SessionsManager({
  services,
  slots,
  bookingsBySlot,
  initialDay,
  today,
}: {
  services: ServiceOption[];
  slots: SlotRow[];
  bookingsBySlot: Record<string, SessionBooking[]>;
  /** من الرابط (?day=) بعد كل فعل — كي يبقى اليوم نفسه مختارًا */
  initialDay: string | null;
  /** تاريخ اليوم بتوقيت إسرائيل — من السيرفر */
  today: string;
}) {
  const days = useMemo<CalendarDaySummary[]>(() => {
    const map = new Map<string, CalendarDaySummary>();
    for (const slot of slots) {
      const day = map.get(slot.date) ?? { date: slot.date, sessions: 0, registered: 0, blocked: 0 };
      day.sessions += 1;
      day.registered += bookingsBySlot[slot.id]?.length ?? 0;
      if (slot.is_blocked) day.blocked += 1;
      map.set(slot.date, day);
    }
    return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
  }, [slots, bookingsBySlot]);

  // اليوم المختار: من الرابط، وإلا اليوم إن كانت فيه جلسات، وإلا أقرب يوم فيه جلسات، وإلا اليوم
  const [selected, setSelected] = useState<string>(() => {
    if (initialDay) return initialDay;
    if (days.some((d) => d.date === today)) return today;
    return days[0]?.date ?? today;
  });
  const [showAll, setShowAll] = useState(false);

  const selectedSlots = slots.filter((s) => s.date === selected);
  const registered = (list: SlotRow[]) => list.reduce((n, s) => n + (bookingsBySlot[s.id]?.length ?? 0), 0);

  const dayBlock = (date: string, daySlots: SlotRow[]) => (
    <section key={date}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <h2 className="font-heading font-bold text-dark text-body">
          {weekdayAr(date)} {formatSlotDate(date)}
          <span className="text-light font-body text-body-sm font-normal">
            {" "}· {daySlots.length} {daySlots.length === 1 ? "جلسة" : "جلسات"}
            {registered(daySlots) > 0 ? ` · ${registered(daySlots)} ${registered(daySlots) === 1 ? "تسجيل" : "تسجيلات"}` : ""}
          </span>
        </h2>
        {daySlots.length > 0 && <DayShiftForm date={date} day={selected} sessions={daySlots.length} registered={registered(daySlots)} />}
      </div>
      {daySlots.length === 0 ? (
        <p className="text-light text-body-sm bg-white rounded-[var(--r)] border border-dashed border-bord py-6 text-center">
          لا جلسات في هذا اليوم — أضيفي من النموذج.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {daySlots.map((slot) => (
            <SessionCard key={slot.id} slot={slot} bookings={bookingsBySlot[slot.id] ?? []} day={selected} />
          ))}
        </div>
      )}
    </section>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[340px_minmax(0,1fr)] gap-6 items-start">
      {/* ── الرزنامة ── */}
      <aside className="lg:sticky lg:top-4">
        <AdminCalendar days={days} selected={selected} today={today} onSelect={(d) => { setSelected(d); setShowAll(false); }} />
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="mt-3 w-full text-body-sm font-bold text-teal hover:underline"
        >
          {showAll ? "العودة إلى اليوم المختار" : `كل الأيام القادمة (${days.length})`}
        </button>
      </aside>

      {/* ── اليوم المختار ── */}
      <div className="flex flex-col gap-6 min-w-0">
        {services.length > 0 && <SessionCreateForm services={services} defaultDate={selected} day={selected} />}
        {showAll
          ? days.map((d) => dayBlock(d.date, slots.filter((s) => s.date === d.date)))
          : dayBlock(selected, selectedSlots)}
      </div>
    </div>
  );
}
