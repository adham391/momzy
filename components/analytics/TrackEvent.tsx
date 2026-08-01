"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics/track";

/**
 * يسجّل حدثاً مرّة واحدة عند التركيب — للاستخدام داخل server components
 * (view_product، begin_checkout، purchase...).
 */
export default function TrackEvent({
  event,
  data,
}: {
  event: string;
  data?: Record<string, unknown>;
}) {
  useEffect(() => {
    track(event, data ?? {});
    // مرّة واحدة عند التركيب — data مُلتقطة في الإغلاق
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);
  return null;
}
