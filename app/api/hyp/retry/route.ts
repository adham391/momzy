import { NextResponse } from "next/server";
import { getOrderById } from "@/lib/db/orders";
import { getBookingById } from "@/lib/db/bookings";
import { isHypConfigured, createHypPaymentUrl } from "@/lib/hyp/client";

/**
 * GET /api/hyp/retry?order={uuid}  أو  ?booking={uuid}
 * يولّد رابط دفع HYP موقّعًا ويحوّل إليه — مصدر الـ iframe في صفحة الدفع المدمجة،
 * ويُستخدم أيضًا لإعادة الدفع حين لا يكتمل.
 * يقرأ بالـ UUID (غير قابل للتخمين). (‏/api مستثنى من middleware — عام.)
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const bookingId = searchParams.get("booking");
  const orderId = searchParams.get("order");

  // لغة الموقع تصل كبارامتر لأن ‏/api خارج شجرة اللغات
  const locale = searchParams.get("locale") ?? undefined;

  if (bookingId) return payBooking(bookingId, origin, locale);
  if (orderId) return payOrder(orderId, origin, locale);
  return NextResponse.redirect(new URL("/", origin));
}

/** دفع طلب متجر */
async function payOrder(id: string, origin: string, locale?: string) {
  const order = await getOrderById(id);
  if (!order) return NextResponse.redirect(new URL("/", origin));

  // مدفوع مسبقًا أو HYP غير مضبوط → صفحة التأكيد
  if (order.payment_status === "paid" || !isHypConfigured()) {
    return NextResponse.redirect(new URL(`/order/${id}`, origin));
  }

  const paymentUrl = await createHypPaymentUrl({
    orderId: order.id,
    orderNumber: order.order_number,
    amount: order.total_amount,
    customerName: order.customer_name,
    email: order.customer_email,
    phone: order.customer_phone,
    // تعبئة العنوان مسبقًا في صفحة HYP
    locale,
    street: order.customer_address,
    city: order.customer_city,
    zip: order.customer_postal_code ?? undefined,
  });

  return NextResponse.redirect(new URL(paymentUrl ?? `/order/${id}?payment=failed`, origin));
}

/** دفع تسجيل ورشة/خدمة */
async function payBooking(id: string, origin: string, locale?: string) {
  const booking = await getBookingById(id);
  if (!booking) return NextResponse.redirect(new URL("/", origin));

  // مدفوع، أو مجاني، أو HYP غير مضبوط → صفحة تأكيد التسجيل
  if (booking.payment_status === "paid" || booking.amount <= 0 || !isHypConfigured()) {
    return NextResponse.redirect(new URL(`/booking/${id}`, origin));
  }

  const paymentUrl = await createHypPaymentUrl({
    orderId: booking.id,
    orderNumber: booking.booking_number, // BK-… — يميّزه الـ callback
    amount: booking.amount,
    customerName: booking.customer_name,
    email: booking.customer_email,
    phone: booking.customer_phone,
    locale,
  });

  return NextResponse.redirect(new URL(paymentUrl ?? `/booking/${id}?payment=failed`, origin));
}
