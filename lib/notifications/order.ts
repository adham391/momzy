import { getOrderById } from "@/lib/db/orders";
import { canFulfill } from "@/lib/orders/fulfillment";
import { isEmailConfigured, sendEmail } from "@/lib/resend/client";
import { getNotifyEmails, orderNotificationKinds } from "./recipients";
import {
  orderCustomerEmailHtml,
  orderCustomerSubject,
  orderAdminEmailHtml,
  orderAdminSubject,
} from "@/lib/resend/emails/orderEmail";

/**
 * إشعارات الطلب — نظير lib/notifications/digital.ts وbooking.ts.
 *
 * القاعدة: **لا تأكيد قبل الدفع.** كان التأكيد يُرسل لحظة إنشاء الطلب،
 * فتصل العميلة رسالة «تأكيد طلبكِ» ثم تُرفض بطاقتها — ويصل هبة إيميل
 * عن طلب لن يُدفع أبدًا.
 *
 * فصار:
 *  - الدفع الإلكتروني مفعّل → لا شيء عند الإنشاء؛ التأكيد وإشعار هبة بعد
 *    نجاح الدفع من /api/hyp/callback، وتذكير المتروك من notifications/recovery.ts.
 *  - غير مفعّل (تدفّق يدوي) → الطلب يبقى pending ولا دفع إلكتروني أصلًا،
 *    فالتأكيد وإشعار هبة يُرسلان عند الإنشاء كما كانا.
 *
 * كلها best-effort: تُنفَّذ بعد الرد ولا ترمي.
 */

/**
 * تأكيد الطلب — للعميلة ولهبة، بالإيميل.
 * (لا واتساب للطلب: الإيميل يصلها فيه كل التفاصيل — الواتساب للحجوزات وجدول اليوم.)
 * يُستدعى بعد نجاح الدفع، أو عند الإنشاء في التدفّق اليدوي.
 *
 * إشعار هبة يذهب لصندوق يطابق محتوى الطلب: الفيزيائي لصندوق الطلبات
 * والرقمي لصندوق الكتيبات. والطلب المختلط يخصّ الصندوقين فيصل لكليهما
 * (مرة واحدة لو كان العنوانان واحدًا).
 */
export async function sendOrderConfirmation(orderId: string): Promise<void> {
  const order = await getOrderById(orderId);
  if (!order) return;
  // حارس أخير: لا تأكيد لطلب لم يُدفع ولو استُدعيت الدالة خطأً
  if (!canFulfill(order.payment_status, order.total_amount, order.order_status === "cancelled")) {
    console.warn("[order] تأكيد مرفوض لطلب غير مدفوع:", order.order_number);
    return;
  }

  if (isEmailConfigured()) {
    await sendEmail({
      to: order.customer_email,
      subject: orderCustomerSubject(order),
      html: orderCustomerEmailHtml(order),
    });
    for (const to of await getNotifyEmails(orderNotificationKinds(order.items))) {
      await sendEmail({
        to,
        replyTo: order.customer_email,
        subject: orderAdminSubject(order),
        html: orderAdminEmailHtml(order),
      });
    }
  }
}

