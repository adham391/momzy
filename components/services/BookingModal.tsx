"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/lib/i18n/navigation";
import SessionCalendar, { type CalendarSession } from "./SessionCalendar";
import { checkBabyAge, hasAgeGate, ageRangeText, monthsLabel, type AgeGate } from "@/lib/utils/age";
import { BOOKING_TOPIC_MAX_LENGTH, isBookingTopicValid } from "@/lib/utils/bookingTopic";
import { BABY_NAME_MAX_LENGTH, isBabyBorn, isBabyNameValid, normalizeBabyName } from "@/lib/utils/babyName";
import { israelTodayISO } from "@/lib/sessions/time";
import { useGeo } from "@/lib/geo/useGeo";
import { displayPrice } from "@/lib/currency";
import { DOMESTIC_ONLY_CODE } from "@/lib/geo/country";
import type { PublicSlot } from "@/lib/services/session";
import AbroadNotice from "@/components/ui/AbroadNotice";

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  /** اسم الخدمة — يظهر في الهيدر */
  serviceTitle: string;
  /** slug الخدمة — لجلب المواعيد المتاحة. بدونه (أو بلا مواعيد) → نموذج تواصل */
  serviceSlug?: string;
  /** جلسة مُختارة مسبقًا — يفتح النموذج عليها مباشرة (من قسم «الجلسات القادمة») */
  preselectedSlotId?: string;
  /** يفتح خطوة قائمة الانتظار مباشرة (كل الجلسات مكتملة) */
  forceWaitlist?: boolean;
  /** الفئة العمرية للورشة — وجود حدّ رقمي يُفعّل سؤال تاريخ ميلاد الطفل والتحقق منه */
  ageGate?: AgeGate;
  /** يسأل عن موضوع اللقاء (خانة إلزامية) — للّقاءات الفردية (askTopic في Sanity) */
  askTopic?: boolean;
}

/** الفتحة كما يعيدها /api/availability — بلا رابط اللقاء (يصل في تذكير اليوم السابق) */
type Slot = PublicSlot;

/** تحويل فتحة إلى شكل الرزنامة */
function toCalendarSession(s: Slot): CalendarSession {
  return {
    id: s.id,
    date: s.date,
    startTime: s.start_time,
    endTime: s.end_time,
    price: s.price,
    seatsLeft: Math.max(0, s.capacity - s.booked_count),
    isOnline: s.online,
  };
}

/** مكتملة — تُعرض في الرزنامة رمادية ولا تُحجز */
const isFull = (s: Slot) => s.booked_count >= s.capacity;

interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  /** تاريخ ميلاد الطفل — للورشات ذات فئة عمرية فقط */
  babyBirthDate: string;
  /** اسم الطفل الكامل — مع تاريخ ميلاده */
  babyName: string;
  /** موضوع اللقاء — للخدمات التي تسأل عنه فقط */
  topic: string;
}

const EMPTY_FORM: BookingFormData = { name: "", email: "", phone: "", message: "", babyBirthDate: "", babyName: "", topic: "" };

/**
 * الخطوات: تحميل المواعيد ← اختيار موعد ← بيانات ← (انتقال لصفحة التأكيد/الدفع)
 * وعند اكتمال المقاعد ← قائمة انتظار · وبلا slug ← تواصل (احتياطي)
 */
type Step = "loading" | "slots" | "form" | "contact" | "waitlist" | "success";
type SubmitStatus = "idle" | "submitting" | "error";

const inputBase: React.CSSProperties = {
  width: "100%",
  borderRadius: 12,
  padding: "11px 14px",
  background: "var(--offwh)",
  fontSize: 14,
  color: "var(--dark)",
  outline: "none",
  fontFamily: "inherit",
  transition: "border-color 0.15s",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 700,
  color: "var(--mid)",
  letterSpacing: "1.5px",
  textTransform: "uppercase",
  marginBottom: 6,
  fontFamily: "'Nunito', sans-serif",
};

function formatSlotDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return `⁦${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}⁩`;
}

const formatTime = (t: string) => t.slice(0, 5); // "10:00:00" → "10:00"

