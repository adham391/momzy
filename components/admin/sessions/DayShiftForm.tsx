"use client";

import { useState } from "react";
import { CalendarClock, X } from "lucide-react";
import { shiftDayAction } from "@/app/admin/(panel)/bookings/availability/actions";

const inputCls =
  "px-3 py-2 rounded-xl border border-bord bg-offwh text-body-sm text-dark focus:outline-none focus:border-rose";

/** الدقائق المتاحة للتحريك — بالربع ساعة، تقديمًا أو تأخيرًا حتى ثلاث ساعات */
const SHIFT_STEPS = [-180, -120, -90, -60, -45, -30, -15, 0, 15, 30, 45, 60, 90, 120, 180];

function shiftLabel(minutes: number): string {
  if (minutes === 0) return "بلا تغيير في الساعة";
  const abs = Math.abs(minutes);
  const amount = abs % 60 === 0 ? `${abs / 60} ${abs === 60 ? "ساعة" : "ساعات"}` : `${abs} دقيقة`;
  return minutes > 0 ? `تأخير ${amount}` : `تقديم ${amount}`;
}

/**
 * تحريك كل جلسات يوم دفعة واحدة — إلى تاريخ آخر و/أو بدقائق. كل مسجِّلة مؤكَّدة
 * في أي جلسة من اليوم تصلها رسالة بالموعد الجديد.
 */
export default function DayShiftForm({
  date,
  day,
  sessions,
  registered,
}: {
  date: string;
  /** اليوم المختار في الرزنامة — يعود في الرابط بعد الفعل */
  day: string;
  sessions: number;
  registered: number;
}) {
  const [open, setOpen] = useState(false);
  const [newDate, setNewDate] = useState(date);
  const [delta, setDelta] = useState(0);
  const changed = newDate !== date || delta !== 0;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-body-sm font-bold text-teal hover:underline"
      >
        <CalendarClock size={15} /> تحريك كل مواعيد اليوم
      </button>
    );
  }

  return (
    <form
      action={shiftDayAction}
      onSubmit={(e) => {
        const msg =
          `سيتحرّك ${sessions} ${sessions === 1 ? "جلسة" : "جلسات"} من هذا اليوم` +
          (newDate !== date ? ` إلى ${newDate}` : "") +
          (delta !== 0 ? ` (${shiftLabel(delta)})` : "") +
          (registered > 0 ? `، وسيصل بريد بالموعد الجديد إلى ${registered} من المسجِّلات.` : ".") +
          "\n\nهل تريدين المتابعة؟";
        if (!window.confirm(msg)) e.preventDefault();
      }}
      className="flex flex-wrap items-end gap-2 bg-yellowlt border border-yellow rounded-xl px-3 py-2.5"
    >
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="day" value={day} />
      <label className="flex flex-col gap-1">
        <span className="text-micro text-light font-label">إلى تاريخ</span>
        <input name="new_date" type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className={inputCls} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-micro text-light font-label">تحريك الساعة</span>
        <select name="delta_minutes" value={delta} onChange={(e) => setDelta(Number(e.target.value))} className={inputCls}>
          {SHIFT_STEPS.map((m) => (
            <option key={m} value={m}>{shiftLabel(m)}</option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        disabled={!changed}
        className="px-4 py-2 rounded-xl bg-dark text-white text-body-sm font-bold hover:brightness-125 transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        تحريك {sessions} {sessions === 1 ? "جلسة" : "جلسات"}
      </button>
      <button type="button" onClick={() => setOpen(false)} className="p-2 rounded-xl text-mid hover:text-dark" aria-label="إغلاق">
        <X size={16} />
      </button>
    </form>
  );
}
