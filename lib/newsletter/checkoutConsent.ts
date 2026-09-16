import { getOrderById } from "@/lib/db/orders";
import { subscribeNewsletter } from "@/lib/db/newsletter";
import { syncNewsletterSubscriber } from "@/lib/resend/newsletter";

/** مصدر الاشتراك في جدول newsletter_subscribers لمن وافقت عند الدفع */
const CHECKOUT_SOURCE = "checkout";

/**
 * مشترية أشّرت «أوافق على إرسال مواد دعائية» ← قائمة النشرة: Supabase ثم Resend،
 * كمشتركة نموذج الفوتر تمامًا.
 *
 * يُستدعى عند تأكيد الطلب فقط — بعد نجاح الدفع، أو عند الإنشاء حين لا دفع إلكتروني —
 * فلا تدخل القائمة من تركت الدفع أو رُفضت بطاقتها. best-effort، لا يرمي.
 */
export async function subscribeConsentingBuyer(orderId: string): Promise<void> {
  try {
    const order = await getOrderById(orderId);
    if (!order?.has_marketing_consent) return;

    const result = await subscribeNewsletter(order.customer_email, CHECKOUT_SOURCE);
    if (!result.ok) {
      console.error("[newsletter] تعذّر إضافة مشترية للنشرة:", order.order_number, result.error);
      return;
    }
    await syncNewsletterSubscriber(result.email);
  } catch (e) {
    console.error("[newsletter] استثناء في إضافة مشترية للنشرة:", e);
  }
}
