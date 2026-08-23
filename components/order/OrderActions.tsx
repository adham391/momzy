import { Link } from "@/lib/i18n/navigation";

/** أزرار الإجراءات بعد إتمام الطلب */
export default function OrderActions() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* مواصلة التسوق */}
        <Link
          href="/shop"
          className="text-center font-label font-bold text-[15px] text-dark [transition:transform_200ms_cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-[2px]"
          style={{
            background: "var(--yellow)",
            border: "none",
            borderRadius: 50,
            padding: "14px 24px",
            textDecoration: "none",
          }}
        >
          مواصلة التسوق
        </Link>

        {/* تواصلي معنا */}
        <Link
          href="/contact"
          className="text-center font-label font-bold text-[15px] [transition:transform_200ms_cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-[2px]"
          style={{
            background: "transparent",
            color: "var(--teal)",
            border: "2px solid var(--teal)",
            borderRadius: 50,
            padding: "12px 24px",
            textDecoration: "none",
          }}
        >
          تواصلي معنا
        </Link>
      </div>

      {/* ملاحظة سفلية */}
      <p className="text-center font-label text-[13px] text-mid">
        ✉️ ستصلكِ رسالة تأكيد على بريدك الإلكتروني خلال دقائق
      </p>
    </div>
  );
}
