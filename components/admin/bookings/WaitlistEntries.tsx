"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronLeft, MessageCircle, Trash2 } from "lucide-react";

/** منتظِرة كما تُعرض — كل ما تحتاجه الواجهة محسوبًا على الخادم */
export interface WaitlistEntryView {
  id: string;
  name: string;
  service: string;
  phone: string;
  email: string;
  /** بلدتها — تُسأل عنها كل منتظِرة (والصفوف القديمة بلا بلدة) */
  city: string | null;
  /** اسم الطفل — للمولود وحده */
  babyName: string | null;
  /** تاريخ الانضمام بصيغة العرض */
  joined: string;
  /** عمر الطفل اليوم — للورشات ذات فئة عمرية فقط */
  babyAge: string | null;
  /** العمر المصحَّح — للخديج وحده */
  correctedAge: string | null;
  /** أسبوع الحمل اليوم — للخدمات التي تسبق الولادة */
  pregnancyWeek: number | null;
  notes: string | null;
  isNotified: boolean;
  /** رابط واتساب بالرسالة الجاهزة */
  waHref: string;
}

interface WaitlistEntriesProps {
  entries: WaitlistEntryView[];
  /** server actions — تُمرَّر من الصفحة كي تعمل النماذج داخل مكوّن العميل */
  notifyAction: (formData: FormData) => void;
  removeAction: (formData: FormData) => void;
}

/**
 * قائمة الانتظار — صفّ لكل أم، وضغطة تفتح صندوق تفاصيلها.
 *
 * على الهاتف كانت البيانات تُقصّ (هاتف وبريد وورشة في سطر واحد ضيّق)
 * والأزرار الثلاثة تتزاحم. الآن الصفّ يعرض الاسم والورشة فقط، والضغط
 * عليه يفتح صندوقًا فيه كل شيء وأزرارًا بعرض كامل. على الشاشة الكبيرة
 * تبقى الأزرار في الصفّ كما كانت.
 */
export default function WaitlistEntries({ entries, notifyAction, removeAction }: WaitlistEntriesProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = entries.find((e) => e.id === openId) ?? null;

  return (
    <>
      <div className="flex flex-col gap-2">
        {entries.map((entry, index) => (
          <div
            key={entry.id}
            className="bg-white rounded-[var(--r)] border border-bord flex items-center gap-3 md:gap-4 pe-2 md:pe-4"
            style={{ opacity: entry.isNotified ? 0.6 : 1 }}
          >
            {/* الصفّ نفسه زرّ: ضغطة تفتح التفاصيل */}
            <button
              type="button"
              onClick={() => setOpenId(entry.id)}
              className="flex-1 min-w-0 flex items-center gap-3 md:gap-4 p-4 text-start hover:bg-cream/40 transition-colors rounded-[var(--r)]"
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              <span className="w-7 h-7 rounded-full bg-offwh border border-bord flex items-center justify-center text-micro font-bold text-mid shrink-0">
                {index + 1}
              </span>

              <span className="flex-1 min-w-0">
                <span className="block font-semibold text-dark text-body-sm truncate">
                  {entry.name}
                  {entry.isNotified && <span className="text-micro text-teal font-normal"> · أُشعِرت</span>}
                </span>
                <span className="block text-micro text-light truncate">
                  {entry.service}
                  {entry.city && ` · ${entry.city}`} · انضمّت {entry.joined}
                </span>
                {/* الهاتف والبريد للشاشة الكبيرة — على الهاتف يُقصّان، ومكانهما صندوق التفاصيل */}
                <span className="hidden md:block text-micro text-light truncate" dir="ltr">
                  {entry.phone} · {entry.email}
                </span>
              </span>

              <ChevronLeft size={16} className="text-light shrink-0" />
            </button>

            {/* أزرار الصفّ — للشاشة الكبيرة وحدها */}
            <div className="hidden md:flex items-center gap-2 shrink-0">
              <WhatsAppLink href={entry.waHref} />
              {!entry.isNotified && <NotifyButton id={entry.id} action={notifyAction} />}
              <RemoveButton id={entry.id} action={removeAction} />
            </div>
          </div>
        ))}
      </div>

      {open && (
        <DetailsBox
          entry={open}
          notifyAction={notifyAction}
          removeAction={removeAction}
          onClose={() => setOpenId(null)}
        />
      )}
    </>
  );
}

