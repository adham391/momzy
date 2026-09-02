"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/navigation";
import { PASSWORD_MIN_LENGTH } from "@/lib/library/constants";
import { compactFieldStyle } from "./ui";

type Status = "idle" | "submitting" | "done" | "error";

/**
 * شريط الحساب أعلى الرفّ — البريد + تغيير كلمة المرور (لوحة قابلة للطي) + خروج.
 */
export default function AccountBar({ email }: { email: string }) {
  const t = useTranslations("library");
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  async function logout() {
    await fetch("/api/library/logout", { method: "POST" });
    router.refresh();
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (status === "submitting") return;
    setErrorKey(null);

    if (next.length < PASSWORD_MIN_LENGTH) {
      setErrorKey("errorPasswordShort");
      return;
    }
    if (next !== confirm) {
      setErrorKey("errorPasswordMismatch");
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/library/change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setErrorKey(data.error === "wrong_current" ? "errorWrongCurrent" : "errorServer");
        setStatus("error");
        return;
      }
      setStatus("done");
      setCurrent(""); setNext(""); setConfirm("");
    } catch {
      setErrorKey("errorServer");
      setStatus("error");
    }
  }

  return (
    <div
      className="bg-white"
      style={{ borderRadius: 18, border: "1.5px solid var(--bord)", padding: "16px 20px" }}
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* هوية الحساب */}
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className="flex items-center justify-center shrink-0 rounded-full"
            style={{ width: 36, height: 36, background: "var(--tealpale)", fontSize: 16 }}
          >
            👤
          </span>
          <span dir="ltr" className="font-label text-mid truncate" style={{ fontSize: 13.5 }}>
            {email}
          </span>
        </div>

        {/* الإجراءات */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setOpen(!open); setStatus("idle"); setErrorKey(null); }}
            className="font-label font-bold hover:opacity-75 transition-opacity"
            style={{
              background: "var(--offwh)", border: "1.5px solid var(--bord)", color: "var(--mid)",
              borderRadius: 50, padding: "8px 16px", fontSize: 12.5, cursor: "pointer",
            }}
          >
            {t("changePasswordCta")}
          </button>
          <button
            onClick={logout}
            className="font-label font-bold hover:opacity-75 transition-opacity"
            style={{
              background: "none", border: "1.5px solid var(--roselt)", color: "#D9697A",
              borderRadius: 50, padding: "8px 16px", fontSize: 12.5, cursor: "pointer",
            }}
          >
            {t("logoutCta")}
          </button>
        </div>
      </div>

      {/* لوحة تغيير كلمة المرور */}
      {open && (
        <form
          onSubmit={changePassword}
          noValidate
          className="grid gap-3 mt-4 pt-4 sm:grid-cols-3"
          style={{ borderTop: "1.5px solid var(--bord)" }}
        >
          <input
            type="password" dir="ltr" autoComplete="current-password"
            placeholder={t("currentPasswordLabel")}
            value={current} onChange={(e) => setCurrent(e.target.value)}
            style={compactFieldStyle}
          />
          <input
            type="password" dir="ltr" autoComplete="new-password"
            placeholder={t("newPasswordLabel")}
            value={next} onChange={(e) => setNext(e.target.value)}
            style={compactFieldStyle}
          />
          <input
            type="password" dir="ltr" autoComplete="new-password"
            placeholder={t("confirmPasswordLabel")}
            value={confirm} onChange={(e) => setConfirm(e.target.value)}
            style={compactFieldStyle}
          />

          <div className="sm:col-span-3 flex items-center gap-3 flex-wrap">
            <button
              type="submit"
              disabled={status === "submitting"}
              className="font-label font-bold text-white active:scale-[0.98] [transition:transform_160ms_var(--ease-out)]"
              style={{
                background: "var(--teal)", border: "none", borderRadius: 50,
                padding: "10px 24px", fontSize: 13,
                cursor: status === "submitting" ? "wait" : "pointer",
                opacity: status === "submitting" ? 0.75 : 1,
              }}
            >
              {status === "submitting" ? t("submitting") : t("saveCta")}
            </button>
            {status === "done" && (
              <span className="font-label font-bold text-teal" style={{ fontSize: 13 }}>
                ✓ {t("passwordChanged")}
              </span>
            )}
            {errorKey && (
              <span className="font-label font-bold" style={{ color: "#D9697A", fontSize: 13 }} role="alert">
                {t(errorKey)}
              </span>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
