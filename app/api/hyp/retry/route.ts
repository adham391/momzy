import { NextResponse } from "next/server";
import { getOrderById } from "@/lib/db/orders";
import { getBookingById, updateBookingStatus } from "@/lib/db/bookings";
import { ensureSeatForPayment } from "@/lib/bookings/seatHold";
import { isHypConfigured, createHypPaymentUrl } from "@/lib/hyp/client";
import { breakoutResponse } from "@/lib/hyp/breakout";

/**
 * GET /api/hyp/retry?order={uuid}  أو  ?booking={uuid}
 * يولّد رابط دفع HYP موقّعًا ويحوّل إليه — مصدر الـ iframe في صفحة الدفع المدمجة،
 * ويُستخدم أيضًا لإعادة الدفع حين لا يكتمل.
 * يقرأ بالـ UUID (غير قابل للتخمين). (‏/api مستثنى من middleware — عام.)
 *
 * صفحة HYP وحدها تبقى داخل الإطار؛ أي وجهة أخرى (مدفوع، تعذّر فتح الدفع، غير موجود)
 * تخرج إلى الصفحة الكاملة — وإلا ظهر الموقع كله داخل بطاقة الدفع.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const bookingId = searchParams.get("booking");
  const orderId = searchParams.get("order");

  // لغة الموقع تصل كبارامتر لأن ‏/api خارج شجرة اللغات
  const locale = searchParams.get("locale") ?? undefined;

  if (bookingId) return payBooking(bookingId, origin, locale);
  if (orderId) return payOrder(orderId, origin, locale);
  return leaveFrame("/", origin);
}

/** وجهة داخل الموقع — في الصفحة الكاملة لا داخل إطار الدفع */
function leaveFrame(path: string, origin: string): Response {
  return breakoutResponse(new URL(path, origin).toString());
}

/** دفع طلب متجر */
async function payOrder(id: string, origin: string, locale?: string) {
  const order = await getOrderById(id);
  if (!order) return leaveFrame("/", origin);

  // مدفوع مسبقًا أو HYP غير مضبوط → صفحة التأكيد
  if (order.payment_status === "paid" || !isHypConfigured()) {
    return leaveFrame(`/order/${id}`, origin);
  }

  const paymentUrl = await createHypPaymentUrl({
    orderId: order.id,
    orderNumber: order.order_number,
    // المبلغ المحفوظ بعملة الطلب — لا يُعاد تحويله بسعر اليوم
    amount: order.charged_amount ?? order.total_amount,
    currency: order.currency,
    customerName: order.customer_name,
    email: order.customer_email,
    phone: order.customer_phone,
    // تعبئة العنوان مسبقًا في صفحة HYP
    locale,
    street: order.customer_address,
    city: order.customer_city,
    zip: order.customer_postal_code ?? undefined,
  });

  return paymentUrl ? NextResponse.redirect(paymentUrl) : leaveFrame(`/order/${id}?payment=failed`, origin);
}

/** دفع تسجيل ورشة/خدمة */
async function payBooking(id: string, origin: string, locale?: string) {
  const booking = await getBookingById(id);
  if (!booking) return leaveFrame("/", origin);

  // مدفوع، أو مجاني، أو HYP غير مضبوط → صفحة تأكيد التسجيل
  if (booking.payment_status === "paid" || booking.amount <= 0 || !isHypConfigured()) {
    return leaveFrame(`/booking/${id}`, origin);
  }

  // المقعد: يُمدَّد حجزه المؤقت، أو يُؤخذ من جديد إن تحرّر — ولا دفع لجلسة اكتملت في الأثناء
  if ((await ensureSeatForPayment(booking.id)) === "taken") {
    await updateBookingStatus(booking.id, "cancelled", "انتهى حجز المقعد المؤقت واكتمل العدد قبل الدفع", null);
    return leaveFrame(`/booking/${id}?seat=taken`, origin);
  }

  const paymentUrl = await createHypPaymentUrl({
    orderId: booking.id,
    orderNumber: booking.booking_number, // BK-… — يميّزه الـ callback
    amount: booking.charged_amount ?? booking.amount,
    currency: booking.currency,
    customerName: booking.customer_name,
    email: booking.customer_email,
    phone: booking.customer_phone,
    locale,
  });

  return paymentUrl ? NextResponse.redirect(paymentUrl) : leaveFrame(`/booking/${id}?payment=failed`, origin);
}
