"use client";

import { useMemo, useState } from "react";
import { CalendarPlus } from "lucide-react";
import { createSessionsAction } from "@/app/admin/(panel)/bookings/availability/actions";
import { addDaysToDate, addMinutesToTime, consecutiveTimes, isValidRange, weekdayAr } from "@/lib/sessions/time";
import { formatSlotDate } from "@/lib/utils/format";
import type { ServiceOption } from "./types";

type Mode = "single" | "series" | "weekly";

const MODES: { value: Mode; label: string; hint: string }[] = [
  { value: "single", label: "موعد واحد", hint: "جلسة واحدة في تاريخ ووقت" },
  { value: "series", label: "مواعيد متتالية", hint: "عدّة جلسات في يوم واحد، واحدة بعد الأخرى" },
  { value: "weekly", label: "تكرار أسبوعي", hint: "الجلسة نفسها كل أسبوع لعدد من الأسابيع" },
];

const MAX_WEEKS = 12;

const inputCls =
  "w-full px-3 py-2.5 rounded-xl border border-bord bg-offwh text-body-sm text-dark focus:outline-none focus:border-rose";
const labelCls = "flex flex-col gap-1.5";
const captionCls = "text-micro text-light font-label";

/**
 * نموذج إضافة المواعيد — اختيار الخدمة يعبّئ السعر والمقاعد والمدّة والرابط/المكان،
 * والنموذج يعرض ما سيُنشأ قبل الضغط. القائمة النهائية تُرسل JSON للفعل.
 */
