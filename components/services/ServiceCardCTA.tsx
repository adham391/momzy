"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import BookingModal from "./BookingModal";
import CTAAction from "./CTAAction";
import { serviceContactTarget } from "@/lib/services/contactLink";
import type { AgeGate } from "@/lib/utils/age";

interface ServiceCardCTAProps {
  serviceTitle: string;
  serviceSlug: string;
  /** المقاعد المتبقية — undefined = لا جلسات مجدولة بعد */
  seatsLeft?: number;
  /** الفئة العمرية للورشة — تُمرَّر لنموذج التسجيل */
  ageGate?: AgeGate;
  /** السعر بالشيكل — يظهر داخل الزر. بلا سعر يبقى النص وحده */
  price?: number;
  /** لا حجز إلكتروني — الزرّ يفتح واتساب للاتفاق مع هبة */
  whatsappOnly?: boolean;
  /** رقم هبة — بدونه يذهب الزرّ إلى صفحة التواصل */
  whatsappNumber?: string;
}

/**
 * زر التسجيل الإلكتروني في بطاقة الخدمة — يفتح نموذج التسجيل مباشرةً.
 * عند اكتمال المقاعد يتحوّل لزرّ قائمة انتظار (النموذج نفسه يعرض خطوة الانتظار).
 */
export default function ServiceCardCTA({
  serviceTitle,
  serviceSlug,
  seatsLeft,
  ageGate,
  price,
  whatsappOnly,
  whatsappNumber,
}: ServiceCardCTAProps) {
  const t = useTranslations("services");
  const [open, setOpen] = useState(false);
  const isFull = seatsLeft === 0;

  // خدمة تُتّفق مباشرة: لا مقاعد ولا سعر ثابت، فلا نموذج تسجيل
  const contact = whatsappOnly
    ? serviceContactTarget(whatsappNumber, t("waArrangeMessage", { title: serviceTitle }))
    : null;

  return (
    <>
      <CTAAction
        href={contact?.href}
        disabled={!!contact && !contact.href}
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
        {contact
          ? t("arrangeWhatsApp")
          : isFull
          ? t("fullJoinWaitlist")
          : price
            ? t.rich("registerNowPriced", {
                price: String(price),
                // أرقام Tajawal اللاتينية أقصر بصريًا من حروفه العربية — رفعٌ
                // طفيف يوازن الارتفاع الظاهر مع «سجّلي الآن» بلا تكبير فعلي
                amt: (chunks) => (
                  <span dir="ltr" style={{ fontSize: "1.14em" }}>
                    {chunks}
                  </span>
                ),
              })
            : t("registerNow")}
      </CTAAction>

      {/* النموذج لا يُركَّب أصلًا للخدمات التي تُتّفق على واتساب */}
      {!contact && (
        <BookingModal
          open={open}
          onClose={() => setOpen(false)}
          serviceTitle={serviceTitle}
          serviceSlug={serviceSlug}
          ageGate={ageGate}
        />
      )}
    </>
  );
}
