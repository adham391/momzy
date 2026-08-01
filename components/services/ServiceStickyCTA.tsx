"use client";

import { useEffect, useState } from "react";
import BookingModal from "./BookingModal";
import { seatsLabel } from "@/lib/utils/seats";
import type { AgeGate } from "@/lib/utils/age";

interface ServiceStickyCTAProps {
  serviceTitle: string;
  serviceSlug: string;
  /** أقل سعر بين الجلسات القادمة (0 = بلا سعر) */
  price: number;
  /** مجموع المقاعد المتبقية — undefined = لا جلسات مجدولة */
  seatsLeft?: number;
  /** الفئة العمرية للورشة — تُمرَّر لنموذج التسجيل */
  ageGate?: AgeGate;
}

/**
 * شريط تسجيل ثابت أسفل الشاشة — للجوال فقط، يظهر بعد التمرير.
 * يفتح نموذج التسجيل (وفيه اختيار الموعد) — مثل بقية أزرار الصفحة تمامًا.
 */
export default function ServiceStickyCTA({
  serviceTitle,
  serviceSlug,
  price,
  seatsLeft,
  ageGate,
}: ServiceStickyCTAProps) {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isFull = seatsLeft === 0;

  return (
    <>
      <div
        className="md:hidden fixed bottom-0 inset-x-0 z-40"
        style={{
          background: "white",
          borderTop: "1.5px solid var(--bord)",
          boxShadow: "0 -6px 24px rgba(0,0,0,0.10)",
          padding: "10px 14px calc(10px + env(safe-area-inset-bottom))",
          transform: visible ? "translateY(0)" : "translateY(110%)",
          transition: "transform 280ms cubic-bezier(0.23,1,0.32,1)",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="font-label font-bold text-dark text-[13px] truncate">{serviceTitle}</div>
            <div className="font-label text-[11.5px] text-light">
              {price > 0 ? `₪${price}` : "حسب الطلب"}
              {typeof seatsLeft === "number" && ` · ${seatsLabel(seatsLeft)}`}
            </div>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="font-label font-bold text-[14px] shrink-0 active:scale-[0.97] [transition:transform_160ms_ease-out]"
            style={{
              background: isFull ? "var(--cream)" : "linear-gradient(135deg,#F2A7B5,#E88FA2)",
              color: isFull ? "var(--mid)" : "white",
              border: isFull ? "1.5px solid var(--bord)" : "none",
              borderRadius: 50,
              padding: "11px 26px",
              cursor: "pointer",
              boxShadow: isFull ? "none" : "0 6px 18px rgba(242,167,181,0.38)",
            }}
          >
            {isFull ? "قائمة الانتظار" : "سجّلي الآن"}
          </button>
        </div>
      </div>

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
