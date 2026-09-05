import { getBookingById } from "@/lib/db/bookings";
import { isEmailConfigured, sendEmail } from "@/lib/resend/client";
import { getNotifyEmail } from "./recipients";
import {
  bookingCustomerEmailHtml,
  bookingCustomerSubject,
  bookingAdminEmailHtml,
  bookingAdminSubject,
} from "@/lib/resend/emails/bookingEmail";
import { notifyHebaNewBooking } from "@/lib/whatsapp/notify";

/**
 * إشعارات تأكيد الحجز — إيميل لهبة + إيميل للعميلة (يحوي رابط اللقاء/المكان)
 * + إشعار واتساب لهبة.
 *
 * تُستدعى في حالتين:
 *  - حجز مجاني: فور إنشائه (`POST /api/bookings`).
 *  - حجز مدفوع: **بعد نجاح الدفع فقط** (`/api/hyp/callback`) — كي لا نؤكّد قبل الدفع.
 *
 * best-effort: تُنفَّذ بعد الرد ولا ترمي.
 */
export async function sendBookingNotifications(bookingId: string): Promise<void> {
  const full = await getBookingById(bookingId);
  if (!full) return;

  if (isEmailConfigured()) {
    await sendEmail({
      to: await getNotifyEmail("bookings"),
      replyTo: full.customer_email,
      subject: bookingAdminSubject(full),
      html: bookingAdminEmailHtml(full),
    });
    await sendEmail({
      to: full.customer_email,
      subject: bookingCustomerSubject(full),
      html: bookingCustomerEmailHtml(full),
    });
  }

  await notifyHebaNewBooking(full);
}
