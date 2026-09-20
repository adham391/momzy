import { after } from "next/server";
import { verifyHypPayment } from "@/lib/hyp/client";
import { breakoutResponse } from "@/lib/hyp/breakout";
import { markOrderPaid, getOrderIdByNumber, deductOrderStock } from "@/lib/db/orders";
import { markBookingPaid, getBookingIdByNumber } from "@/lib/db/bookings";
import { sendBookingNotifications } from "@/lib/notifications/booking";
import { sendDigitalDelivery } from "@/lib/notifications/digital";
import { sendOrderConfirmation } from "@/lib/notifications/order";
import { subscribeConsentingBuyer } from "@/lib/newsletter/checkoutConsent";
import { logPaymentAttempt } from "@/lib/db/paymentLogs";

/**
 * GET /api/hyp/callback — عنوان العودة من صفحة دفع HYP.
 * اضبطيه في بوابة HYP: Settings → Payment Page and API → Post-transaction address.
 * يتحقق من التوقيع (VERIFY) ثم يُعلّم **الطلب أو الحجز** مدفوعًا حسب بادئة الرقم:
 *   `MZ-` = طلب متجر · `BK-` = تسجيل ورشة/خدمة.
 *
 * نحلّ الـ UUID من رقم الطلب/الحجز (`Order`) لا من `Fild1` — لأن HYP يستبدل Fild1
 * ببيانات العميل في ردّه.
 *
 * لأن الدفع يجري داخل iframe مدمج، نُعيد صفحة HTML تُخرِج التصفّح إلى النافذة
 * الأعلى (window.top). تعمل أيضًا للتحويل الكامل لأن top === self عندها.
 * (‏/api مستثنى من middleware — عام لأن HYP يستدعيه.)
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const result = await verifyHypPayment(searchParams);
  const isBooking = result.orderNumber.startsWith("BK-");

  let dest: string;

  // المعرّف يُحلّ في الحالتين — نحتاجه للتوجيه وللسجلّ معًا
  let entityId: string | null = null;

  if (isBooking) {
    if (result.valid) {
      const paid = await markBookingPaid(result.orderNumber, result.transactionId);
      entityId = paid?.id ?? null;
      // التأكيد (إيميل + واتساب) بعد نجاح الدفع لا قبله — ومرة واحدة: إعادة فتح العنوان لا تكرّره
      if (paid?.firstPayment) {
        const bookingId = paid.id;
        after(() => sendBookingNotifications(bookingId));
      }
      dest = entityId ? `/booking/${entityId}` : "/services";
    } else {
      entityId = await getBookingIdByNumber(result.orderNumber);
      dest = entityId ? `/booking/${entityId}?payment=failed` : "/services";
    }
  } else {
    if (result.valid) {
      const paid = await markOrderPaid(result.orderNumber, result.transactionId);
      entityId = paid?.id ?? null;
      // خصم المخزون والتأكيد وإشعار هبة والتسليم الرقمي والنشرة — بعد نجاح الدفع، ومرة واحدة
      if (paid?.firstPayment) {
        const orderId = paid.id;
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || origin;
        after(async () => {
          await deductOrderStock(orderId);
          await sendOrderConfirmation(orderId);
          await sendDigitalDelivery(orderId, siteUrl);
          await subscribeConsentingBuyer(orderId);
        });
      }
      dest = entityId ? `/order/${entityId}` : "/";
    } else {
      entityId = await getOrderIdByNumber(result.orderNumber);
      dest = entityId ? `/order/${entityId}?payment=failed` : "/checkout?payment=failed";
    }
  }

  // سجلّ المحاولة — بعد الرد كي لا يؤخّر العميلة، وبلا أي أثر على التوجيه
  after(() =>
    logPaymentAttempt({
      reference: result.orderNumber,
      kind: isBooking ? "booking" : "order",
      entityId,
      outcome: result.valid ? "paid" : "failed",
      ccode: result.ccode,
      transactionId: result.transactionId,
      params: searchParams,
    })
  );

  return breakoutResponse(new URL(dest, origin).toString());
}
