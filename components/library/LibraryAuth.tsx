"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/navigation";
import { LibraryCard, FormError, SubmitButton, fieldStyle, fieldLabelStyle } from "./ui";

/** حالتا النموذج: دخول ↔ استعادة/دعوة */
type Mode = "login" | "forgot";
type Status = "idle" | "submitting" | "sent" | "error";

/**
 * دخول المكتبة — بريد + كلمة مرور، مع وضع «نسيت كلمة المرور»
 * الذي يخدم أيضًا من اشترت قبل إنشاء حسابها (دعوة ذاتية).
 */
export default function LibraryAuth() {
  const t = useTranslations("library");
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("login");
  const [status, setStatus] = useState<Status>("idle");
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /** خريطة رموز الـ API → مفاتيح الترجمة */
  function errorToKey(code: string): string {
    if (code === "invalid_credentials") return "errorInvalid";
    if (code === "invalid_email") return "errorEmail";
    return "errorServer";
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    setErrorKey(null);

    try {
      if (mode === "login") {
        const res = await fetch("/api/library/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (!res.ok) {
          const data = (await res.json()) as { error?: string };
          setErrorKey(errorToKey(data.error ?? "server"));
          setStatus("error");
          return;
        }
        // الكوكي انضبط — إعادة تحميل الصفحة الخادمية تعرض الرفّ
        router.refresh();
      } else {
        const res = await fetch("/api/library/request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (!res.ok) {
          const data = (await res.json()) as { error?: string };
          setErrorKey(errorToKey(data.error ?? "server"));
          setStatus("error");
          return;
        }
        setStatus("sent");
      }
    } catch {
      setErrorKey("errorServer");
      setStatus("error");
    }
  }

  /** تبديل الوضع مع تصفير الحالة */
  function switchMode(next: Mode) {
    setMode(next);
    setStatus("idle");
    setErrorKey(null);
  }

  /* شاشة «أُرسل الرابط» — رد عام لا يكشف وجود الحساب */
  if (mode === "forgot" && status === "sent") {
    return (
      <LibraryCard>
        <div className="text-center">
          <div style={{ fontSize: 44, marginBottom: 12 }}>📮</div>
          <h2 className="font-heading font-bold text-dark mb-2" style={{ fontSize: 19 }}>
            {t("sentTitle")}
          </h2>
          <p className="text-mid" style={{ fontSize: 14, lineHeight: 1.9 }}>
            {t("sentBody")}
          </p>
          <button
            onClick={() => switchMode("login")}
            className="mt-5 font-label font-bold text-teal hover:opacity-70 transition-opacity"
            style={{ fontSize: 13.5, background: "none", border: "none", cursor: "pointer" }}
          >
            {t("backToLogin")}
          </button>
        </div>
      </LibraryCard>
    );
  }

  return (
    <LibraryCard>
      <h2 className="font-heading font-bold text-dark mb-1.5" style={{ fontSize: 20 }}>
        {mode === "login" ? t("loginTitle") : t("forgotTitle")}
      </h2>
      <p className="text-mid mb-6" style={{ fontSize: 13.5, lineHeight: 1.9 }}>
        {mode === "login" ? t("loginHint") : t("forgotHint")}
      </p>

      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <div>
          <label style={fieldLabelStyle} htmlFor="library-email">{t("emailLabel")}</label>
          <input
            id="library-email"
            type="email"
            dir="ltr"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            style={fieldStyle}
            required
          />
        </div>

        {mode === "login" && (
          <div>
            <label style={fieldLabelStyle} htmlFor="library-password">{t("passwordLabel")}</label>
            <input
              id="library-password"
              type="password"
              dir="ltr"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={fieldStyle}
              required
            />
          </div>
        )}

        {errorKey && <FormError message={t(errorKey)} />}

        <SubmitButton busy={status === "submitting"}>
          {status === "submitting"
            ? t("submitting")
            : mode === "login"
              ? t("loginCta")
              : t("forgotCta")}
        </SubmitButton>
      </form>

      <div className="text-center mt-5">
        <button
          onClick={() => switchMode(mode === "login" ? "forgot" : "login")}
          className="font-label font-bold text-teal hover:opacity-70 transition-opacity"
          style={{ fontSize: 13, background: "none", border: "none", cursor: "pointer" }}
        >
          {mode === "login" ? t("forgotLink") : t("backToLogin")}
        </button>
      </div>

      {mode === "login" && (
        <p
          className="text-center mt-5 pt-5 text-light"
          style={{ fontSize: 12.5, lineHeight: 1.9, borderTop: "1.5px solid var(--bord)" }}
        >
          {t("firstTimeNote")}
        </p>
      )}
    </LibraryCard>
  );
}
