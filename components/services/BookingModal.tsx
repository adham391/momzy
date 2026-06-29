"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  /** اسم الخدمة المختارة — يُمرَّر إلى /api/contact كـ subject */
  serviceTitle: string;
}

/** بيانات نموذج الحجز */
interface BookingFormData {
  name:    string;
  email:   string;
  phone:   string;
  message: string;
}

type FormStatus = "idle" | "submitting" | "success" | "error";

/** نمط حقل الإدخال */
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

/**
 * Modal بنموذج حجز بسيط — يفتح من زر "احجزي الآن"
 * يرسل عبر POST /api/contact مع subject = "حجز خدمة: {serviceTitle}"
 * Portal لتجنب z-index conflicts
 */
export default function BookingModal({ open, onClose, serviceTitle }: BookingModalProps) {
  const [form, setForm] = useState<BookingFormData>({
    name: "", email: "", phone: "", message: "",
  });
  const [status, setStatus]           = useState<FormStatus>("idle");
  const [focused, setFocused]         = useState<string | null>(null);
  /** mounted: هل المكوّن في الـ DOM | visible: حالة الـ animation */
  const [mounted, setMounted]         = useState(false);
  const [visible, setVisible]         = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    } else {
      setVisible(false);
      const timer = setTimeout(() => setMounted(false), 200);
      return () => clearTimeout(timer);
    }
  }, [open]);

  /** Reset عند الإغلاق */
  useEffect(() => {
    if (!open) {
      setStatus("idle");
      setForm({ name: "", email: "", phone: "", message: "" });
    }
  }, [open]);

  /** إغلاق بـ Escape */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  /** منع scroll على body */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!mounted) return null;

  /** التحقق الأساسي */
  const isValid =
    form.name.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) &&
    form.phone.trim().length >= 8;

  /** إرسال */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          name:    form.name,
          email:   form.email,
          phone:   form.phone,
          subject: `حجز خدمة: ${serviceTitle}`,
          message: form.message || `طلب حجز خدمة "${serviceTitle}"`,
        }),
      });

      const json = await res.json() as { success: boolean };
      setStatus(json.success ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  function borderFor(field: string) {
    return focused === field ? "var(--teal)" : "var(--bord)";
  }

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 9999, padding: "16px" }}
      dir="rtl"
    >
      {/* الستارة — enter 220ms / exit 160ms */}
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

      {/* نافذة الـ modal — enter 280ms ease-out / exit 180ms ease-in */}
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
            ? "opacity 280ms cubic-bezier(0.23, 1, 0.32, 1), transform 280ms cubic-bezier(0.23, 1, 0.32, 1)"
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
            <p
              className="font-label font-bold text-[11px] mb-1"
              style={{ color: "var(--teal)", letterSpacing: "2.5px", textTransform: "uppercase" }}
            >
              طلب حجز
            </p>
            <h2 className="font-heading font-bold text-[20px]" style={{ color: "var(--dark)" }}>
              {serviceTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ color: "var(--mid)", fontSize: 18, background: "var(--bord)" }}
            aria-label="إغلاق"
          >
            ✕
          </button>
        </div>

        {/* المحتوى */}
        {status === "success" ? (
          /* شاشة النجاح — تظهر بـ fade-in لطيف */
          <div
            className="px-7 py-12 text-center"
            style={{ animation: "card-in 0.4s cubic-bezier(0.23, 1, 0.32, 1) both" }}
          >
            <div
              style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "var(--tealpale)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 20px",
                fontSize: 32,
              }}
            >
              ✓
            </div>
            <h3 className="font-heading font-bold text-[20px] mb-3" style={{ color: "var(--dark)" }}>
              طلبك وصل!
            </h3>
            <p className="text-[14px] leading-[1.85] mb-6" style={{ color: "var(--mid)", fontFamily: "'Tajawal', sans-serif" }}>
              سنتواصل معك خلال 24 ساعة لتأكيد الحجز وترتيب التفاصيل.
            </p>
            <button
              onClick={onClose}
              className="font-label font-bold text-[14px] px-8 py-3 rounded-full transition-opacity hover:opacity-85"
              style={{ background: "var(--teal)", color: "white" }}
            >
              إغلاق
            </button>
          </div>
        ) : (
          /* blur على الفورم عند الإرسال — Emil: blur يخفي التحولات غير السلسة */
          <form
            onSubmit={handleSubmit}
            noValidate
            className="px-7 py-7"
            style={{
              filter: status === "submitting" ? "blur(1.5px)" : "blur(0px)",
              opacity: status === "submitting" ? 0.65 : 1,
              transition: "filter 200ms ease, opacity 200ms ease",
              pointerEvents: status === "submitting" ? "none" : "auto",
            }}
          >
            <p
              className="text-[14px] leading-[1.85] mb-6"
              style={{ color: "var(--mid)", fontFamily: "'Tajawal', sans-serif" }}
            >
              املئي بياناتك وسنتواصل معك خلال 24 ساعة لتأكيد الحجز.
            </p>

            <div className="flex flex-col gap-4">
              {/* الاسم */}
              <div>
                <label style={labelStyle}>الاسم الكامل *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="اسمك الكامل"
                  autoComplete="name"
                  style={{ ...inputBase, border: `1.5px solid ${borderFor("name")}` }}
                  onFocus={() => setFocused("name")}
                  onBlur={() => setFocused(null)}
                />
              </div>

              {/* الإيميل + الهاتف */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label style={labelStyle}>البريد الإلكتروني *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="example@email.com"
                    autoComplete="email"
                    dir="ltr"
                    style={{ ...inputBase, border: `1.5px solid ${borderFor("email")}`, textAlign: "right" }}
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused(null)}
                  />
                </div>
                <div>
                  <label style={labelStyle}>رقم الواتساب *</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+972 5X-XXXXXXX"
                    autoComplete="tel"
                    dir="ltr"
                    style={{ ...inputBase, border: `1.5px solid ${borderFor("phone")}`, textAlign: "right" }}
                    onFocus={() => setFocused("phone")}
                    onBlur={() => setFocused(null)}
                  />
                </div>
              </div>

              {/* رسالة اختيارية */}
              <div>
                <label style={labelStyle}>ملاحظات إضافية (اختياري)</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="عمر طفلك، أسئلة محددة، توقيت مفضل..."
                  rows={4}
                  style={{ ...inputBase, border: `1.5px solid ${borderFor("message")}`, resize: "none" }}
                  onFocus={() => setFocused("message")}
                  onBlur={() => setFocused(null)}
                />
              </div>
            </div>

            {/* خطأ */}
            {status === "error" && (
              <div
                className="text-center text-[13px] mt-5 mb-1 rounded-[10px] py-2 px-3"
                style={{ background: "#FEF5F7", color: "var(--rose)", border: "1px solid var(--roselt)" }}
              >
                حدث خطأ، يرجى المحاولة مجدداً
              </div>
            )}

            {/* زر الإرسال */}
            <button
              type="submit"
              disabled={!isValid || status === "submitting"}
              className="w-full font-label font-bold text-white text-[16px] mt-6 [transition:background-color_200ms_ease,box-shadow_200ms_ease,transform_160ms_ease-out]"
              style={{
                background: isValid ? "var(--rose)" : "var(--light)",
                border: "none",
                borderRadius: 50,
                padding: "15px",
                cursor: !isValid || status === "submitting" ? "not-allowed" : "pointer",
                boxShadow: isValid ? "0 6px 20px rgba(242,167,181,0.4)" : "none",
                opacity: status === "submitting" ? 0.8 : 1,
              }}
            >
              {status === "submitting" ? "جارٍ الإرسال..." : "إرسال طلب الحجز ←"}
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
