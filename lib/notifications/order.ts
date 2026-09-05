import { getOrderById } from "@/lib/db/orders";
import { isEmailConfigured, sendEmail } from "@/lib/resend/client";
import { getNotifyEmails, orderNotificationKinds } from "./recipients";
import {
  orderCustomerEmailHtml,
  orderCustomerSubject,
  orderAdminEmailHtml,
  orderAdminSubject,
} from "@/lib/resend/emails/orderEmail";
import { notifyHebaNewOrder } from "@/lib/whatsapp/notify";

/**
 * إشعارات الطلب — نظير lib/notifications/digital.ts وbooking.ts.
 *
 * القاعدة: **لا تأكيد قبل الدفع.** كان التأكيد يُرسل لحظة إنشاء الطلب،
 * فتصل العميلة رسالة «تأكيد طلبكِ» ثم تُرفض بطاقتها — وتصل هبة رسالة
 * وواتساب عن طلب لن يُدفع أبدًا.
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
 * تأكيد الطلب — للعميلة، ولهبة (إيميل + واتساب).
 * يُستدعى بعد نجاح الدفع، أو عند الإنشاء في التدفّق اليدوي.
 *
 * إشعار هبة يذهب لصندوق يطابق محتوى الطلب: الفيزيائي لصندوق الطلبات
 * والرقمي لصندوق الكتيبات. والطلب المختلط يخصّ الصندوقين فيصل لكليهما
 * (مرة واحدة لو كان العنوانان واحدًا).
 */
export async function sendOrderConfirmation(orderId: string): Promise<void> {
  const order = await getOrderById(orderId);
  if (!order) return;

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

  await notifyHebaNewOrder(order);
}

