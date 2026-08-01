"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

/** مولّد روابط UTM — لتتبّع مصادر الحملات */
export default function UtmGenerator({ baseUrl }: { baseUrl: string }) {
  const [source, setSource] = useState("");
  const [medium, setMedium] = useState("");
  const [campaign, setCampaign] = useState("");
  const [copied, setCopied] = useState(false);

  const params = new URLSearchParams();
  if (source.trim()) params.set("utm_source", source.trim());
  if (medium.trim()) params.set("utm_medium", medium.trim());
  if (campaign.trim()) params.set("utm_campaign", campaign.trim());
  const qs = params.toString();
  const url = `${baseUrl}${qs ? `?${qs}` : ""}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  const inputCls =
    "w-full px-3 py-2.5 rounded-xl border border-bord bg-offwh text-body-sm text-dark placeholder:text-light focus:outline-none focus:border-rose";

  return (
    <div className="bg-white rounded-[var(--rl)] border border-bord p-5">
      <h2 className="font-heading font-bold text-dark text-body mb-1">مولّد روابط UTM</h2>
      <p className="text-micro text-light mb-4">أنشئي رابطًا يتتبّع مصدر الزيارة (إنستغرام، حملة…)</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-micro text-light font-label">المصدر (source)</span>
          <input value={source} onChange={(e) => setSource(e.target.value)} placeholder="instagram" dir="ltr" className={`${inputCls} text-left`} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-micro text-light font-label">الوسيط (medium)</span>
          <input value={medium} onChange={(e) => setMedium(e.target.value)} placeholder="story" dir="ltr" className={`${inputCls} text-left`} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-micro text-light font-label">الحملة (campaign)</span>
          <input value={campaign} onChange={(e) => setCampaign(e.target.value)} placeholder="ramadan" dir="ltr" className={`${inputCls} text-left`} />
        </label>
      </div>

      <div className="flex items-center gap-2 bg-offwh rounded-xl border border-bord p-3">
        <span className="flex-1 text-body-sm text-dark break-all" dir="ltr" style={{ textAlign: "left" }}>
          {url}
        </span>
        <button
          onClick={copy}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-dark text-white text-body-sm font-bold hover:brightness-125 transition"
        >
          {copied ? <Check size={15} /> : <Copy size={15} />}
          {copied ? "نُسخ" : "نسخ"}
        </button>
      </div>
    </div>
  );
}
