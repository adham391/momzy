"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import BookingModal from "./BookingModal";
import type { AgeGate } from "@/lib/utils/age";

interface ServiceCardCTAProps {
  serviceTitle: string;
  serviceSlug: string;
  /** المقاعد المتبقية — undefined = لا جلسات مجدولة بعد */
  seatsLeft?: number;
  /** الفئة العمرية للورشة — تُمرَّر لنموذج التسجيل */
  ageGate?: AgeGate;
}

/**
 * زر التسجيل الإلكتروني في بطاقة الخدمة — يفتح نموذج التسجيل مباشرةً.
 * عند اكتمال المقاعد يتحوّل لزرّ قائمة انتظار (النموذج نفسه يعرض خطوة الانتظار).
 */
export default function ServiceCardCTA({ serviceTitle, serviceSlug, seatsLeft, ageGate }: ServiceCardCTAProps) {
  const t = useTranslations("services");
  const [open, setOpen] = useState(false);
  const isFull = seatsLeft === 0;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn-wobble flex items-center justify-center gap-2 font-bold w-full whitespace-nowrap active:scale-[0.98] [transition:transform_160ms_ease-out,background-color_200ms_ease]"
        style={{
          background: isFull ? "var(--cream)" : "linear-gradient(135deg,#F2A7B5,#E88FA2)",
          color: isFull ? "var(--mid)" : "white",
          border: isFull ? "1.5px solid var(--bord)" : "none",
          borderRadius: 50,
          padding: "11px 14px",
          fontSize: 14,
          cursor: "pointer",
          boxShadow: isFull ? "none" : "0 6px 18px rgba(242,167,181,0.38)",
        }}
      >
        {isFull ? t("fullJoinWaitlist") : t("registerNow")}
      </button>

      <BookingModal
        open={open}
        onClose={() => setOpen(false)}
        serviceTitle={serviceTitle}
        serviceSlug={serviceSlug}
        ageGate={ageGate}
      />
    </>
  );
}
