import { after } from "next/server";
import { verifyHypPayment } from "@/lib/hyp/client";
import { markOrderPaid, getOrderIdByNumber } from "@/lib/db/orders";
import { markBookingPaid, getBookingIdByNumber } from "@/lib/db/bookings";
import { sendBookingNotifications } from "@/lib/notifications/booking";
import { sendDigitalDelivery } from "@/lib/notifications/digital";

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

  if (isBooking) {
    if (result.valid) {
      const bookingId = await markBookingPaid(result.orderNumber, result.transactionId);
      // التأكيد (إيميل + واتساب) يُرسل الآن — بعد نجاح الدفع لا قبله
      if (bookingId) after(() => sendBookingNotifications(bookingId));
      dest = bookingId ? `/booking/${bookingId}` : "/services";
    } else {
      const bookingId = await getBookingIdByNumber(result.orderNumber);
      dest = bookingId ? `/booking/${bookingId}?payment=failed` : "/services";
    }
  } else {
    if (result.valid) {
      const orderId = await markOrderPaid(result.orderNumber, result.transactionId);
      // التسليم الرقمي + دعوة المكتبة — بعد نجاح الدفع لا قبله
      if (orderId) {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || origin;
        after(() => sendDigitalDelivery(orderId, siteUrl));
      }
      dest = orderId ? `/order/${orderId}` : "/";
    } else {
      const orderId = await getOrderIdByNumber(result.orderNumber);
      dest = orderId ? `/order/${orderId}?payment=failed` : "/checkout?payment=failed";
    }
  }

  return breakoutResponse(new URL(dest, origin).toString());
}

/** صفحة HTML تنقل النافذة الأعلى (تخرج من الـ iframe) إلى الوجهة */
function breakoutResponse(dest: string): Response {
  const j = JSON.stringify(dest); // تهريب آمن للحقن داخل السكربت
  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8" />
<title>جارٍ إتمام العملية…</title>
<style>body{font-family:'Tajawal',Arial,sans-serif;background:#FDFAF5;color:#55504C;text-align:center;padding:56px 20px;margin:0}</style>
</head><body>
<p style="font-size:15px">جارٍ إتمام العملية…</p>
<script>(function(){var d=${j};try{(window.top||window).location.replace(d);}catch(e){window.location.replace(d);}})();</script>
<noscript><a href=${j}>اضغطي هنا للمتابعة</a></noscript>
</body></html>`;
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
}