/** صندوق التفاصيل — كل بيانات الأم وأزرارها، بلا قصّ */
function DetailsBox({
  entry,
  notifyAction,
  removeAction,
  onClose,
}: {
  entry: WaitlistEntryView;
  notifyAction: (formData: FormData) => void;
  removeAction: (formData: FormData) => void;
  onClose: () => void;
}) {
  /** قفل تمرير الصفحة الخلفية + الإغلاق بـ Esc */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return createPortal(
    <>
      <div
        role="presentation"
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(37,34,32,0.5)", zIndex: 900 }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`تفاصيل ${entry.name}`}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white overflow-y-auto"
        style={{
          width: "min(460px, calc(100vw - 24px))",
          maxHeight: "calc(100vh - 48px)",
          borderRadius: 20,
          zIndex: 910,
          boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
        }}
      >
        {/* الترويسة */}
        <div className="flex items-start justify-between gap-3 p-5 border-b border-bord">
          <div className="min-w-0">
            <h2 className="font-heading font-bold text-dark text-[18px] leading-tight">{entry.name}</h2>
            <p className="text-micro text-mid mt-1">{entry.service}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="w-9 h-9 rounded-full flex items-center justify-center text-light hover:bg-rosepale hover:text-rose transition-colors shrink-0"
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        {/* البيانات */}
        <div className="p-5 flex flex-col gap-3.5">
          <Field label="الهاتف">
            <a href={`tel:${entry.phone}`} className="text-dark hover:text-teal" dir="ltr">
              {entry.phone}
            </a>
          </Field>
          <Field label="الإيميل">
            <a href={`mailto:${entry.email}`} className="text-dark hover:text-teal break-all" dir="ltr">
              {entry.email}
            </a>
          </Field>
          {entry.city && <Field label="البلدة">{entry.city}</Field>}
          {entry.babyName && <Field label="اسم الطفل">{entry.babyName}</Field>}
          {entry.babyAge && <Field label="عمر الطفل اليوم">{entry.babyAge}</Field>}
          {entry.correctedAge && <Field label="العمر المصحَّح">{entry.correctedAge}</Field>}
          {entry.pregnancyWeek !== null && <Field label="أسبوع الحمل اليوم">{entry.pregnancyWeek}</Field>}
          <Field label="انضمّت">{entry.joined}</Field>
          <Field label="الحالة">{entry.isNotified ? "أُشعِرت بتوفّر مقعد" : "بانتظار الإشعار"}</Field>
          {entry.notes && <Field label="ملاحظاتها">{entry.notes}</Field>}
        </div>

        {/* الأزرار — بعرض كامل كي تُضغط بالإبهام */}
        <div className="p-5 pt-0 flex flex-col gap-2">
          <WhatsAppLink href={entry.waHref} full />
          {!entry.isNotified && <NotifyButton id={entry.id} action={notifyAction} full />}
          <RemoveButton id={entry.id} action={removeAction} full />
        </div>
      </div>
    </>,
    document.body,
  );
}

/** سطر بيانات: عنوان صغير وقيمة تحته */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-micro text-light mb-0.5">{label}</div>
      <div className="text-body-sm text-dark">{children}</div>
    </div>
  );
}

function WhatsAppLink({ href, full = false }: { href: string; full?: boolean }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-body-sm font-bold text-teal border border-bord hover:bg-tealpale transition ${full ? "w-full py-2.5" : ""}`}
    >
      <MessageCircle size={15} /> راسليها
    </a>
  );
}

function NotifyButton({
  id,
  action,
  full = false,
}: {
  id: string;
  action: (formData: FormData) => void;
  full?: boolean;
}) {
  return (
    <form action={action} className={full ? "w-full" : ""}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        title="تعليمها كمُشعَرة"
        className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-body-sm font-bold text-dark border border-bord hover:bg-offwh transition ${full ? "w-full py-2.5" : ""}`}
      >
        <Check size={15} /> أُشعِرت
      </button>
    </form>
  );
}

function RemoveButton({
  id,
  action,
  full = false,
}: {
  id: string;
  action: (formData: FormData) => void;
  full?: boolean;
}) {
  return (
    <form action={action} className={full ? "w-full" : ""}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        title="حذف من القائمة"
        className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-rose border border-bord hover:bg-rosepale transition ${full ? "w-full py-2.5 text-body-sm font-bold" : ""}`}
      >
        <Trash2 size={15} />
        {full && "حذف من القائمة"}
      </button>
    </form>
  );
}