/**
 * Modal الحجز — يجلب المواعيد المتاحة للخدمة ويتيح حجز موعد فعلي.
 * إن لم توجد مواعيد (أو بلا slug) يسقط لنموذج تواصل (سنتواصل معك).
 */
export default function BookingModal({
  open,
  onClose,
  serviceTitle,
  serviceSlug,
  preselectedSlotId,
  forceWaitlist,
  ageGate,
  askTopic,
}: BookingModalProps) {
  const t = useTranslations("booking");
  const locale = useLocale();
  const router = useRouter();
  const [step, setStep] = useState<Step>("loading");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selected, setSelected] = useState<Slot | null>(null);
  const [form, setForm] = useState<BookingFormData>(EMPTY_FORM);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  /** نوع شاشة النجاح — الحجز الفعلي ينتقل لصفحة التأكيد بدل هذه الشاشة */
  const [successKind, setSuccessKind] = useState<"contact" | "waitlist">("contact");
  const [focused, setFocused] = useState<string | null>(null);
  /** لا جلسات مجدولة إطلاقًا (لا «مكتملة») — يغيّر نص خطوة الانتظار */
  const [noSessionsAtAll, setNoSessionsAtAll] = useState(false);
  /** موقع الزائرة وعملتها — اللقاء الحضوري من داخل البلاد فقط، والدفع بالدولار من خارجها */
  const geo = useGeo();
  /** السيرفر رفض الحجز لأنه من خارج البلاد — أوثق من تخمين الواجهة */
  const [rejectedAbroad, setRejectedAbroad] = useState(false);

  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  /** جلب المواعيد عند الفتح */
  const loadSlots = useCallback(async () => {
    if (!serviceSlug) {
      setStep("contact");
      return;
    }
    // زر «انضمي للانتظار» الصريح (البطاقة/الشريط) → قائمة الانتظار مباشرة (بلا جلب مواعيد)
    if (forceWaitlist) {
      setStep("waitlist");
      return;
    }
    setStep("loading");
    try {
      const res = await fetch(`/api/availability?service=${encodeURIComponent(serviceSlug)}`);
      const data = (await res.json()) as { slots?: Slot[] };
      const upcoming = data.slots ?? [];
      // الجلسات المكتملة تبقى في الرزنامة رمادية (لا تختفي)؛ نموذج الانتظار مباشرةً فقط حين لا جلسة مجدولة أصلًا
      setNoSessionsAtAll(upcoming.length === 0);
      if (upcoming.length > 0) {
        setSlots(upcoming);
        // جلسة مُختارة من صفحة الورشة وفيها متسع → للنموذج مباشرة (تخطّي اختيار الموعد)
        const pre = preselectedSlotId ? upcoming.find((s) => s.id === preselectedSlotId) : undefined;
        if (pre && !isFull(pre)) {
          setSelected(pre);
          setStep("form");
        } else {
          setStep("slots");
        }
      } else {
        setStep("waitlist"); // لا جلسات مجدولة → قائمة انتظار لإعلامها عند فتح دورة جديدة
      }
    } catch {
      setStep("contact");
    }
  }, [serviceSlug, preselectedSlotId, forceWaitlist]);

  /* فتح/إغلاق + أنيميشن */
  useEffect(() => {
    if (open) {
      setMounted(true);
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    }
    setVisible(false);
    const timer = setTimeout(() => setMounted(false), 200);
    return () => clearTimeout(timer);
  }, [open]);

  /* إعادة الضبط عند الفتح + جلب المواعيد */
  useEffect(() => {
    if (open) {
      setStatus("idle");
      setSelected(null);
      setForm(EMPTY_FORM);
      setErrorMsg("");
      setRejectedAbroad(false);
      loadSlots();
    }
  }, [open, loadSlots]);

  /* Escape + قفل scroll */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!mounted) return null;

  /** الفئة العمرية — تُسأل في خطوة الحجز الفعلي فقط (لا في التواصل/الانتظار) */
  const needsBabyAge = step === "form" && hasAgeGate(ageGate);
  /** تحقّق العمر **يوم الجلسة** — null قبل إدخال التاريخ */
  const ageCheck =
    needsBabyAge && ageGate && selected && form.babyBirthDate
      ? checkBabyAge(form.babyBirthDate, selected.date, ageGate)
      : null;

  /** اسم الطفل إلزامي للمولود فقط — التاريخ في المستقبل موعد متوقّع لحامل */
  const needsBabyName = needsBabyAge && isBabyBorn(form.babyBirthDate, israelTodayISO());

  const contactValid =
    form.name.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) &&
    form.phone.trim().length >= 8;

  /** موضوع اللقاء — يُسأل في خطوة الحجز الفعلي فقط، كالفئة العمرية */
  const needsTopic = step === "form" && Boolean(askTopic);

  /** لقاء حضوري وزائرة من خارج البلاد — التسجيل من داخل البلاد فقط (السيرفر يرفض أيضًا) */
  const blockedAbroad =
    step === "form" && selected !== null && !selected.online && ((geo !== null && !geo.domestic) || rejectedAbroad);

  const isValid =
    contactValid &&
    (!needsBabyAge || ageCheck?.ok === true) &&
    (!needsBabyName || isBabyNameValid(normalizeBabyName(form.babyName))) &&
    (!needsTopic || isBookingTopicValid(form.topic.trim()));

  const borderFor = (field: string) => (focused === field ? "var(--teal)" : "var(--bord)");

  /** حجز الموعد المختار */
  async function submitBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || !selected) return;
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId: selected.id,
          customer: { name: form.name, email: form.email, phone: form.phone },
          notes: form.message,
          topic: form.topic,
          babyBirthDate: form.babyBirthDate || null,
          babyName: needsBabyName ? normalizeBabyName(form.babyName) : null,
          // لغة الموقع — تحدّد لغة صفحة دفع HYP للورشة
          locale,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        // لصفحة تأكيد التسجيل — هناك يتم الدفع إن كانت الورشة مدفوعة
        router.push(`/booking/${data.id}`);
      } else if (data.code === DOMESTIC_ONLY_CODE) {
        // لقاء حضوري من خارج البلاد → التنبيه بدل النموذج
        setRejectedAbroad(true);
        setStatus("idle");
      } else {
        // الموعد امتلأ → أعد تحميل المواعيد
        setErrorMsg(data.error ?? t("modal.bookingFailed"));
        setStatus("idle");
        if (res.status === 409) {
          setSelected(null);
          loadSlots();
        }
      }
    } catch {
      setStatus("error");
    }
  }

  /** نموذج التواصل الاحتياطي (لا مواعيد) */
  async function submitContact(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          subject: `حجز خدمة: ${serviceTitle}`,
          message: form.message || `طلب حجز خدمة "${serviceTitle}"`,
        }),
      });
      const json = (await res.json()) as { success: boolean };
      if (json.success) {
        setSuccessKind("contact");
        setStep("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  /** الانضمام لقائمة الانتظار — عند اكتمال المقاعد أو غياب الجلسات */
  async function submitWaitlist(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || !serviceSlug) return;
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          serviceSlug,
          serviceName: serviceTitle,
          notes: form.message,
        }),
      });
      const json = (await res.json()) as { success: boolean; error?: string };
      if (json.success) {
        setSuccessKind("waitlist");
        setStep("success");
      } else {
        setErrorMsg(json.error ?? t("modal.waitlistFailed"));
        setStatus("idle");
      }
    } catch {
      setStatus("error");
    }
  }

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 9999, padding: 16 }} dir="rtl">
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(37,34,32,0.6)",
          backdropFilter: "blur(4px)",
          opacity: visible ? 1 : 0,
          transition: visible ? "opacity 220ms ease-out" : "opacity 160ms ease-in",
        }}
        onClick={onClose}
      />

      <div
        className="relative w-full rounded-[24px] overflow-y-auto"
        style={{
          maxWidth: 540,
          maxHeight: "90vh",
          background: "white",
          boxShadow: "0 32px 80px rgba(0,0,0,0.22)",
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(0.95)",
          transition: visible
            ? "opacity 280ms cubic-bezier(0.23,1,0.32,1), transform 280ms cubic-bezier(0.23,1,0.32,1)"
            : "opacity 180ms ease-in, transform 180ms ease-in",
        }}
      >
        {/* هيدر */}
        <div
          className="sticky top-0 flex items-center justify-between px-7 py-5"
          style={{
            background: "linear-gradient(135deg, #FFF5F7 0%, #EFF8F8 100%)",
            borderBottom: "1.5px solid var(--bord)",
            zIndex: 2,
          }}
        >
          <div>
            <p className="font-label font-bold text-[11px] mb-1" style={{ color: "var(--teal)", letterSpacing: "2.5px", textTransform: "uppercase" }}>
              {step === "success" ? t("modal.done") : step === "waitlist" ? t("modal.waitlistTitle") : t("modal.bookYourSlot")}
            </p>
            <h2 className="font-heading font-bold text-[20px]" style={{ color: "var(--dark)" }}>
              {serviceTitle}
            </h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ color: "var(--mid)", fontSize: 18, background: "var(--bord)" }} aria-label={t("modal.close")}>
            ✕
          </button>
        </div>

        {/* ── تحميل ── */}
        {step === "loading" && (
          <div className="px-7 py-16 text-center">
            <p className="text-[14px]" style={{ color: "var(--mid)", fontFamily: "'Tajawal', sans-serif" }}>
              {t("modal.loadingSlots")}
            </p>
          </div>
        )}

        {/* ── اختيار موعد ── */}
        {step === "slots" && (
          <div className="px-7 py-6">
            <p className="text-[14px] leading-[1.85] mb-5" style={{ color: "var(--mid)", fontFamily: "'Tajawal', sans-serif" }}>
              {t("modal.pickSlot")}
            </p>
            <SessionCalendar
              compact
              formatPrice={(ils) => displayPrice(ils, geo)}
              sessions={slots.map(toCalendarSession)}
              onPick={(id) => {
                const slot = slots.find((s) => s.id === id);
                if (slot) {
                  setSelected(slot);
                  setRejectedAbroad(false);
                  setStep("form");
                }
              }}
            />
            {/* جلسات مكتملة → رمادية في الرزنامة، ومن تريد تنضم لقائمة الانتظار من هنا */}
            {slots.some(isFull) && (
              <div
                className="rounded-xl px-4 py-3.5 mt-5 text-center"
                style={{ background: "var(--yellowlt)", border: "1.5px solid var(--yellow)" }}
              >
                <p className="text-[13px] leading-[1.8] mb-3" style={{ color: "var(--mid)", fontFamily: "'Tajawal', sans-serif" }}>
                  {slots.every(isFull) ? t("modal.fullBody") : t("modal.someFullNote")}
                </p>
                <button
                  type="button"
                  onClick={() => setStep("waitlist")}
                  className="font-label font-bold text-[13px] px-5 py-2.5 rounded-full"
                  style={{ background: "var(--rose)", color: "white" }}
                >
                  {t("modal.joinWaitlist")}
                </button>
              </div>
            )}
            {errorMsg && (
              <p className="text-center text-[13px] mt-4 rounded-[10px] py-2 px-3" style={{ background: "#FEF5F7", color: "var(--rose)" }}>
                {errorMsg}
              </p>
            )}
          </div>
        )}

        {/* ── بيانات الحجز أو التواصل ── */}
        {(step === "form" || step === "contact" || step === "waitlist") && (
          <form
            onSubmit={
              step === "form" ? submitBooking : step === "waitlist" ? submitWaitlist : submitContact
            }
            noValidate
            className="px-7 py-7"
            style={{
              filter: status === "submitting" ? "blur(1.5px)" : "none",
              opacity: status === "submitting" ? 0.65 : 1,
              transition: "filter 200ms ease, opacity 200ms ease",
              pointerEvents: status === "submitting" ? "none" : "auto",
            }}
          >
            {step === "form" && selected ? (
              <div className="flex items-center justify-between mb-5 rounded-xl px-4 py-3" style={{ background: "var(--tealpale)" }}>
                <span className="text-[13px] font-bold" style={{ color: "var(--dark)", fontFamily: "'Tajawal', sans-serif" }}>
                  {formatSlotDate(selected.date)} · {formatTime(selected.start_time)}
                </span>
                <button type="button" onClick={() => setStep("slots")} className="text-[12px] font-bold" style={{ color: "var(--teal)" }}>
                  {t("modal.change")}
                </button>
              </div>
            ) : step === "waitlist" ? (
              <div className="rounded-xl px-4 py-3.5 mb-5" style={{ background: "var(--yellowlt)", border: "1.5px solid var(--yellow)" }}>
                <p className="text-[13.5px] font-bold mb-1" style={{ color: "var(--dark)", fontFamily: "'Tajawal', sans-serif" }}>
                  {noSessionsAtAll ? t("modal.noSessionsTitle") : t("modal.fullTitle")}
                </p>
                <p className="text-[13px] leading-[1.8]" style={{ color: "var(--mid)", fontFamily: "'Tajawal', sans-serif" }}>
                  {noSessionsAtAll ? t("modal.noSessionsBody") : t("modal.fullBody")}
                </p>
              </div>
            ) : (
              <p className="text-[14px] leading-[1.85] mb-6" style={{ color: "var(--mid)", fontFamily: "'Tajawal', sans-serif" }}>
                {t("modal.contactIntro")}
              </p>
            )}

            {blockedAbroad ? (
              <AbroadNotice title={t("modal.abroadTitle")} body={t("modal.abroadBody")} />
            ) : (
              <>
                <div className="flex flex-col gap-4">
                  <div>
                    <label style={labelStyle}>{t("modal.nameLabel")}</label>
                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t("modal.namePlaceholder")} autoComplete="name"
                      style={{ ...inputBase, border: `1.5px solid ${borderFor("name")}` }} onFocus={() => setFocused("name")} onBlur={() => setFocused(null)} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label style={labelStyle}>{t("modal.emailLabel")}</label>
                      <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="example@email.com" autoComplete="email" dir="ltr"
                        style={{ ...inputBase, border: `1.5px solid ${borderFor("email")}`, textAlign: "right" }} onFocus={() => setFocused("email")} onBlur={() => setFocused(null)} />
                    </div>
                    <div>
                      <label style={labelStyle}>{t("modal.phoneLabel")}</label>
                      <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+972 5X-XXXXXXX" autoComplete="tel" dir="ltr"
                        style={{ ...inputBase, border: `1.5px solid ${borderFor("phone")}`, textAlign: "right" }} onFocus={() => setFocused("phone")} onBlur={() => setFocused(null)} />
                    </div>
                  </div>
                  {/* تاريخ ميلاد الطفل — للورشات ذات فئة عمرية فقط */}
                  {needsBabyAge && (
                    <div>
                      <label style={labelStyle}>{t("modal.babyBirthDateLabel")}</label>
                      <input
                        type="date"
                        value={form.babyBirthDate}
                        onChange={(e) => setForm({ ...form, babyBirthDate: e.target.value })}
                        dir="ltr"
                        style={{
                          ...inputBase,
                          border: `1.5px solid ${
                            ageCheck && !ageCheck.ok ? "var(--rose)" : borderFor("baby")
                          }`,
                          textAlign: "right",
                        }}
                        onFocus={() => setFocused("baby")}
                        onBlur={() => setFocused(null)}
                      />
                      <p
                        className="text-[11.5px] leading-[1.7] mt-1.5"
                        style={{
                          color:
                            ageCheck && !ageCheck.ok
                              ? "var(--rose)"
                              : ageCheck?.ok
                                ? "var(--teal)"
                                : "var(--light)",
                          fontFamily: "'Tajawal', sans-serif",
                        }}
                      >
                        {ageCheck && !ageCheck.ok
                          ? ageCheck.message
                          : ageCheck?.ok && ageCheck.months !== null
                            ? t("modal.babyAgeOk", { age: monthsLabel(ageCheck.months) })
                            : t("modal.babyAgeHint", { range: ageGate ? ageRangeText(ageGate) : "" })}
                      </p>
                    </div>
                  )}

                  {/* اسم الطفل الكامل — بعد تاريخ الميلاد، يظهر للمولود فقط (وإلزامي حين يظهر);
                      الموعد المتوقّع (حامل) لا يحتاج اسمًا */}
                  {needsBabyName && (
                    <div>
                      <label style={labelStyle}>{t("modal.babyNameLabel")}</label>
                      <input
                        type="text"
                        value={form.babyName}
                        onChange={(e) => setForm({ ...form, babyName: e.target.value })}
                        placeholder={t("modal.babyNamePlaceholder")}
                        maxLength={BABY_NAME_MAX_LENGTH}
                        autoComplete="off"
                        style={{ ...inputBase, border: `1.5px solid ${borderFor("babyName")}` }}
                        onFocus={() => setFocused("babyName")}
                        onBlur={() => setFocused(null)}
                      />
                    </div>
                  )}

                  {/* موضوع اللقاء — للّقاءات الفردية فقط */}
                  {needsTopic && (
                    <div>
                      <label style={labelStyle}>{t("modal.topicLabel")}</label>
                      <textarea
                        value={form.topic}
                        onChange={(e) => setForm({ ...form, topic: e.target.value })}
                        placeholder={t("modal.topicPlaceholder")}
                        maxLength={BOOKING_TOPIC_MAX_LENGTH}
                        rows={3}
                        style={{ ...inputBase, border: `1.5px solid ${borderFor("topic")}`, resize: "none" }}
                        onFocus={() => setFocused("topic")}
                        onBlur={() => setFocused(null)}
                      />
                    </div>
                  )}

                  <div>
                    <label style={labelStyle}>{t("modal.notesLabel")}</label>
                    <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder={needsBabyAge ? t("modal.notesPlaceholderAge") : t("modal.notesPlaceholder")} rows={3}
                      style={{ ...inputBase, border: `1.5px solid ${borderFor("message")}`, resize: "none" }} onFocus={() => setFocused("message")} onBlur={() => setFocused(null)} />
                  </div>
                </div>

                {(status === "error" || errorMsg) && (
                  <div className="text-center text-[13px] mt-5 rounded-[10px] py-2 px-3" style={{ background: "#FEF5F7", color: "var(--rose)", border: "1px solid var(--roselt)" }}>
                    {errorMsg || t("modal.genericError")}
                  </div>
                )}

                <button type="submit" disabled={!isValid || status === "submitting"}
                  className="w-full font-label font-bold text-white text-[16px] mt-6 active:scale-[0.98] [transition:transform_160ms_ease-out,background-color_200ms_ease]"
                  style={{
                    background: isValid ? "var(--rose)" : "var(--light)",
                    border: "none", borderRadius: 50, padding: 15,
                    cursor: !isValid || status === "submitting" ? "not-allowed" : "pointer",
                    boxShadow: isValid ? "0 6px 20px rgba(242,167,181,0.4)" : "none",
                    opacity: status === "submitting" ? 0.8 : 1,
                  }}>
                  {status === "submitting"
                    ? t("modal.submitting")
                    : step === "form"
                      ? selected && selected.price > 0
                        ? t("modal.proceedToPayment", { price: displayPrice(selected.price, geo) })
                        : t("modal.confirmRegistration")
                      : step === "waitlist"
                        ? t("modal.joinWaitlist")
                        : t("modal.sendBookingRequest")}
                </button>
              </>
            )}
          </form>
        )}

        {/* ── نجاح ── */}
        {step === "success" && (
          <div className="px-7 py-12 text-center" style={{ animation: "card-in 0.4s cubic-bezier(0.23,1,0.32,1) both" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--tealpale)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 32 }}>
              ✓
            </div>
            <h3 className="font-heading font-bold text-[20px] mb-3" style={{ color: "var(--dark)" }}>
              {successKind === "waitlist" ? t("modal.waitlistSuccessTitle") : t("modal.contactSuccessTitle")}
            </h3>
            <p className="text-[14px] leading-[1.85] mb-6" style={{ color: "var(--mid)", fontFamily: "'Tajawal', sans-serif" }}>
              {successKind === "waitlist" ? t("modal.waitlistSuccessBody") : t("modal.contactSuccessBody")}
            </p>
            <button onClick={onClose} className="font-label font-bold text-[14px] px-8 py-3 rounded-full transition-opacity hover:opacity-85" style={{ background: "var(--teal)", color: "white" }}>
              {t("modal.close")}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
