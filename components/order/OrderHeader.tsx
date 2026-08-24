"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { formatDateTime } from "@/lib/utils/format";

interface OrderHeaderProps {
  orderNumber: string;
  createdAt:   string;
  /** هل اكتمل الطلب (مدفوع أو تدفّق يدوي)؟ false = بانتظار دفع HYP */
  paid?:       boolean;
}

/** هيدر صفحة التأكيد — أيقونة الحالة + رقم الطلب + التاريخ */
export default function OrderHeader({ orderNumber, createdAt, paid = true }: OrderHeaderProps) {
  const t = useTranslations("order");
  const [copied, setCopied] = useState(false);

  /** نسخ رقم الطلب إلى الحافظة */
  async function copyOrderNumber() {
    try {
      await navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  /** تنسيق التاريخ بالعربية مع أرقام لاتينية */
  const formattedDate = formatDateTime(createdAt);

  return (
    <div
      className="text-center rounded-[22px]"
      style={{
        background: "white",
        border: "1.5px solid var(--bord)",
        padding: "40px 28px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }}
    >
      {/* دائرة الأيقونة — نجاح (✓ teal) أو بانتظار الدفع (⏱ أصفر) */}
      <div
        className="mx-auto rounded-full flex items-center justify-center mb-5"
        style={{
          width: 80,
          height: 80,
          background: paid ? "var(--tealpale)" : "var(--yellow)",
        }}
      >
        {paid ? (
          <Image
            src="/icons/correct-icon.png"
            alt={t("doneIconAlt")}
            width={48}
            height={48}
            className="object-contain"
          />
        ) : (
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label={t("awaitingIconLabel")}>
            <circle cx="12" cy="12" r="9" />
            <polyline points="12 7 12 12 15.5 14" />
          </svg>
        )}
      </div>

      {/* العنوان — حسب حالة الدفع */}
      <h1 className="font-heading font-bold text-dark text-h2 mb-2">
        {paid ? t("successTitle") : t("awaitingTitle")}
      </h1>
      <p className="font-label text-[14px] text-mid mb-6">
        {paid ? t("successSubtitle") : t("awaitingSubtitle")}
      </p>

      {/* رقم الطلب — قابل للنسخ */}
      <div
        className="inline-flex items-center gap-3 mb-3"
        style={{
          background: "var(--offwh)",
          border: "1.5px solid var(--bord)",
          borderRadius: 50,
          padding: "10px 20px",
        }}
      >
        <span className="font-label text-[13px] text-mid">{t("orderNumberLabel")}</span>
        <span
          className="font-label font-extrabold text-dark text-[16px]"
          style={{ letterSpacing: "0.5px", direction: "ltr" }}
        >
          {orderNumber}
        </span>
        <button
          onClick={copyOrderNumber}
          aria-label={t("copyOrderNumber")}
          className="text-light hover:text-teal transition-colors"
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 0 }}
        >
          {copied ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          )}
        </button>
      </div>

      {/* التاريخ */}
      <div className="font-label text-[12px] text-light">{formattedDate}</div>
    </div>
  );
}
