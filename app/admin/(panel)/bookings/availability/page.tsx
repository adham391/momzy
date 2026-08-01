import Link from "next/link";
import { ArrowRight, CalendarPlus } from "lucide-react";
import { getServices } from "@/lib/services/getServices";
import { listUpcomingSlots } from "@/lib/db/bookings";
import { createSlotAction, deleteSlotAction } from "../actions";
import { formatSlotDate, formatTimeShort, formatILS } from "@/lib/utils/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "إتاحة المواعيد — لوحة Momzy" };

export default async function AvailabilityPage() {
  const [services, slots] = await Promise.all([getServices(), listUpcomingSlots()]);

  const inputCls =
    "w-full px-3 py-2.5 rounded-xl border border-bord bg-offwh text-body-sm text-dark focus:outline-none focus:border-rose";

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Link href="/admin/bookings" className="inline-flex items-center gap-1.5 text-body-sm text-mid hover:text-dark">
          <ArrowRight size={16} /> الحجوزات
        </Link>
        <Link href="/admin/bookings/waitlist" className="text-body-sm font-bold text-teal hover:underline">
          قائمة الانتظار ←
        </Link>
      </div>

      <h1 className="font-heading text-h2 font-bold text-dark mb-1">إتاحة المواعيد</h1>
      <p className="text-mid text-body-sm mb-6">أضيفي المواعيد المتاحة للحجز — تظهر للعميلات في صفحة الخدمة.</p>

      {/* ── نموذج فتحة جديدة ── */}
      {services.length === 0 ? (
        <p className="text-mid text-body-sm bg-white rounded-[var(--rl)] border border-bord p-5 mb-6">
          أضيفي خدمة في Studio أولاً كي تتمكّني من فتح مواعيد لها.
        </p>
      ) : (
        <form action={createSlotAction} className="bg-white rounded-[var(--rl)] border border-bord p-5 mb-6">
          <h2 className="font-heading font-bold text-dark text-body mb-4">فتحة موعد جديدة</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <label className="flex flex-col gap-1.5 lg:col-span-3">
              <span className="text-micro text-light font-label">الخدمة</span>
              <select name="service" className={inputCls} required defaultValue="">
                <option value="" disabled>اختاري الخدمة</option>
                {services.map((s) => (
                  <option key={s.slug} value={s.slug}>{s.title}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-micro text-light font-label">التاريخ</span>
              <input name="date" type="date" className={inputCls} required />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-micro text-light font-label">من الساعة</span>
              <input name="start_time" type="time" className={inputCls} required />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-micro text-light font-label">إلى الساعة</span>
              <input name="end_time" type="time" className={inputCls} required />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-micro text-light font-label">عدد المقاعد</span>
              <input name="capacity" type="number" min={1} defaultValue={1} className={inputCls} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-micro text-light font-label">السعر ₪ (اختياري)</span>
              <input name="price" type="number" min={0} placeholder="سعر الخدمة" className={inputCls} />
            </label>
            <label className="flex flex-col gap-1.5 lg:col-span-2">
              <span className="text-micro text-light font-label">رابط اللقاء — للورشة الأونلاين</span>
              <input name="meeting_link" type="url" dir="ltr" placeholder="https://zoom.us/j/..." className={inputCls} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-micro text-light font-label">المكان — للورشة الحضورية</span>
              <input name="location" type="text" placeholder="مثال: حيفا، شارع الجبل 12" className={inputCls} />
            </label>
          </div>
          <p className="text-micro text-light mt-3">
            املئي رابط اللقاء <strong>أو</strong> المكان حسب نوع الورشة — يظهر للمسجِّلة بعد إتمام الدفع فقط.
          </p>
          <button type="submit" className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-dark text-white text-body-sm font-bold hover:brightness-125 transition">
            <CalendarPlus size={16} /> إضافة الموعد
          </button>
        </form>
      )}

      {/* ── الفتحات القادمة ── */}
      <h2 className="font-heading font-bold text-dark text-body mb-3">المواعيد القادمة ({slots.length})</h2>
      {slots.length === 0 ? (
        <p className="text-light text-body-sm bg-white rounded-[var(--rl)] border border-bord py-10 text-center">
          لا مواعيد متاحة — أضيفي فتحة من الأعلى.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {slots.map((slot) => {
            const full = slot.booked_count >= slot.capacity;
            return (
              <div key={slot.id} className="bg-white rounded-[var(--r)] border border-bord p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-dark text-body-sm truncate">{slot.service_name}</div>
                  <div className="text-micro text-light">
                    {formatSlotDate(slot.date)} · {formatTimeShort(slot.start_time)}–{formatTimeShort(slot.end_time)}
                    {slot.price > 0 ? ` · ${formatILS(slot.price)}` : ""}
                    {slot.meeting_link ? " · 💻 أونلاين" : slot.location ? ` · 📍 ${slot.location}` : ""}
                  </div>
                </div>
                <div className="text-center shrink-0">
                  <div className={full ? "text-rose font-bold text-body-sm" : "text-dark font-bold text-body-sm"}>
                    {slot.booked_count}/{slot.capacity}
                  </div>
                  <div className="text-micro text-light">محجوز</div>
                </div>
                <form action={deleteSlotAction}>
                  <input type="hidden" name="id" value={slot.id} />
                  <button type="submit" className="px-3 py-1.5 rounded-lg text-body-sm font-bold text-rose border border-bord hover:bg-rosepale transition">
                    حذف
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
