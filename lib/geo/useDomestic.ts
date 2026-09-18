"use client";

import { useEffect, useState } from "react";

/**
 * هل الزائرة داخل البلاد؟ — للتنبيه المبكر في الدفع والتسجيل.
 * null حتى يصل جواب /api/geo، وعند أي فشل تُعامَل كداخل البلاد: السيرفر هو الحكم على أي حال.
 */
export function useDomestic(): boolean | null {
  const [domestic, setDomestic] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/geo", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data: { domestic?: boolean }) => {
        if (!cancelled) setDomestic(data.domestic !== false);
      })
      .catch(() => {
        if (!cancelled) setDomestic(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return domestic;
}
