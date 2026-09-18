import { listBookingsAwaitingReminder, markReminderSent } from "@/lib/db/bookings";
import { canFulfill } from "@/lib/orders/fulfillment";
import { isEmailConfigured, sendEmail } from "@/lib/resend/client";
import { bookingReminderHtml, bookingReminderSubject } from "@/lib/resend/emails/bookingReminderEmail";
import { addDaysToDate, israelDateTimeToUtc, israelTodayISO } from "@/lib/sessions/time";

/**
 * تذكير اليوم السابق — البريد الوحيد الذي يحمل رابط اللقاء (زوم) أو المكان.
 *
 * لا يُكشفان فور الدفع عمدًا: الجلسة قد تتحرّك، والرابط ثابت لكل الجلسات. يُستدعى من
 * `/api/cron/reminders` (Vercel Cron يوميًا في الصباح)، فيصل التذكير في صباح اليوم السابق،
 * ومن سجّلت في يوم الجلسة نفسه يصلها في التشغيل التالي ما دامت الجلسة لم تبدأ.
 * الحجز الذي يتحرّك موعده تُعاد علامته فيصله تذكير جديد (lib/db/sessions.ts).
 */
export async function sendDueReminders(now = new Date()): Promise<{ sent: number; skipped: number }> {
  const today = israelTodayISO();
  const tomorrow = addDaysToDate(today, 1);
  const due = await listBookingsAwaitingReminder(today, tomorrow);

  let sent = 0;
  let skipped = 0;
  for (const b of due) {
    // فات موعدها — لا تذكير متأخرًا، وتُعلَّم كي لا تُفحص كل مرة
    if (israelDateTimeToUtc(b.date, b.start_time).getTime() <= now.getTime()) {
      await markReminderSent(b.id);
      skipped++;
      continue;
    }
    // لم تدفع بعد — لا تُعلَّم: إن دفعت قبل الموعد وصلها التذكير في التشغيل التالي
    if (!canFulfill(b.payment_status, b.amount, b.status === "cancelled") || !isEmailConfigured()) {
      skipped++;
      continue;
    }
    try {
      await sendEmail({ to: b.customer_email, subject: bookingReminderSubject(b), html: bookingReminderHtml(b) });
      await markReminderSent(b.id);
      sent++;
    } catch (err) {
      console.error("[reminders] فشل تذكير", b.booking_number, err);
      skipped++;
    }
  }
  return { sent, skipped };
}
