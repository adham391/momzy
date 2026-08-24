"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { seatsLabel } from "@/lib/utils/seats";

/** جلسة معروضة في الرزنامة */
export interface CalendarSession {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  startTime: string;
  endTime: string | null;
  price: number;
  seatsLeft: number;
  isOnline: boolean;
  location: string | null;
}

interface SessionCalendarProps {
  sessions: CalendarSession[];
  /** يُستدعى عند اختيار ساعة متاحة */
  onPick: (sessionId: string) => void;
  /** لون التمييز (لون الخدمة) */
  accent?: string;
  /** نسخة مضغوطة — داخل النموذج المنبثق */
  compact?: boolean;
}

const pad = (n: number) => String(n).padStart(2, "0");
/** مفتاح تاريخ محلي YYYY-MM-DD (بلا انزياح توقيت) */
const dateKey = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const hhmm = (t: string) => t.slice(0, 5);

/**
 * رزنامة اختيار موعد — تعرض الأيام التي فيها جلسات، وعند اختيار يوم تظهر ساعاته.
 * تُستخدم في صفحة الورشة وفي نموذج التسجيل — تجربة واحدة متسقة.
 */
export default function SessionCalendar({
  sessions,
  onPick,
  accent = "var(--rose)",
  compact = false,
}: SessionCalendarProps) {
  const t = useTranslations("booking");

  /** أيام الأسبوع مختصرة — تبدأ بالأحد (يمينًا في RTL) */
  const WEEKDAYS = [
    t("calendar.sun"),
    t("calendar.mon"),
    t("calendar.tue"),
    t("calendar.wed"),
    t("calendar.thu"),
    t("calendar.fri"),
    t("calendar.sat"),
  ];

  /** الجلسات مجمّعة حسب اليوم */
  const byDate = useMemo(() => {
    const map = new Map<string, CalendarSession[]>();
    for (const s of sessions) {
      const arr = map.get(s.date) ?? [];
      arr.push(s);
      map.set(s.date, arr);
    }
    // ترتيب ساعات كل يوم
    for (const arr of map.values()) arr.sort((a, b) => a.startTime.localeCompare(b.startTime));
    return map;
  }, [sessions]);

  /** أول يوم فيه مقاعد متاحة — نبدأ منه (لا من الشهر الحالي بالضرورة) */
  const firstOpen = useMemo(() => {
    const open = sessions.filter((s) => s.seatsLeft > 0).map((s) => s.date).sort();
    return open[0] ?? sessions.map((s) => s.date).sort()[0] ?? null;
  }, [sessions]);

  const initial = firstOpen ? new Date(firstOpen + "T00:00:00") : new Date();
  const [view, setView] = useState({ y: initial.getFullYear(), m: initial.getMonth() });
  const [selected, setSelected] = useState<string | null>(firstOpen);

  const today = new Date();
  const todayKey = dateKey(today.getFullYear(), today.getMonth(), today.getDate());

  /** خلايا الشهر: فراغات البداية + أيام الشهر */
  const cells = useMemo(() => {
    const firstWeekday = new Date(view.y, view.m, 1).getDay();
    const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
    const out: (number | null)[] = Array(firstWeekday).fill(null);
    for (let d = 1; d <= daysInMonth; d++) out.push(d);
    return out;
  }, [view]);

  /** هل يمكن الرجوع لشهر سابق؟ (لا نرجع قبل الشهر الحالي) */
  const canGoBack = view.y > today.getFullYear() || (view.y === today.getFullYear() && view.m > today.getMonth());

  /**
   * تنقّل بين الأشهر — ويختار أول يوم فيه جلسات في الشهر الجديد
   * (يفضّل يومًا فيه مقاعد) كي لا تبقى ساعات الشهر السابق معروضة.
   */
  function shiftMonth(delta: number) {
    const d = new Date(view.y, view.m + delta, 1);
    const next = { y: d.getFullYear(), m: d.getMonth() };
    setView(next);

    const prefix = `${next.y}-${pad(next.m + 1)}-`;
    const inMonth = [...byDate.keys()].filter((k) => k.startsWith(prefix)).sort();
    const openInMonth = inMonth.filter((k) => (byDate.get(k) ?? []).some((s) => s.seatsLeft > 0));
    setSelected(openInMonth[0] ?? inMonth[0] ?? null);
  }

  const selectedSessions = selected ? byDate.get(selected) ?? [] : [];
  const cellSize = compact ? 34 : 40;

  return (
    <div className="mx-auto" style={{ maxWidth: compact ? 380 : 480 }}>
      {/* ── رأس الشهر ── */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => shiftMonth(-1)}
          disabled={!canGoBack}
          aria-label={t("calendar.prevMonth")}
          className="w-8 h-8 rounded-full flex items-center justify-center active:scale-[0.95] [transition:transform_140ms_ease-out]"
          style={{
            border: "1.5px solid var(--bord)",
            background: "white",
            color: canGoBack ? "var(--dark)" : "var(--bord)",
            cursor: canGoBack ? "pointer" : "not-allowed",
          }}
        >
          ›
        </button>

        <div className="font-label font-extrabold text-dark" style={{ fontSize: compact ? 14 : 15 }} dir="ltr">
          {view.m + 1}/{view.y}
        </div>

        <button
          onClick={() => shiftMonth(1)}
          aria-label={t("calendar.nextMonth")}
          className="w-8 h-8 rounded-full flex items-center justify-center active:scale-[0.95] [transition:transform_140ms_ease-out]"
          style={{ border: "1.5px solid var(--bord)", background: "white", color: "var(--dark)", cursor: "pointer" }}
        >
          ‹
        </button>
      </div>

      {/* ── أيام الأسبوع ── */}
      <div className="grid grid-cols-7 gap-1 mb-1.5">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-center font-label text-light" style={{ fontSize: 10.5 }}>
            {w}
          </div>
        ))}
      </div>

      {/* ── شبكة الأيام ── */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`b${i}`} style={{ height: cellSize }} />;

          const key = dateKey(view.y, view.m, day);
          const daySessions = byDate.get(key) ?? [];
          const hasOpen = daySessions.some((s) => s.seatsLeft > 0);
          const isFullDay = daySessions.length > 0 && !hasOpen;
          const isPast = key < todayKey;
          const isSelected = selected === key;
          const clickable = daySessions.length > 0 && !isPast;

          return (
            <button
              key={key}
              onClick={() => clickable && setSelected(key)}
              disabled={!clickable}
              className="rounded-[10px] flex flex-col items-center justify-center font-label [transition:background-color_160ms_ease,color_160ms_ease]"
              style={{
                height: cellSize,
                fontSize: compact ? 12.5 : 13.5,
                fontWeight: clickable ? 700 : 500,
                cursor: clickable ? "pointer" : "default",
                border: isSelected ? `1.5px solid ${accent}` : "1.5px solid transparent",
                background: isSelected
                  ? accent
                  : hasOpen && !isPast
                    ? "rgba(130,201,196,0.16)"
                    : "transparent",
                color: isSelected
                  ? "white"
                  : isPast || daySessions.length === 0
                    ? "var(--bord)"
                    : isFullDay
                      ? "var(--light)"
                      : "var(--dark)",
                textDecoration: isFullDay && !isSelected ? "line-through" : "none",
              }}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* ── ساعات اليوم المختار ── */}
      <div className="mt-5">
        {!selected || selectedSessions.length === 0 ? (
          <p className="text-center font-label text-[12.5px] text-light">
            {t("calendar.pickDayHint")}
          </p>
        ) : (
          <>
            <p className="font-label font-bold text-dark text-[13px] mb-2.5 text-center">
              {t("calendar.sessionsOn")} <span dir="ltr">{selected.split("-").reverse().join("/")}</span>
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {selectedSessions.map((s) => {
                const full = s.seatsLeft <= 0;
                return (
                  <button
                    key={s.id}
                    onClick={() => !full && onPick(s.id)}
                    disabled={full}
                    className="rounded-xl text-right active:scale-[0.98] [transition:transform_140ms_ease-out,border-color_160ms_ease]"
                    style={{
                      border: `1.5px solid ${full ? "var(--bord)" : "var(--mint)"}`,
                      background: full ? "var(--offwh)" : "white",
                      padding: "9px 14px",
                      cursor: full ? "not-allowed" : "pointer",
                      opacity: full ? 0.65 : 1,
                      minWidth: 132,
                    }}
                  >
                    <div className="font-label font-extrabold text-dark" style={{ fontSize: 14 }} dir="ltr">
                      {hhmm(s.startTime)}{s.endTime ? `–${hhmm(s.endTime)}` : ""}
                    </div>
                    <div className="font-label text-light" style={{ fontSize: 11 }}>
                      {full ? t("calendar.full") : seatsLabel(s.seatsLeft)}
                      {s.price > 0 ? ` · ₪${s.price}` : ""}
                    </div>
                    <div className="font-label text-light" style={{ fontSize: 10.5 }}>
                      {s.isOnline ? t("calendar.online") : s.location ? `📍 ${s.location}` : ""}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
