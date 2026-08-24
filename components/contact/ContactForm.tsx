"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

/** بيانات نموذج التواصل */
interface FormData {
  name:    string;
  email:   string;
  phone:   string;
  subject: string;
  message: string;
}

/** حالة النموذج */
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

/** نمط label */
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

/** رسالة خطأ تحت الحقل */
function FieldError({ msg }: { msg: string }) {
  return (
    <div className="font-label text-[11px] mt-1.5 flex items-center gap-1" style={{ color: "var(--rose)" }}>
      <span>⚠</span> {msg}
    </div>
  );
}

/** قواعد التحقق لكل حقل */
const validators: Record<keyof Omit<FormData, "phone">, (v: string) => string | null> = {
  name:    (v) => v.trim().length < 2 ? "errorNameRequired" : /\d/.test(v) ? "errorNameNoDigits" : null,
  email:   (v) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "errorEmailInvalid" : null,
  subject: (v) => v.trim().length < 2 ? "errorSubjectRequired" : null,
  message: (v) => v.trim().length < 10 ? "errorMessageTooShort" : null,
};

/** نموذج التواصل مع validation وإرسال حقيقي */
export default function ContactForm() {
  const t = useTranslations("contact");
  const [form, setForm] = useState<FormData>({
    name: "", email: "", phone: "", subject: "", message: "",
  });

  const [touched,      setTouched]      = useState<Partial<Record<keyof FormData, boolean>>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [status,       setStatus]       = useState<FormStatus>("idle");

  /** تحديث حقل */
  function updateField(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  /** تسجيل لمس الحقل عند الخروج */
  function handleBlur(field: keyof FormData) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setFocusedField(null);
  }

  /** خطأ الحقل — يظهر فقط بعد اللمس */
  function fieldError(field: keyof Omit<FormData, "phone">): string | null {
    if (!touched[field]) return null;
    return validators[field](form[field]);
  }

  /** لون حدود الحقل */
  function borderColor(field: keyof Omit<FormData, "phone">): string {
    if (fieldError(field)) return "var(--rose)";
    if (focusedField === field) return "var(--teal)";
    return "var(--bord)";
  }

  /** التحقق الكامل */
  const isValid =
    !validators.name(form.name) &&
    !validators.email(form.email) &&
    !validators.subject(form.subject) &&
    !validators.message(form.message);

  /** إرسال النموذج */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // تسجيل كل الحقول كملموسة لإظهار الأخطاء
    setTouched({ name: true, email: true, subject: true, message: true });
    if (!isValid) return;

    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });

      const json = await res.json() as { success: boolean };
      if (json.success) {
        setStatus("success");
        setForm({ name: "", email: "", phone: "", subject: "", message: "" });
        setTouched({});
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  /** شاشة النجاح */
  if (status === "success") {
    return (
      <div
        className="rounded-[22px] text-center"
        style={{
          background: "white",
          border: "1.5px solid var(--bord)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          padding: "56px 40px",
        }}
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
        <h2 className="font-heading font-bold text-[22px] mb-2" style={{ color: "var(--dark)" }}>
          {t("successTitle")}
        </h2>
        <button
          onClick={() => setStatus("idle")}
          className="mt-6 font-label font-bold text-[13px]"
          style={{ color: "var(--teal)", background: "none", border: "none", cursor: "pointer" }}
        >
          {t("sendAnother")}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div
        className="rounded-[22px]"
        style={{
          background: "white",
          border: "1.5px solid var(--bord)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}
      >
        {/* هيدر */}
        <div
          className="font-heading font-bold"
          style={{ padding: "18px 24px", borderBottom: "1.5px solid var(--bord)", fontSize: 17, color: "var(--dark)" }}
        >
          {t("formTitle")}
        </div>

        {/* الحقول */}
        <div style={{ padding: "24px" }} className="flex flex-col gap-4">

          {/* الاسم */}
          <div>
            <label style={labelStyle}>{t("nameLabel")}</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder={t("namePlaceholder")}
              autoComplete="name"
              style={{ ...inputBase, border: `1.5px solid ${borderColor("name")}` }}
              onFocus={() => setFocusedField("name")}
              onBlur={() => handleBlur("name")}
            />
            {fieldError("name") && <FieldError msg={t(fieldError("name")!)} />}
          </div>

          {/* الإيميل والهاتف */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>{t("emailLabel")}</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="example@email.com"
                autoComplete="email"
                dir="ltr"
                style={{ ...inputBase, border: `1.5px solid ${borderColor("email")}`, textAlign: "right" }}
                onFocus={() => setFocusedField("email")}
                onBlur={() => handleBlur("email")}
              />
              {fieldError("email") && <FieldError msg={t(fieldError("email")!)} />}
            </div>
            <div>
              <label style={labelStyle}>{t("phoneLabel")}</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="+972 5X-XXXXXXX"
                autoComplete="tel"
                dir="ltr"
                style={{ ...inputBase, border: `1.5px solid ${focusedField === "phone" ? "var(--teal)" : "var(--bord)"}`, textAlign: "right" }}
                onFocus={() => setFocusedField("phone")}
                onBlur={() => setFocusedField(null)}
              />
            </div>
          </div>

          {/* الموضوع */}
          <div>
            <label style={labelStyle}>{t("subjectLabel")}</label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => updateField("subject", e.target.value)}
              placeholder={t("subjectPlaceholder")}
              style={{ ...inputBase, border: `1.5px solid ${borderColor("subject")}` }}
              onFocus={() => setFocusedField("subject")}
              onBlur={() => handleBlur("subject")}
            />
            {fieldError("subject") && <FieldError msg={t(fieldError("subject")!)} />}
          </div>

          {/* الرسالة */}
          <div>
            <label style={labelStyle}>{t("messageLabel")}</label>
            <textarea
              value={form.message}
              onChange={(e) => updateField("message", e.target.value)}
              placeholder={t("messagePlaceholder")}
              rows={5}
              style={{ ...inputBase, border: `1.5px solid ${borderColor("message")}`, resize: "none" }}
              onFocus={() => setFocusedField("message")}
              onBlur={() => handleBlur("message")}
            />
            {fieldError("message") && <FieldError msg={t(fieldError("message")!)} />}
          </div>
        </div>

        {/* زر الإرسال */}
        <div style={{ padding: "20px 24px", borderTop: "1.5px solid var(--bord)" }}>
          {status === "error" && (
            <div
              className="text-center text-[13px] mb-3 rounded-[10px] py-2"
              style={{ background: "#FEF5F7", color: "var(--rose)", border: "1px solid var(--roselt)" }}
            >
              {t("submitError")}
            </div>
          )}

          <button
            type="submit"
            disabled={status === "submitting"}
            className="w-full font-label font-bold text-white text-[16px] [transition:background-color_200ms_ease,box-shadow_200ms_ease,transform_160ms_ease-out]"
            style={{
              background: isValid ? "var(--teal)" : "var(--light)",
              border: "none",
              borderRadius: 50,
              padding: "15px",
              cursor: status === "submitting" ? "not-allowed" : "pointer",
              boxShadow: isValid ? "0 6px 20px rgba(130,201,196,0.4)" : "none",
              opacity: status === "submitting" ? 0.8 : 1,
            }}
          >
            {status === "submitting" ? t("submitting") : t("submitButton")}
          </button>
        </div>
      </div>
    </form>
  );
}
