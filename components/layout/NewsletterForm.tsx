"use client";

import { useState } from "react";

/** نموذج الاشتراك بالنشرة البريدية — يظهر في الفوتر */
export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setStatus("loading");

    try {
      // TODO: ربط بـ /api/newsletter لاحقاً (يسجّل في Supabase newsletter_subscribers)
      await new Promise((r) => setTimeout(r, 700));
      setStatus("success");
      setEmail("");
      setTimeout(() => setStatus("idle"), 4000);
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="text-[13px] py-3 px-4 rounded-[10px]" style={{ background: "rgba(130,201,196,0.18)", color: "#A8D8D5", border: "1px solid rgba(130,201,196,0.4)" }}>
        ✓ تم الاشتراك! ستصلك أحدث المقالات ونصائح هبة
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-1.5">
        <input
          type="email"
          required
          placeholder="إيميلك"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "loading"}
          suppressHydrationWarning
          className="flex-1 px-3.5 py-2.5 rounded-[10px] text-[13px] outline-none [transition:border-color_150ms_ease]"
          style={{
            background: "rgba(255,255,255,0.08)",
            color: "white",
            border: "1px solid rgba(255,255,255,0.18)",
            fontFamily: "'Tajawal', sans-serif",
          }}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          suppressHydrationWarning
          className="font-label font-bold text-[13px] px-4 rounded-[10px] [transition:opacity_150ms_ease] hover:opacity-85 disabled:opacity-60"
          style={{ background: "var(--rose)", color: "var(--dark)", border: "none", cursor: "pointer" }}
        >
          {status === "loading" ? "..." : "اشتركي"}
        </button>
      </div>
      {status === "error" && (
        <p className="text-[11px]" style={{ color: "#F2A7B5" }}>حدث خطأ — حاولي مرة أخرى</p>
      )}
    </form>
  );
}
