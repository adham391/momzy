import { formatILS } from "@/lib/utils/format";

interface PaymentRetryCardProps {
  /** UUID الطلب — لتوليد رابط دفع جديد */
  orderId: string;
  /** إجمالي المبلغ المطلوب دفعه */
  amount: number;
  /** هل عاد العميل من محاولة دفع فاشلة؟ (يغيّر نبرة الرسالة) */
  failed: boolean;
}

/**
 * بطاقة "بانتظار الدفع" — تظهر في صفحة التأكيد حين يكون HYP مفعّلاً
 * والطلب لم يُدفع بعد. تعرض زر إعادة توليد رابط دفع HYP.
 */
export default function PaymentRetryCard({ orderId, amount, failed }: PaymentRetryCardProps) {
  return (
    <div
      className="rounded-[22px] text-center"
      style={{
        background: "var(--yellowlt)",
        border: "1.5px solid var(--yellow)",
        padding: "28px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
      }}
    >
      <h2 className="font-heading font-bold text-dark text-[19px] mb-2">
        {failed ? "لم يكتمل الدفع" : "بانتظار إتمام الدفع"}
      </h2>
      <p className="font-label text-[13.5px] text-mid leading-[1.85] mb-5 max-w-[440px] mx-auto">
        {failed
          ? "لم تكتمل عملية الدفع، وطلبكِ محفوظ لدينا. يمكنكِ إعادة المحاولة الآن بأمان."
          : "طلبكِ محفوظ بانتظار الدفع. أكملي الدفع الآمن لتأكيد طلبكِ وبدء تجهيزه."}
      </p>

      {/* زر إعادة الدفع — لصفحة الدفع المدمجة (iframe داخل الموقع) */}
      <a
        href={`/checkout/pay/${orderId}`}
        className="inline-block font-label font-bold text-white text-[15px]"
        style={{
          background: "var(--rose)",
          borderRadius: 50,
          padding: "14px 34px",
          boxShadow: "0 6px 20px rgba(242,167,181,0.45)",
        }}
      >
        {`إتمام الدفع — ${formatILS(amount)} ←`}
      </a>

      <p className="font-label text-[11.5px] text-light mt-4">
        🔒 دفع آمن ومشفّر عبر HYP
      </p>
    </div>
  );
}
