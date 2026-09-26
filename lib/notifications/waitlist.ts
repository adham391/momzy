import { isEmailConfigured, sendEmail } from "@/lib/resend/client";
import { getNotifyEmail } from "./recipients";
import {
  waitlistAdminEmailHtml,
  waitlistAdminSubject,
  type WaitlistNotice,
} from "@/lib/resend/emails/waitlistEmail";

/**
 * إشعار هبة بمنتظِرة جديدة — إيميل واحد إليها، ولا شيء للأم.
 *
 * كانت قائمة الانتظار صامتة تمامًا: الصفّ يُحفظ ولا يعلم به أحد حتى تفتح هبة
 * اللوحة، فقد تمرّ أيام قبل أن ترى من تنتظر. يذهب إلى **صندوق الحجوزات**
 * (`notify_email_bookings`) لأن الانتظار وجهٌ آخر من التسجيل.
 *
 * best-effort: يُنفَّذ بعد الرد ولا يرمي — انضمام الأم نجح قبله.
 */
export async function sendWaitlistNotification(notice: WaitlistNotice): Promise<void> {
  if (!isEmailConfigured()) return;
  await sendEmail({
    to: await getNotifyEmail("bookings"),
    // «ردّ» يصل للمنتظِرة مباشرةً — قد تريد هبة سؤالها قبل أن يُفتح موعد
    replyTo: notice.email,
    subject: waitlistAdminSubject(notice),
    html: waitlistAdminEmailHtml(notice),
  });
}
