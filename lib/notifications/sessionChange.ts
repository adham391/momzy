import type { SlotRow } from "@/lib/db/bookings";
import type { SessionBooking, SessionChange } from "@/lib/db/sessions";
import { canFulfill } from "@/lib/orders/fulfillment";
import { isEmailConfigured, sendEmail } from "@/lib/resend/client";
import {
  sessionCancelledHtml,
  sessionCancelledSubject,
  sessionRescheduledHtml,
  sessionRescheduledSubject,
} from "@/lib/resend/emails/sessionChangeEmail";

/**
 * إبلاغ المسجِّلات حين تغيّر هبة موعد جلسة أو تلغيها — بريد لكل أم بلغتها.
 *
 * تُبلَّغ من حجزها مؤكَّد فعلًا (مدفوع أو مجاني، غير ملغى) — من تركت الدفع لا تنتظر
 * الجلسة أصلًا. best-effort: فشل بريد واحد لا يوقف الباقي، ويُعاد عدد من وصلهنّ.
 */

/** المسجِّلات اللواتي يهمّهن التغيير */
function confirmed(bookings: SessionBooking[]): SessionBooking[] {
  return bookings.filter((b) => canFulfill(b.payment_status, b.amount, b.status === "cancelled"));
}

async function sendEach(
  bookings: SessionBooking[],
  build: (b: SessionBooking) => { subject: string; html: string }
): Promise<number> {
  if (!isEmailConfigured()) return 0;
  let sent = 0;
  for (const b of bookings) {
    try {
      const { subject, html } = build(b);
      await sendEmail({ to: b.customer_email, subject, html });
      sent++;
    } catch (err) {
      console.error("[sessionChange] فشل إرسال البريد إلى", b.booking_number, err);
    }
  }
  return sent;
}

/** تغيّر موعد جلسة — يعيد عدد الأمهات اللواتي وصلهنّ البريد */
export async function notifySessionRescheduled(change: SessionChange): Promise<number> {
  if (!change.timeChanged) return 0;
  return sendEach(confirmed(change.bookings), (b) => ({
    subject: sessionRescheduledSubject(b),
    html: sessionRescheduledHtml(b, change.before, change.after),
  }));
}

/** أُلغيت جلسة — يعيد عدد الأمهات اللواتي وصلهنّ البريد */
export async function notifySessionCancelled(slot: SlotRow, bookings: SessionBooking[]): Promise<number> {
  // الحجوزات أُلغيت للتوّ في القاعدة، فنحكم على الدفع لا على الحالة
  const relevant = bookings.filter((b) => canFulfill(b.payment_status, b.amount, false));
  return sendEach(relevant, (b) => ({
    subject: sessionCancelledSubject(b, slot),
    html: sessionCancelledHtml(b, slot),
  }));
}
