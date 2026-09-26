"use client";

import { useState } from "react";
import { Pencil, X } from "lucide-react";
import { updateBookingDetailsAction } from "@/app/admin/(panel)/bookings/actions";

const inputCls =
  "w-full px-3 py-2 rounded-xl border border-bord bg-offwh text-body-sm text-dark focus:outline-none focus:border-rose";
const captionCls = "text-micro text-light font-label";
const labelCls = "flex flex-col gap-1";

/** بيانات الحجز القابلة للتصحيح — تُملأ من الصفّ كما هو */
export interface BookingEditValues {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  city: string | null;
  notes: string | null;
  topic: string | null;
  babyBirthDate: string | null;
  babyName: string | null;
  gestationalWeeks: number | null;
  pregnancyWeek: number | null;
  /** سعر الجلسة — يُقاس عليه «المقبوض» */
  amount: number;
  /** ما قُبض فعلًا: العربون إن وُجد، وإلا المبلغ كاملًا (أو صفر لمن لم تدفع) */
  received: number;
}

/**
 * تصحيح بيانات مسجِّلة — اسمٌ كُتب خطأً، رقمٌ ناقص، مبلغٌ سُجّل غلطًا.
 *
 * تظهر الحقول التي فيها قيمة فقط، ومعها ما يُخطئ فيه الجميع (الاسم والهاتف
 * والبريد والبلدة والملاحظات والمبلغ) — فلا يرى الأدمن خانات لا تعني حجزه.
 */
export default function BookingEditForm({ values }: { values: BookingEditValues }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-body-sm font-bold border border-bord text-dark hover:bg-offwh transition"
      >
        <Pencil size={14} /> تعديل
      </button>
    );
  }

  return (
    <form
      /* ينتظر حفظ الخادم ثم يُغلق — الفعل وحده لا يُعلم المتصفّح أن الحفظ انتهى */
      action={async (formData) => {
        setSaving(true);
        try {
          await updateBookingDetailsAction(formData);
          setOpen(false);
        } finally {
          setSaving(false);
        }
      }}
      className="w-full mt-3 pt-3 border-t border-bord"
    >
      <input type="hidden" name="bookingId" value={values.id} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className={labelCls}>
          <span className={captionCls}>اسم الأم *</span>
          <input name="customer_name" type="text" required defaultValue={values.customerName} className={inputCls} />
        </label>
        <label className={labelCls}>
          <span className={captionCls}>الهاتف *</span>
          <input name="customer_phone" type="tel" dir="ltr" required defaultValue={values.customerPhone} className={inputCls} />
        </label>
        <label className={labelCls}>
          <span className={captionCls}>البريد (بدونه لا يصلها تذكير الرابط)</span>
          <input name="customer_email" type="email" dir="ltr" defaultValue={values.customerEmail} className={inputCls} />
        </label>
        <label className={labelCls}>
          <span className={captionCls}>البلدة</span>
          <input name="city" type="text" defaultValue={values.city ?? ""} className={inputCls} />
        </label>

        {values.pregnancyWeek !== null && (
          <label className={labelCls}>
            <span className={captionCls}>أسبوع الحمل (كما كان يوم التسجيل)</span>
            <input name="pregnancy_week" type="number" min={4} max={42} dir="ltr" defaultValue={values.pregnancyWeek} className={inputCls} />
          </label>
        )}
        {values.babyBirthDate && (
          <>
            <label className={labelCls}>
              <span className={captionCls}>تاريخ ميلاد الطفل</span>
              <input name="baby_birth_date" type="date" dir="ltr" defaultValue={values.babyBirthDate} className={inputCls} />
            </label>
            <label className={labelCls}>
              <span className={captionCls}>اسم الطفل</span>
              <input name="baby_name" type="text" defaultValue={values.babyName ?? ""} className={inputCls} />
            </label>
            <label className={labelCls}>
              <span className={captionCls}>أسبوع الولادة (فارغ = وُلد في موعده)</span>
              <input name="gestational_weeks" type="number" min={22} max={36} dir="ltr" defaultValue={values.gestationalWeeks ?? ""} className={inputCls} />
            </label>
          </>
        )}
        {values.topic !== null && (
          <label className={`${labelCls} sm:col-span-2`}>
            <span className={captionCls}>موضوع اللقاء</span>
            <input name="topic" type="text" defaultValue={values.topic} className={inputCls} />
          </label>
        )}
        <label className={`${labelCls} sm:col-span-2`}>
          <span className={captionCls}>ملاحظات</span>
          <textarea name="notes" rows={2} defaultValue={values.notes ?? ""} className={inputCls} />
        </label>
        <label className={labelCls}>
          <span className={captionCls}>المبلغ المقبوض ₪</span>
          <input name="received" type="number" min={0} step={1} dir="ltr" defaultValue={values.received} className={inputCls} />
          <span className="text-micro text-light">
            صفر = لم تدفع بعد · أقلّ من {values.amount} = عربون
          </span>
        </label>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-body-sm font-bold bg-dark text-white border border-dark disabled:opacity-60"
        >
          {saving ? "يحفظ…" : "حفظ التعديل"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-body-sm font-bold border border-bord text-mid hover:bg-offwh transition"
        >
          <X size={14} /> إلغاء
        </button>
      </div>
    </form>
  );
}
