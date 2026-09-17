import { isHypConfigured } from "@/lib/hyp/client";
import { isSettled } from "@/lib/stats/settlement";

/**
 * هل يُؤكَّد الطلب أو الحجز ويُسلَّم؟ — القاعدة الوحيدة لإيميل التأكيد، ورابط الكتيب
 * ومكتبته وقارئه، ورابط اللقاء، وإشعار هبة، والنشرة لمن وافقت:
 *
 *  - غير ملغى، ومدفوع أو مجاني — نعم.
 *  - HYP غير مضبوط أصلًا (تدفّق يدوي بلا دفع إلكتروني، في التطوير) — نعم، كما كان.
 *  - HYP مضبوط والمبلغ لم يُدفع — لا. ومنه فشلُ إنشاء رابط الدفع: كان يُعامَل كغياب
 *    HYP، فوصل تأكيد الطلب ورابط الكتيب لمن لم تدفع شيئًا.
 */
export function canFulfill(paymentStatus: string, amount: number, cancelled: boolean): boolean {
  if (cancelled) return false;
  return isSettled(paymentStatus, amount, false) || !isHypConfigured();
}
