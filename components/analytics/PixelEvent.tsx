"use client";

import { useEffect, useRef } from "react";
import { pixelTrack } from "@/lib/analytics/pixel";

/**
 * حدث Meta Pixel واحد عند فتح الصفحة — للاستخدام داخل server components
 * (مشاهدة منتج، بدء الدفع). لا يسجّل شيئًا في تحليلات الموقع: تلك أحداثها
 * الخاصة في `track` كي لا تتضاعف الأرقام في `/admin/analytics`.
 */
export default function PixelEvent({
  name,
  params,
}: {
  name: "ViewContent" | "InitiateCheckout" | "Lead";
  params?: Record<string, unknown>;
}) {
  /** حارس: إعادة تركيب المكوّن لا تعني مشاهدة ثانية */
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    pixelTrack(name, params);
    // مرّة واحدة عند التركيب — params مُلتقطة في الإغلاق
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);
  return null;
}
