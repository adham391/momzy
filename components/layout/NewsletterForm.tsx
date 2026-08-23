"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

/** نموذج الاشتراك بالنشرة البريدية — يظهر في الفوتر */
export default function NewsletterForm() {
  const t = useTranslations("newsletter");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "footer" }),
      });
      const data = (await res.json()) as { success: boolean };
      if (data.success) {
        setStatus("success");
        setEmail("");
        setTimeout(() => setStatus("idle"), 4000);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="text-[13px] py-3 px-4 rounded-[10px]" style={{ background: "rgba(130,201,196,0.18)", color: "#A8D8D5", border: "1px solid rgba(130,201,196,0.4)" }}>
        {t("success")}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-1.5">
        <input
          type="email"
          required
          placeholder={t("placeholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "loading"}
          suppressHydrationWarning
          className="flex-1 px-3.5 py-2.5 rounded-[10px] text-[13px] outline-none [transition:border-color_150ms_ease]"
          style={{
            background: "rgba(255,255,255,0.08)",
            color: "white",
            border: "1px solid rgba(255,255,255,0.18)",
            fontFamily: "var(--font-tajawal), sans-serif",
          }}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          suppressHydrationWarning
          className="font-label font-bold text-[13px] px-4 rounded-[10px] [transition:opacity_150ms_ease] hover:opacity-85 disabled:opacity-60"
          style={{ background: "var(--rose)", color: "var(--dark)", border: "none", cursor: "pointer" }}
        >
          {status === "loading" ? "..." : t("subscribe")}
        </button>
      </div>
      {status === "error" && (
        <p className="text-[11px]" style={{ color: "#F2A7B5" }}>{t("error")}</p>
      )}
    </form>
  );
}
