"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { captureUTM, track } from "@/lib/analytics/track";
import { pixelTrack } from "@/lib/analytics/pixel";

/** يلتقط UTM ويسجّل page_view عند كل تنقّل (يستثني صفحات الأدمن/الستوديو) */
export default function PageTracker() {
  const pathname = usePathname();
  /** أول صفحة أرسلها سكربت Meta نفسه — فلا نعدّها مرتين */
  const firstPath = useRef(true);
  /** آخر مسار أُرسل — إعادة تشغيل التأثير لنفس الصفحة لا تُرسل مرتين */
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    captureUTM();
    if (pathname.startsWith("/admin") || pathname.startsWith("/studio")) return;
    if (lastSent.current === pathname) return;
    lastSent.current = pathname;
    track("page_view", { page: pathname });
    // التنقّل داخل الموقع لا يعيد تحميل الصفحة، فلا يعرف Meta بالصفحة الجديدة
    if (firstPath.current) firstPath.current = false;
    else pixelTrack("PageView");
  }, [pathname]);

  return null;
}
