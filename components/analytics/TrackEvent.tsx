"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics/track";
import { pixelTrackValue } from "@/lib/analytics/pixel";

/**
 * يسجّل حدثًا مرّة واحدة عند التركيب — للاستخدام داخل server components
 * (view_product، begin_checkout، purchase...).
 */
export default function TrackEvent({
  event,
  data,
}: {
  event: string;
  data?: Record<string, unknown>;
}) {
  /** حارس: إعادة التركيب لا تعني حدثًا ثانيًا (الشراء خاصة) */
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    track(event, data ?? {});
    // الشراء يهمّ Meta أيضًا — من الحدث نفسه كي لا يُنسى أحدهما
    if (event === "purchase" && typeof data?.value === "number") {
      pixelTrackValue("Purchase", data.value, { content_type: "product" });
    }
    // مرّة واحدة عند التركيب — data مُلتقطة في الإغلاق
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);
  return null;
}
