import { NextResponse, after } from "next/server";
import { createBooking } from "@/lib/db/bookings";
import { sendBookingNotifications } from "@/lib/notifications/booking";
import { isHypConfigured, createHypPaymentUrl } from "@/lib/hyp/client";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * POST /api/bookings — تسجيل في ورشة/خدمة.
 * body: { slotId, customer: { name, email, phone }, notes?, topic? }
 * يعيد 409 لو امتلأ الموعد (السعة تُحجز ذرّياً).
 *
 * الورشة المدفوعة: يُنشأ الحجز ويُحجز المقعد، ويُعاد `paymentUrl` لإتمام الدفع.
 * التأكيد (إيميل/واتساب) يُرسل **بعد نجاح الدفع** فقط — أما المجانية فتُؤكَّد فورًا.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
  }

  const b = body as {
    slotId?: string;
    customer?: { name?: string; email?: string; phone?: string };
    notes?: string;
    /** موضوع اللقاء — إلزامي للخدمات التي تسأل عنه (يُتحقَّق منه في createBooking) */
    topic?: string;
    babyBirthDate?: string;
    /** لغة الموقع (ar | he | en) — تحدّد لغة صفحة دفع HYP */
    locale?: string;
  };
  const c = b.customer;

  if (!b.slotId) return NextResponse.json({ error: "اختاري موعداً" }, { status: 400 });
  if (!c || typeof c.name !== "string" || c.name.trim().length < 2)
    return NextResponse.json({ error: "الاسم مطلوب" }, { status: 400 });
  if (typeof c.email !== "string" || !isValidEmail(c.email.trim()))
    return NextResponse.json({ error: "بريد إلكتروني غير صحيح" }, { status: 400 });
  if (typeof c.phone !== "string" || c.phone.trim().length < 8)
    return NextResponse.json({ error: "رقم هاتف غير صحيح" }, { status: 400 });

  const result = await createBooking({
    slotId: b.slotId,
    customer: { name: c.name.trim(), email: c.email.trim(), phone: c.phone.trim() },
    notes: typeof b.notes === "string" ? b.notes : "",
    topic: typeof b.topic === "string" ? b.topic : null,
    babyBirthDate: typeof b.babyBirthDate === "string" ? b.babyBirthDate : null,
    // لغة الصفحة — تُحفظ لتحديد لغة إيميل التأكيد
    locale: typeof b.locale === "string" ? b.locale : undefined,
  });

  // 400 = بيانات مرفوضة (فئة عمرية، موضوع اللقاء) · 409 = امتلأ الموعد
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status ?? 409 });
  }

  // ورشة مدفوعة + مفاتيح HYP موجودة → رابط الدفع (المقعد محجوز بانتظار الدفع)
  const needsOnlinePayment = result.amount > 0 && isHypConfigured();
  let paymentUrl: string | null = null;
  if (needsOnlinePayment) {
    paymentUrl = await createHypPaymentUrl({
      orderId: result.id,
      orderNumber: result.bookingNumber, // BK-… — يميّزه الـ callback عن طلبات المتجر
      amount: result.amount,
      customerName: c.name.trim(),
      email: c.email.trim(),
      phone: c.phone.trim(),
      locale: typeof b.locale === "string" ? b.locale : undefined,
    });
  }

  // بلا دفع إلكتروني (مجانية أو HYP غير مضبوط) → أكّدي فورًا. مع دفع → بعد نجاحه في
  // /api/hyp/callback فقط — وفشلُ إنشاء رابط الدفع لا يؤكّد، فلا يُكشف رابط اللقاء بلا دفع
  if (!needsOnlinePayment) {
    after(() => sendBookingNotifications(result.id));
  }

  return NextResponse.json({ ...result, paymentUrl }, { status: 201 });
}
