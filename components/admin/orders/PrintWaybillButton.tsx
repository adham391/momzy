"use client";

import { useEffect } from "react";
import { Printer } from "lucide-react";

/** أقصى انتظار لصور الصفحة — صورة عالقة لا تمنع فتح نافذة الطباعة */
const IMAGES_WAIT_LIMIT_MS = 5000;

/**
 * يكتمل حين تجهز صور الصفحة للرسم (أو يفشل تحميلها)، أو حين ينقضي الحدّ الأقصى.
 * نافذة الطباعة تلتقط الصفحة لحظة فتحها: شعار لم يصل بعد يُطبع فراغًا.
 */
function imagesReady(): Promise<void> {
  const decoded = Array.from(document.images, (img) => img.decode().catch(() => undefined));
  const limit = new Promise<void>((resolve) => setTimeout(resolve, IMAGES_WAIT_LIMIT_MS));
  return Promise.race([Promise.all(decoded).then(() => undefined), limit]);
}

/** الخطوط والصور أولًا — وإلا طُبع النص بخطّ احتياطي والشعار فارغًا */
function whenReadyToPrint(): Promise<void> {
  return Promise.all([document.fonts.ready, imagesReady()]).then(() => undefined);
}

/**
 * زر طباعة שטר המטען. حين تُفتح الصفحة من زر «طباعة שטר מטען» (autoPrint)
 * تُفتح نافذة الطباعة وحدها — بعد جاهزية الخطوط والصور.
 */
export default function PrintWaybillButton({ autoPrint }: { autoPrint: boolean }) {
  useEffect(() => {
    if (!autoPrint) return;
    let cancelled = false;
    whenReadyToPrint().then(() => {
      if (!cancelled) window.print();
    });
    return () => {
      cancelled = true;
    };
  }, [autoPrint]);

  return (
    <button
      type="button"
      onClick={() => whenReadyToPrint().then(() => window.print())}
      className="inline-flex items-center gap-2 rounded-xl bg-dark px-5 py-2.5 text-body-sm font-bold text-white transition hover:brightness-125 print:hidden"
    >
      <Printer size={16} /> طباعة
    </button>
  );
}
