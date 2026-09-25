import { getBookingById } from "@/lib/db/bookings";
import { canFulfill } from "@/lib/orders/fulfillment";
import { isEmailConfigured, sendEmail } from "@/lib/resend/client";
import { getNotifyEmail } from "./recipients";
import {
  bookingCustomerEmailHtml,
  bookingCustomerSubject,
  bookingAdminEmailHtml,
  bookingAdminSubject,
} from "@/lib/resend/emails/bookingEmail";

/**
 * إشعارات تأكيد الحجز — إيميل لهبة + إيميل للعميلة (يحوي رابط اللقاء/المكان).
 * (لا واتساب: إيميل هبة يحمل تفاصيل الحجز كلّها — واتساب لجدول الصباح وحده.)
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
  // حارس أخير: التأكيد يكشف رابط اللقاء/المكان — لحجز مدفوع (أو مجاني) فقط
  if (!canFulfill(full.payment_status, full.amount, full.status === "cancelled")) {
    console.warn("[booking] تأكيد مرفوض لحجز غير مدفوع:", full.booking_number);
    return;
  }

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
}
