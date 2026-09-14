/**
 * متى يُحسب الطلب أو التسجيل بيعًا؟ — قاعدة واحدة لكل أرقام لوحة الأدمن:
 * لوحة التحكم، و«نظرة عامة»، وتبويبات المنتجات والكتيبات والورشات.
 *
 * يُحسب إن كان مدفوعًا عبر HYP، أو مجانيًا أصلًا (مبلغه صفر: جلسة مجانية، أو كوبون
 * يغطّي الطلب كله) فلا دفع ينتظره. والملغى لا يُحسب أبدًا، مدفوعًا كان أو لا.
 * ما عليه مبلغ ولم يُدفع ليس بيعًا — غالبًا صفحة دفع تُركت.
 */

/** «مدفوع أو مجاني» للطلبات بصيغة فلتر PostgREST — يُستعمل مع `.neq("order_status", "cancelled")` */
export const SETTLED_ORDER_FILTER = "payment_status.eq.paid,total_amount.lte.0";

/** «مدفوع أو مجاني» للحجوزات بصيغة فلتر PostgREST — يُستعمل مع `.neq("status", "cancelled")` */
export const SETTLED_BOOKING_FILTER = "payment_status.eq.paid,amount.lte.0";

/** هل يُحسب بيعًا؟ */
export function isSettled(paymentStatus: string, amount: number, cancelled: boolean): boolean {
  return !cancelled && (paymentStatus === "paid" || amount <= 0);
}

/** بانتظار الدفع: عليه مبلغ، ولم يُدفع، ولم يُلغَ */
export function isAwaitingPayment(paymentStatus: string, amount: number, cancelled: boolean): boolean {
  return !cancelled && paymentStatus === "pending" && amount > 0;
}
