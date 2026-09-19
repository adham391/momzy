"use client";

import { useEffect, useState } from "react";
import type { Currency } from "@/lib/currency";

/** ما يعرفه المتصفح عن الزائرة من /api/geo — للتنبيه المبكر ولعرض الأسعار بعملتها */
export interface VisitorGeo {
  domestic: boolean;
  currency: Currency;
}

/** داخل البلاد بالشيكل — الاحتياطي عند أي فشل: السيرفر هو الحكم على أي حال */
const FALLBACK: VisitorGeo = { domestic: true, currency: "ILS" };

/** null حتى يصل جواب /api/geo */
export function useGeo(): VisitorGeo | null {
  const [geo, setGeo] = useState<VisitorGeo | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/geo", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data: Partial<VisitorGeo>) => {
        if (cancelled) return;
        setGeo({
          domestic: data.domestic !== false,
          currency: data.currency === "USD" ? "USD" : "ILS",
        });
      })
      .catch(() => {
        if (!cancelled) setGeo(FALLBACK);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return geo;
}
