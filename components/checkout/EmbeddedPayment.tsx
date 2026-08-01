"use client";

import { useState } from "react";
import Image from "next/image";
import { formatILS } from "@/lib/utils/format";

interface EmbeddedPaymentProps {
  /** نوع الدفع — طلب متجر أو تسجيل ورشة/خدمة */
  kind?: "order" | "booking";
  /** UUID الطلب أو الحجز — مصدر رابط الدفع عبر /api/hyp/retry */
  id: string;
  /** رقم الطلب (MZ-…) أو التسجيل (BK-…) — يُعرض في الترويسة إن وُجد */
  reference?: string;
  /** المبلغ — يُعرض في الترويسة إن وُجد */
  total?: number;
  /** رجوع لتعديل البيانات (وضع الصفحة الواحدة السلسة) */
  onEdit?: () => void;
}

/**
 * بطاقة الدفع المدمجة — تعرض صفحة دفع HYP داخل iframe على موقع Momzy.
 * العميلة لا تغادر الموقع؛ بيانات البطاقة تُدخَل داخل إطار HYP وتذهب مباشرة
 * إليه (لا تمسّ سيرفر Momzy) — يبقى الامتثال عند أبسط مستوى (SAQ A).
 */
export default function EmbeddedPayment({
  kind = "order",
  id,
  reference,
  total,
  onEdit,
}: EmbeddedPaymentProps) {
  const [loaded, setLoaded] = useState(false);
  const isBooking = kind === "booking";
  const hasSummary = reference && total != null;
  const src = `/api/hyp/retry?${isBooking ? "booking" : "order"}=${id}`;

  return (
    <div className="max-w-[680px] mx-auto">
      {/* ── ترويسة ── */}
      <div className="text-center mb-5">
        <Image
          src="/icons/momzy-logo.png"
          alt="Momzy"
          width={120}
          height={40}
          className="mx-auto mb-3 object-contain"
          style={{ height: 38, width: "auto" }}
        />
        <h2 className="font-heading font-bold text-dark text-[22px] mb-1.5">بطاقة الدفع الآمنة</h2>
        <p className="font-label text-[13.5px] text-mid">
          {hasSummary ? (
            <>
              {isBooking ? "التسجيل" : "الطلب"}{" "}
              <span dir="ltr" className="font-bold text-dark">{reference}</span> — الإجمالي{" "}
              <span className="font-bold text-dark">{formatILS(total)}</span>
            </>
          ) : (
            "أدخلي بيانات بطاقتك في النموذج الآمن أدناه"
          )}
        </p>
      </div>

      {/* ── حاوية الـ iframe ── */}
      <div
        className="rounded-[22px] overflow-hidden relative"
        style={{
          background: "white",
          border: "1.5px solid var(--bord)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          minHeight: 640,
        }}
      >
        {/* غطاء تحميل — يُخفى عند اكتمال تحميل صفحة HYP */}
        {!loaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10" style={{ background: "white" }}>
            <div
              className="rounded-full animate-spin"
              style={{ width: 40, height: 40, border: "3px solid var(--bord)", borderTopColor: "var(--rose)" }}
            />
            <p className="font-label text-[13px] text-light">جارٍ تحميل صفحة الدفع الآمنة…</p>
          </div>
        )}

        <iframe
          src={src}
          title="صفحة الدفع الآمنة — HYP"
          onLoad={() => setLoaded(true)}
          allow="payment"
          className="w-full block"
          style={{ height: 640, border: "none" }}
        />
      </div>

      {/* ── تذييل: رجوع + أمان ── */}
      <div className="flex items-center justify-center gap-4 mt-4">
        {onEdit && (
          <button
            onClick={onEdit}
            className="font-label text-[13px] text-mid hover:text-dark transition-colors active:scale-[0.98]"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            ← {isBooking ? "تعديل بياناتي" : "تعديل بيانات التوصيل"}
          </button>
        )}
        <span className="font-label text-[12px] text-light">🔒 مشفّر عبر HYP · بياناتك البنكية لا تُحفظ لدينا</span>
      </div>
    </div>
  );
}
