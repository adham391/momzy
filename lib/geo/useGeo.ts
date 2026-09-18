"use client";

import { useEffect, useState } from "react";
import { DEFAULT_USD_RATE, type Currency } from "@/lib/currency";

/** ما يعرفه المتصفح عن الزائرة من /api/geo — للتنبيه المبكر ولعرض الأسعار بعملتها */
export interface VisitorGeo {
  domestic: boolean;
  currency: Currency;
  /** ₪ لكل $1 — يهمّ الزائرة من خارج البلاد فقط */
  usdRate: number;
}

/** داخل البلاد بالشيكل — الاحتياطي عند أي فشل: السيرفر هو الحكم على أي حال */
const FALLBACK: VisitorGeo = { domestic: true, currency: "ILS", usdRate: DEFAULT_USD_RATE };

/** null حتى يصل جواب /api/geo */
export function useGeo(): VisitorGeo | null {
  const [geo, setGeo] = useState<VisitorGeo | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/geo", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data: Partial<VisitorGeo>) => {
        if (cancelled) return;
        const usdRate = Number(data.usdRate);
        setGeo({
          domestic: data.domestic !== false,
          currency: data.currency === "USD" ? "USD" : "ILS",
          usdRate: usdRate > 0 ? usdRate : DEFAULT_USD_RATE,
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
