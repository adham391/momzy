"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** ملخّص يوم في رزنامة الأدمن */
export interface CalendarDaySummary {
  date: string;
  sessions: number;
  registered: number;
  /** جلسات محجوبة عن العميلات */
  blocked: number;
}

const WEEKDAYS = ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];
const MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

const pad = (n: number) => String(n).padStart(2, "0");
const dateKey = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const CELL = 48;

/** الشهر الذي يقع فيه تاريخ */
function monthOf(date: string): { y: number; m: number } {
  const d = new Date(`${date}T00:00:00`);
  return { y: d.getFullYear(), m: d.getMonth() };
}

/**
 * رزنامة شهرية لهبة — كل يوم يعرض عدد جلساته ونقطة إن كان فيه مسجِّلات.
 * الضغط على يوم يختاره؛ ما يُعرض تحته يقرّره الأب (SessionsManager).
 */
export default function AdminCalendar({
  days,
  selected,
  today,
  onSelect,
}: {
  days: CalendarDaySummary[];
  selected: string;
  /** تاريخ اليوم بتوقيت إسرائيل — من السيرفر كي لا يختلف عن المتصفح */
  today: string;
  onSelect: (date: string) => void;
}) {
  const byDate = useMemo(() => new Map(days.map((d) => [d.date, d])), [days]);

  const [view, setView] = useState(() => monthOf(selected));

  // اختيار يوم في شهر آخر (بعد تحريك جلسة مثلًا) ينقل العرض إليه — تعديل الحالة أثناء التصيير لا في effect
  const [prevSelected, setPrevSelected] = useState(selected);
  if (prevSelected !== selected) {
    setPrevSelected(selected);
    setView(monthOf(selected));
  }

  const cells = useMemo(() => {
    const firstWeekday = new Date(view.y, view.m, 1).getDay();
    const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
    const out: (number | null)[] = Array(firstWeekday).fill(null);
    for (let d = 1; d <= daysInMonth; d++) out.push(d);
    return out;
  }, [view]);

  function shiftMonth(delta: number) {
    const d = new Date(view.y, view.m + delta, 1);
    setView({ y: d.getFullYear(), m: d.getMonth() });
  }

  const monthTotal = days.filter((d) => d.date.startsWith(`${view.y}-${pad(view.m + 1)}-`)).reduce((n, d) => n + d.sessions, 0);

  return (
    <div className="bg-white rounded-[var(--rl)] border border-bord p-4">
      {/* ── رأس الشهر ── */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          aria-label="الشهر السابق"
          className="w-9 h-9 rounded-full border border-bord bg-white flex items-center justify-center text-dark hover:bg-offwh"
        >
          <ChevronRight size={18} />
        </button>
        <div className="text-center">
          <div className="font-heading font-bold text-dark text-body">
            {MONTHS[view.m]} <span dir="ltr">{view.y}</span>
          </div>
          <div className="text-micro text-light">{monthTotal === 0 ? "لا جلسات في هذا الشهر" : `${monthTotal} ${monthTotal === 1 ? "جلسة" : "جلسات"}`}</div>
        </div>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          aria-label="الشهر التالي"
          className="w-9 h-9 rounded-full border border-bord bg-white flex items-center justify-center text-dark hover:bg-offwh"
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      {/* ── أيام الأسبوع ── */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-center text-micro text-light font-label">{w}</div>
        ))}
      </div>

      {/* ── الأيام ── */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`b${i}`} style={{ height: CELL }} />;
          const key = dateKey(view.y, view.m, day);
          const info = byDate.get(key);
          const isSelected = key === selected;
          const isPast = key < today;
          const isToday = key === today;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              className={`rounded-xl flex flex-col items-center justify-center gap-0.5 border transition ${
                isSelected
                  ? "bg-dark text-white border-dark"
                  : info
                    ? "bg-tealpale text-dark border-transparent hover:border-teal"
                    : "bg-transparent border-transparent hover:bg-offwh"
              } ${isPast && !isSelected ? "opacity-50" : ""}`}
              style={{ height: CELL }}
              title={info ? `${info.sessions} جلسة · ${info.registered} تسجيل` : undefined}
            >
              <span className={`font-label text-body-sm ${isToday && !isSelected ? "text-rose font-extrabold" : "font-bold"}`}>{day}</span>
              {info ? (
                <span className="flex items-center gap-1 text-[10px] font-label leading-none">
                  <span>{info.sessions}</span>
                  {info.registered > 0 && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : "bg-teal"}`} />}
                  {info.blocked > 0 && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white/60" : "bg-light"}`} />}
                </span>
              ) : (
                <span className="text-[10px] leading-none">&nbsp;</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-micro text-light">
        <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-teal" /> فيها مسجِّلات</span>
        <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-light" /> فيها جلسة محجوبة</span>
        <span className="inline-flex items-center gap-1"><span className="text-rose font-bold">اليوم</span> بالوردي</span>
      </div>
    </div>
  );
}
