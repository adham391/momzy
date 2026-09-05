import { createAdminClient } from "@/lib/supabase/admin";
import { getOrderById } from "@/lib/db/orders";
import { isEmailConfigured, sendEmail } from "@/lib/resend/client";
import { orderPendingEmailHtml, orderPendingSubject } from "@/lib/resend/emails/orderEmail";

/**
 * استرداد الطلبات غير المدفوعة.
 *
 * لا نرسل التذكير لحظة إنشاء الطلب: من تدفع بنجاح خلال دقيقة كانت ستتلقّى
 * «لم تدفعي بعد» ثم «تأكيد الطلب» — ضجيج في المسار الغالب. فنؤجّله، ولا
 * يُرسَل إلا لمن بقي طلبها معلّقًا بعد المهلة.
 *
 * التشغيل: **مسح عابر** يُستدعى بعد إنشاء أي طلب (خطة Vercel الحالية تحدّ
 * المهام المجدولة بمرّة يوميًا، وهي أبطأ من أن تنفع هنا). عيبه أنّه يتوقّف
 * إن توقّفت الطلبات تمامًا — وحينها لا مبيعات تُفقد أصلًا.
 */

/** المهلة قبل اعتبار الطلب متروكًا */
const RECOVERY_DELAY_MINUTES = 30;

/** لا نطارد طلبًا قديمًا: بعد يومين لم تعد الرسالة مفيدة */
const RECOVERY_MAX_AGE_HOURS = 48;

/** سقف الرسائل في المسحة الواحدة — يمنع دفقة مفاجئة */
const MAX_PER_SWEEP = 20;

/**
 * يمسح الطلبات المعلّقة الناضجة ويرسل تذكيرًا واحدًا لكل منها.
 *
 * الختم (`recovery_email_sent_at`) يُوضع **قبل** الإرسال وبشرط أنّه ما زال
 * فارغًا — فمسحتان متزامنتان لا ترسلان مرتين. وإن فشل الإرسال بعدها لا
 * نعيد المحاولة: رسالة ضائعة أهون من رسالتين للعميلة نفسها.
 */
export async function sweepAbandonedOrders(siteUrl: string): Promise<number> {
  if (!isEmailConfigured()) return 0;

  const supabase = createAdminClient();
  const now = Date.now();
  const ripenedBefore = new Date(now - RECOVERY_DELAY_MINUTES * 60_000).toISOString();
  const notOlderThan = new Date(now - RECOVERY_MAX_AGE_HOURS * 3_600_000).toISOString();

  const { data, error } = await supabase
    .from("orders")
    .select("id")
    .eq("payment_status", "pending")
    .is("recovery_email_sent_at", null)
    .lt("created_at", ripenedBefore)
    .gt("created_at", notOlderThan)
    .limit(MAX_PER_SWEEP);

  if (error || !data?.length) return 0;

  let sent = 0;
  for (const row of data as { id: string }[]) {
    // الحجز الذرّي للرسالة: من يفز بالتحديث يرسل، ومن يخسر يتخطّى
    const { data: claimed } = await supabase
      .from("orders")
      .update({ recovery_email_sent_at: new Date().toISOString() })
      .eq("id", row.id)
      .is("recovery_email_sent_at", null)
      .select("id")
      .maybeSingle();
    if (!claimed) continue;

    try {
      const order = await getOrderById(row.id);
      // قد تكون دُفعت بين الاستعلام والحجز — لا تذكير عندها
      if (!order || order.payment_status !== "pending") continue;

      await sendEmail({
        to: order.customer_email,
        subject: orderPendingSubject(order),
        html: orderPendingEmailHtml(order, `${siteUrl}/order/${order.id}`),
      });
      sent++;
    } catch (err) {
      console.error("[recovery] تعذّر إرسال تذكير الطلب:", row.id, err);
    }
  }

  return sent;
}
