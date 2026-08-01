"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { captureUTM, track } from "@/lib/analytics/track";

/** يلتقط UTM ويسجّل page_view عند كل تنقّل (يستثني صفحات الأدمن/الستوديو) */
export default function PageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    captureUTM();
    if (pathname.startsWith("/admin") || pathname.startsWith("/studio")) return;
    track("page_view", { page: pathname });
  }, [pathname]);

  return null;
}
