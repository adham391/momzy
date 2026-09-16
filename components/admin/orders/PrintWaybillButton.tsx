"use client";

import { useEffect } from "react";
import { Printer } from "lucide-react";

/**
 * زر طباعة שטר המטען. حين تُفتح الصفحة من زر «طباعة שטר מטען» (autoPrint)
 * تُفتح نافذة الطباعة وحدها — بعد تحميل الخطوط، كي لا يُطبع النص بخطّ احتياطي.
 */
export default function PrintWaybillButton({ autoPrint }: { autoPrint: boolean }) {
  useEffect(() => {
    if (!autoPrint) return;
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (!cancelled) window.print();
    });
    return () => {
      cancelled = true;
    };
  }, [autoPrint]);

  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-xl bg-dark px-5 py-2.5 text-body-sm font-bold text-white transition hover:brightness-125 print:hidden"
    >
      <Printer size={16} /> طباعة
    </button>
  );
}