export default function SessionCreateForm({
  services,
  defaultDate,
  day,
}: {
  services: ServiceOption[];
  /** اليوم المختار في الرزنامة — يُعبَّأ في التاريخ ويتبعه حين يتغيّر */
  defaultDate: string;
  /** يعود في الرابط بعد الإضافة كي يبقى اليوم مختارًا */
  day: string;
}) {
  const [serviceSlug, setServiceSlug] = useState(services[0]?.slug ?? "");
  const service = services.find((s) => s.slug === serviceSlug) ?? null;

  const [mode, setMode] = useState<Mode>("single");
  const [date, setDate] = useState(defaultDate);
  // اليوم المختار في الرزنامة تغيّر → يتبعه التاريخ (تعديل الحالة أثناء التصيير، لا في effect)
  const [prevDefault, setPrevDefault] = useState(defaultDate);
  if (prevDefault !== defaultDate) {
    setPrevDefault(defaultDate);
    setDate(defaultDate);
  }
  const [start, setStart] = useState("10:00");
  const [duration, setDuration] = useState(service?.durationMin ?? 60);
  const [end, setEnd] = useState(addMinutesToTime("10:00", service?.durationMin ?? 60) ?? "11:00");
  const [seriesUntil, setSeriesUntil] = useState("14:00");
  const [gap, setGap] = useState(0);
  const [weeks, setWeeks] = useState(4);
  const [capacity, setCapacity] = useState(service?.capacity ?? 1);
  const [price, setPrice] = useState(service?.price ?? 0);
  const [meetingLink, setMeetingLink] = useState(service?.meetingLink ?? "");
  const [location, setLocation] = useState(service?.location ?? "");
  const [notes, setNotes] = useState("");

  /** اختيار خدمة أخرى يعيد تعبئة كل ما يخصّها */
  function pickService(slug: string) {
    setServiceSlug(slug);
    const s = services.find((x) => x.slug === slug);
    if (!s) return;
    setDuration(s.durationMin);
    setEnd(addMinutesToTime(start, s.durationMin) ?? end);
    setCapacity(s.capacity);
    setPrice(s.price);
    setMeetingLink(s.meetingLink);
    setLocation(s.location);
  }

  function changeStart(value: string) {
    setStart(value);
    if (value) setEnd(addMinutesToTime(value, duration) ?? end);
  }

  function changeDuration(value: number) {
    const d = Math.max(15, Math.round(value));
    setDuration(d);
    if (start) setEnd(addMinutesToTime(start, d) ?? end);
  }

  /** المواعيد التي ستُنشأ فعلًا — نفس القائمة تُعرض وتُرسل */
  const planned = useMemo(() => {
    if (!date || !start) return [];
    if (mode === "series") {
      return consecutiveTimes(start, seriesUntil, duration, gap).map((t) => ({ date, ...t }));
    }
    if (!end || !isValidRange(start, end)) return [];
    if (mode === "weekly") {
      return Array.from({ length: Math.min(MAX_WEEKS, Math.max(1, weeks)) }, (_, i) => ({
        date: addDaysToDate(date, 7 * i),
        start,
        end,
      }));
    }
    return [{ date, start, end }];
  }, [mode, date, start, end, seriesUntil, duration, gap, weeks]);

  const first = planned[0];
  const last = planned[planned.length - 1];

  return (
    <form action={createSessionsAction} className="bg-white rounded-[var(--rl)] border border-bord p-5">
      <input type="hidden" name="day" value={day} />
      <h2 className="font-heading font-bold text-dark text-body mb-4">
        إضافة مواعيد
        {date && <span className="text-light font-body text-body-sm font-normal"> · {weekdayAr(date)} {formatSlotDate(date)}</span>}
      </h2>

      {/* ── الخدمة والنمط ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3 mb-4">
        <label className={labelCls}>
          <span className={captionCls}>الخدمة</span>
          <select name="service" value={serviceSlug} onChange={(e) => pickService(e.target.value)} className={inputCls} required>
            {services.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.title}
                {s.online ? " · أونلاين" : ""}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap gap-2 items-end">
          {MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMode(m.value)}
              title={m.hint}
              className={`px-3.5 py-2.5 rounded-xl text-body-sm font-bold border transition ${
                mode === m.value ? "bg-dark text-white border-dark" : "bg-offwh text-mid border-bord hover:border-dark"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── التاريخ والوقت ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <label className={`${labelCls} col-span-2 sm:col-span-1 lg:col-span-2`}>
          <span className={captionCls}>{mode === "weekly" ? "تاريخ أول جلسة" : "التاريخ"}</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} required />
        </label>
        <label className={labelCls}>
          <span className={captionCls}>{mode === "series" ? "أول موعد" : "من الساعة"}</span>
          <input type="time" value={start} onChange={(e) => changeStart(e.target.value)} className={inputCls} required />
        </label>
        {mode === "series" ? (
          <>
            <label className={labelCls}>
              <span className={captionCls}>حتى الساعة</span>
              <input type="time" value={seriesUntil} onChange={(e) => setSeriesUntil(e.target.value)} className={inputCls} required />
            </label>
            <label className={labelCls}>
              <span className={captionCls}>مدّة الجلسة (دقيقة)</span>
              <input type="number" min={15} step={5} value={duration} onChange={(e) => changeDuration(Number(e.target.value))} className={inputCls} />
            </label>
            <label className={labelCls}>
              <span className={captionCls}>استراحة بينها (دقيقة)</span>
              <input type="number" min={0} step={5} value={gap} onChange={(e) => setGap(Math.max(0, Number(e.target.value) || 0))} className={inputCls} />
            </label>
          </>
        ) : (
          <>
            <label className={labelCls}>
              <span className={captionCls}>إلى الساعة</span>
              <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className={inputCls} required />
            </label>
            {mode === "weekly" && (
              <label className={labelCls}>
                <span className={captionCls}>عدد الأسابيع</span>
                <input type="number" min={1} max={MAX_WEEKS} value={weeks} onChange={(e) => setWeeks(Number(e.target.value) || 1)} className={inputCls} />
              </label>
            )}
          </>
        )}
        <label className={labelCls}>
          <span className={captionCls}>المقاعد</span>
          <input name="capacity" type="number" min={1} value={capacity} onChange={(e) => setCapacity(Math.max(1, Number(e.target.value) || 1))} className={inputCls} />
        </label>
        <label className={labelCls}>
          <span className={captionCls}>السعر ₪</span>
          <input name="price" type="number" min={0} value={price} onChange={(e) => setPrice(Math.max(0, Number(e.target.value) || 0))} className={inputCls} />
        </label>
      </div>

      {/* ── المكان أو الرابط ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
        {service?.online ? (
          <label className={`${labelCls} lg:col-span-2`}>
            <span className={captionCls}>رابط اللقاء (زوم) — يصل المسجِّلة في تذكير اليوم السابق</span>
            <input name="meeting_link" type="url" dir="ltr" value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} placeholder="https://zoom.us/j/..." className={inputCls} />
            {!meetingLink && (
              <span className="text-micro text-rose">لا رابط ثابت مضبوط — اضبطيه مرة واحدة في الإعدادات كي يُعبَّأ تلقائيًا.</span>
            )}
          </label>
        ) : (
          <label className={`${labelCls} lg:col-span-2`}>
            <span className={captionCls}>المكان — يصل المسجِّلة في تذكير اليوم السابق</span>
            <input name="location" type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="مثال: الناصرة، شارع … رقم …" className={inputCls} />
          </label>
        )}
        <label className={`${labelCls} lg:col-span-2`}>
          <span className={captionCls}>ملاحظة داخلية (اختياري — لا تظهر للعميلات)</span>
          <input name="notes" type="text" value={notes} onChange={(e) => setNotes(e.target.value)} className={inputCls} />
        </label>
      </div>

      {/* ── ما سيُنشأ ── */}
      <input type="hidden" name="sessions" value={JSON.stringify(planned)} />
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-body-sm text-mid">
          {planned.length === 0 ? (
            <span className="text-light">اختاري التاريخ والوقت لترَي ما سيُنشأ.</span>
          ) : planned.length === 1 && first ? (
            <>
              سيُنشأ موعد واحد: {weekdayAr(first.date)} {formatSlotDate(first.date)} ·{" "}
              <span dir="ltr">{first.start}–{first.end}</span>
            </>
          ) : (
            first && last && (
              <>
                سيُنشأ <strong className="text-dark">{planned.length}</strong> مواعيد — من {weekdayAr(first.date)}{" "}
                {formatSlotDate(first.date)} <span dir="ltr">{first.start}</span> إلى {weekdayAr(last.date)} {formatSlotDate(last.date)}{" "}
                <span dir="ltr">{last.start}</span>
              </>
            )
          )}
        </p>
        <button
          type="submit"
          disabled={planned.length === 0}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-dark text-white text-body-sm font-bold hover:brightness-125 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <CalendarPlus size={16} /> {planned.length > 1 ? `إضافة ${planned.length} مواعيد` : "إضافة الموعد"}
        </button>
      </div>
    </form>
  );
}
