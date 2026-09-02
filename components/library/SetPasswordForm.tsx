"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/navigation";
import { PASSWORD_MIN_LENGTH } from "@/lib/library/constants";
import { FormError, SubmitButton, fieldStyle, fieldLabelStyle } from "./ui";

type Status = "idle" | "submitting" | "error";

/**
 * اختيار كلمة المرور من رابط الإيميل — تُثبَّت وتُفتح الجلسة فورًا
 * ثم تُوجَّه العميلة لمكتبتها بلا خطوة دخول إضافية.
 */
export default function SetPasswordForm({ token }: { token: string }) {
  const t = useTranslations("library");
  const router = useRouter();

  const [status, setStatus] = useState<Status>("idle");
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "submitting") return;
    setErrorKey(null);

    if (password.length < PASSWORD_MIN_LENGTH) {
      setErrorKey("errorPasswordShort");
      return;
    }
    if (password !== confirm) {
      setErrorKey("errorPasswordMismatch");
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/library/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setErrorKey(data.error === "invalid_token" ? "errorTokenUsed" : "errorServer");
        setStatus("error");
        return;
      }
      // الجلسة فُتحت — إلى المكتبة مباشرة
      router.push("/library");
      router.refresh();
    } catch {
      setErrorKey("errorServer");
      setStatus("error");
    }
  }

  return (
    <>
      <h1 className="font-heading font-bold text-dark mb-1.5" style={{ fontSize: 20 }}>
        {t("setupTitle")}
      </h1>
      <p className="text-mid mb-6" style={{ fontSize: 13.5, lineHeight: 1.9 }}>
        {t("setupHint")}
      </p>

      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <div>
          <label style={fieldLabelStyle} htmlFor="setup-password">{t("newPasswordLabel")}</label>
          <input
            id="setup-password"
            type="password"
            dir="ltr"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={fieldStyle}
            required
            minLength={PASSWORD_MIN_LENGTH}
          />
          <p className="text-light mt-1.5" style={{ fontSize: 12 }}>
            {t("passwordRule", { min: String(PASSWORD_MIN_LENGTH) })}
          </p>
        </div>

        <div>
          <label style={fieldLabelStyle} htmlFor="setup-confirm">{t("confirmPasswordLabel")}</label>
          <input
            id="setup-confirm"
            type="password"
            dir="ltr"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            style={fieldStyle}
            required
          />
        </div>

        {errorKey && (
          <FormError
            message={
              errorKey === "errorPasswordShort"
                ? t(errorKey, { min: String(PASSWORD_MIN_LENGTH) })
                : t(errorKey)
            }
          />
        )}

        <SubmitButton busy={status === "submitting"}>
          {status === "submitting" ? t("submitting") : t("setupCta")}
        </SubmitButton>
      </form>
    </>
  );
}
