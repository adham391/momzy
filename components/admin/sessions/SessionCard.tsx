"use client";

import { useState } from "react";
import { Ban, Eye, MapPin, Pencil, Trash2, UserPlus, Video, X } from "lucide-react";
import {
  cancelSessionAction,
  createManualBookingAction,
  deleteSessionAction,
  toggleSessionBlockedAction,
  updateSessionAction,
} from "@/app/admin/(panel)/bookings/availability/actions";
import type { SlotRow } from "@/lib/db/bookings";
import type { SessionBooking } from "@/lib/db/sessions";
import type { ServiceOption } from "./types";
import { formatCharged } from "@/lib/currency";
import { shortTime } from "@/lib/sessions/time";
import { formatSlotDate } from "@/lib/utils/format";
import { whatsappLink } from "@/lib/utils/whatsapp";

const inputCls =
  "w-full px-3 py-2 rounded-xl border border-bord bg-offwh text-body-sm text-dark focus:outline-none focus:border-rose";
const captionCls = "text-micro text-light font-label";
const labelCls = "flex flex-col gap-1";
const smallBtn = "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-body-sm font-bold border transition";

/** بطاقة جلسة في لوحة المواعيد — ملخّص، مسجِّلات، تعديل في المكان، حجب، إلغاء */
export default function SessionCard({
  slot,
  bookings,
  day,
  service,
}: {
  slot: SlotRow;
  bookings: SessionBooking[];
  day: string;
  /** ما تسأله هذه الخدمة — يحدّد حقول التسجيل اليدوي */
  service: ServiceOption | null;
}) {
  const [editing, setEditing] = useState(false);
  /** نموذج التسجيل اليدوي — مطويّ حتى تحتاجه */
  const [adding, setAdding] = useState(false);
  /** خدمة ما قبل الولادة: حامل أم بعد الولادة — يحدّد أي حقل يظهر */
  const [stage, setStage] = useState<"pregnant" | "postpartum">("pregnant");
  const prenatal = typeof service?.minPregnancyWeek === "number";
  /** يُسأل عن الطفل: ورشة بفئة عمرية، أو خدمة ما قبل الولادة لأمٍّ ولدت */
  const asksBaby = prenatal
    ? stage === "postpartum"
    : typeof service?.ageMinMonths === "number" || typeof service?.ageMaxMonths === "number";
  const full = slot.booked_count >= slot.capacity;
  const confirmedCount = bookings.filter((b) => b.payment_status === "paid" || b.amount === 0).length;

  return (
    <div className={`bg-white rounded-[var(--r)] border ${slot.is_blocked ? "border-dashed border-light" : "border-bord"} p-4`}>
      {/* ── الملخّص ── */}
      <div className="flex flex-wrap items-start gap-3">
        <div className="font-label font-extrabold text-dark text-body whitespace-nowrap" dir="ltr">
          {shortTime(slot.start_time)}–{shortTime(slot.end_time)}
        </div>
        <div className="flex-1 min-w-[180px]">
          <div className="font-semibold text-dark text-body-sm">{slot.service_name}</div>
          <div className="text-micro text-light flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
            {slot.price > 0 && <span>₪{slot.price}</span>}
            {slot.meeting_link ? (
              <span className="inline-flex items-center gap-1"><Video size={12} /> أونلاين</span>
            ) : slot.location ? (
              <span className="inline-flex items-center gap-1"><MapPin size={12} /> {slot.location}</span>
            ) : (
              <span className="text-rose">بلا رابط ولا مكان</span>
            )}
            {slot.notes && <span>· {slot.notes}</span>}
          </div>
          {slot.is_blocked && (
            <div className="text-micro font-bold text-rose mt-1">
              محجوبة — لا تظهر للعميلات{slot.block_reason ? ` (${slot.block_reason})` : ""}
            </div>
          )}
        </div>
        <div className="text-center shrink-0">
          <div className={`font-label font-extrabold text-body-sm ${full ? "text-rose" : "text-teal"}`}>
            {slot.booked_count}/{slot.capacity}
          </div>
          <div className="text-micro text-light">{full ? "اكتمل" : "محجوز"}</div>
        </div>
      </div>

      {/* ── المسجِّلات ── */}
      {bookings.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1.5 border-t border-bord pt-3">
          {bookings.map((b) => {
            const paid = b.payment_status === "paid" || b.amount === 0;
            const wa = whatsappLink(
              b.customer_phone,
              `مرحبًا ${b.customer_name}، بخصوص تسجيلك في «${slot.service_name ?? ""}» يوم ${formatSlotDate(slot.date)} الساعة ${shortTime(slot.start_time)}: `
            );
            return (
              <li key={b.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-body-sm">
                <span className="font-semibold text-dark">{b.customer_name}</span>
                <span className="text-light" dir="ltr">{b.customer_phone}</span>
                <span className={`text-micro font-bold ${paid ? "text-teal" : "text-rose"}`}>
                  {b.amount === 0 ? "مجاني" : paid ? `مدفوع ${formatCharged(b.amount, b.currency, b.charged_amount)}` : "لم تدفع بعد"}
                </span>
                {wa && (
                  <a href={wa} target="_blank" rel="noopener noreferrer" className="text-micro font-bold text-teal hover:underline">
                    واتساب ←
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* ── الأزرار ── */}
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => setEditing((v) => !v)} className={`${smallBtn} text-dark border-bord hover:bg-offwh`}>
          {editing ? <X size={14} /> : <Pencil size={14} />} {editing ? "إغلاق" : "تعديل"}
        </button>

        <button type="button" onClick={() => setAdding((v) => !v)} className={`${smallBtn} text-teal border-bord hover:bg-tealpale`}>
          {adding ? <X size={14} /> : <UserPlus size={14} />} {adding ? "إغلاق" : "تسجيل يدوي"}
        </button>

        <form
          action={toggleSessionBlockedAction}
          onSubmit={(e) => {
            if (slot.is_blocked) return;
            const reason = window.prompt("سبب الحجب (اختياري — يظهر لكِ فقط):", "");
            if (reason === null) return e.preventDefault();
            (e.currentTarget.elements.namedItem("reason") as HTMLInputElement).value = reason;
          }}
        >
          <input type="hidden" name="id" value={slot.id} />
          <input type="hidden" name="day" value={day} />
          <input type="hidden" name="block" value={slot.is_blocked ? "0" : "1"} />
          <input type="hidden" name="reason" value="" />
          <button type="submit" className={`${smallBtn} text-mid border-bord hover:bg-offwh`}>
            {slot.is_blocked ? <Eye size={14} /> : <Ban size={14} />} {slot.is_blocked ? "إظهار" : "حجب مؤقت"}
          </button>
        </form>

        {bookings.length > 0 ? (
          <form
            action={cancelSessionAction}
            onSubmit={(e) => {
              const paid = bookings.filter((b) => b.payment_status === "paid" && b.amount > 0).length;
              const msg =
                `إلغاء هذه الجلسة يلغي ${bookings.length} تسجيل ويرسل بريد اعتذار إلى الأمهات.` +
                (paid > 0 ? `\n${paid} منهنّ دفعن — ستعيدين المبالغ يدويًا من HYP.` : "") +
                "\n\nهل تريدين المتابعة؟";
              if (!window.confirm(msg)) return e.preventDefault();
              const note = window.prompt("سبب الإلغاء (اختياري — يُسجَّل في تاريخ كل حجز):", "") ?? "";
              (e.currentTarget.elements.namedItem("note") as HTMLInputElement).value = note;
            }}
          >
            <input type="hidden" name="id" value={slot.id} />
            <input type="hidden" name="day" value={day} />
            <input type="hidden" name="note" value="" />
            <button type="submit" className={`${smallBtn} text-rose border-bord hover:bg-rosepale`}>
              <Trash2 size={14} /> إلغاء الجلسة وإبلاغ المسجِّلات
            </button>
          </form>
        ) : (
          <form action={deleteSessionAction} onSubmit={(e) => !window.confirm("حذف هذه الجلسة؟") && e.preventDefault()}>
            <input type="hidden" name="id" value={slot.id} />
            <input type="hidden" name="day" value={day} />
            <button type="submit" className={`${smallBtn} text-rose border-bord hover:bg-rosepale`}>
              <Trash2 size={14} /> حذف
            </button>
          </form>
        )}
      </div>

      {/* ── التعديل في المكان ── */}
      {editing && (
        <form action={updateSessionAction} className="mt-4 border-t border-bord pt-4">
          <input type="hidden" name="id" value={slot.id} />
          <input type="hidden" name="day" value={day} />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <label className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
              <span className={captionCls}>التاريخ</span>
              <input name="date" type="date" defaultValue={slot.date} className={inputCls} required />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={captionCls}>من</span>
              <input name="start_time" type="time" defaultValue={shortTime(slot.start_time)} className={inputCls} required />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={captionCls}>إلى</span>
              <input name="end_time" type="time" defaultValue={shortTime(slot.end_time)} className={inputCls} required />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={captionCls}>المقاعد (محجوز {slot.booked_count})</span>
              <input name="capacity" type="number" min={Math.max(1, slot.booked_count)} defaultValue={slot.capacity} className={inputCls} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={captionCls}>السعر ₪</span>
              <input name="price" type="number" min={0} defaultValue={slot.price} className={inputCls} />
            </label>
            <label className="flex flex-col gap-1.5 col-span-2 sm:col-span-3 lg:col-span-3">
              <span className={captionCls}>رابط اللقاء (أونلاين)</span>
              <input name="meeting_link" type="url" dir="ltr" defaultValue={slot.meeting_link ?? ""} className={inputCls} />
            </label>
            <label className="flex flex-col gap-1.5 col-span-2 sm:col-span-3 lg:col-span-2">
              <span className={captionCls}>المكان (حضوري)</span>
              <input name="location" type="text" defaultValue={slot.location ?? ""} className={inputCls} />
            </label>
            <label className="flex flex-col gap-1.5 col-span-2 sm:col-span-3 lg:col-span-5">
              <span className={captionCls}>ملاحظة داخلية</span>
              <input name="notes" type="text" defaultValue={slot.notes ?? ""} className={inputCls} />
            </label>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-micro text-mid">
              {confirmedCount > 0
                ? `تغيير التاريخ أو الوقت يرسل بريدًا تلقائيًا بالموعد الجديد إلى ${confirmedCount} من المسجِّلات.`
                : "لا مسجِّلات مؤكَّدات — التعديل لا يرسل شيئًا."}
            </p>
            <button type="submit" className="px-5 py-2 rounded-xl bg-dark text-white text-body-sm font-bold hover:brightness-125 transition">
              حفظ التعديل
            </button>
          </div>
        </form>
      )}

      {/* ── تسجيل يدوي — لأمٍّ سجّلت على الواتساب أو بالهاتف ── */}
      {adding && (
        <form action={createManualBookingAction} className="mt-3 pt-3 border-t border-bord">
          <input type="hidden" name="id" value={slot.id} />
          <input type="hidden" name="day" value={day} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className={labelCls}>
              <span className={captionCls}>اسم الأم *</span>
              <input name="customer_name" type="text" required className={inputCls} />
            </label>
            <label className={labelCls}>
              <span className={captionCls}>الهاتف *</span>
              <input name="customer_phone" type="tel" dir="ltr" required className={inputCls} />
            </label>
            <label className={labelCls}>
              <span className={captionCls}>البريد (اختياري — بدونه لا يصلها تذكير الرابط)</span>
              <input name="customer_email" type="email" dir="ltr" className={inputCls} />
            </label>
            <label className={labelCls}>
              <span className={captionCls}>البلدة (اختياري)</span>
              <input name="city" type="text" className={inputCls} />
            </label>
{/* حقول التسجيل نفسها التي تسألها هذه الخدمة على الموقع */}
            {prenatal && (
              <label className={`${labelCls} sm:col-span-2`}>
                <span className={captionCls}>حالتها</span>
                <div className="flex gap-2">
                  {([
                    ["pregnant", "حامل"],
                    ["postpartum", "بعد الولادة"],
                  ] as const).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setStage(value)}
                      className={`${smallBtn} ${
                        stage === value ? "bg-dark text-white border-dark" : "text-mid border-bord hover:bg-offwh"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <input type="hidden" name="stage" value={stage} />
              </label>
            )}

            {prenatal && stage === "pregnant" && (
              <label className={labelCls}>
                <span className={captionCls}>أسبوع الحمل الآن</span>
                <input name="pregnancy_week" type="number" min={4} max={42} dir="ltr" className={inputCls} />
              </label>
            )}

            {asksBaby && (
              <>
                <label className={labelCls}>
                  <span className={captionCls}>تاريخ ميلاد الطفل</span>
                  <input name="baby_birth_date" type="date" dir="ltr" className={inputCls} />
                </label>
                <label className={labelCls}>
                  <span className={captionCls}>اسم الطفل</span>
                  <input name="baby_name" type="text" className={inputCls} />
                </label>
              </>
            )}

            {asksBaby && !prenatal && (
              <label className={`${labelCls} sm:col-span-2`}>
                <span className={captionCls}>خديج؟ (اتركيه فارغًا لمن وُلد في موعده)</span>
                <div className="flex items-center gap-2">
                  <input
                    name="gestational_weeks"
                    type="number"
                    min={22}
                    max={36}
                    dir="ltr"
                    placeholder="أسبوع الولادة — 32 مثلًا"
                    className={inputCls}
                  />
                </div>
              </label>
            )}

            {service?.askTopic && (
              <label className={`${labelCls} sm:col-span-2`}>
                <span className={captionCls}>موضوع اللقاء</span>
                <input name="topic" type="text" className={inputCls} />
              </label>
            )}

            <label className={`${labelCls} sm:col-span-2`}>
              <span className={captionCls}>ملاحظات (اختياري)</span>
              <textarea name="notes" rows={2} className={inputCls} />
            </label>
          </div>
          {/* المقبوض فعلًا — العربون حالة يومية في اللقاءات التي تُرتَّب مع هبة مباشرةً */}
          <label className={`${labelCls} mt-3 max-w-[280px]`}>
            <span className={captionCls}>المبلغ المقبوض ₪</span>
            <input
              name="received"
              type="number"
              min={0}
              step={1}
              dir="ltr"
              defaultValue={slot.price}
              className={inputCls}
            />
            <span className="text-micro text-light">
              صفر = لم تدفع بعد · أقلّ من {slot.price} = عربون، ويظهر لكِ المتبقّي
            </span>
          </label>
          <div className="mt-3 flex gap-2">
            <button type="submit" className={`${smallBtn} bg-dark text-white border-dark`}>
              حفظ التسجيل
            </button>
            <button type="button" onClick={() => setAdding(false)} className={`${smallBtn} text-mid border-bord hover:bg-offwh`}>
              إلغاء
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
