import type { Metadata } from "next";
import { cache } from "react";
import Link from "next/link";
import Container from "@/components/ui/Container";
import PageHeaderWave from "@/components/ui/PageHeaderWave";
import EmbeddedPayment from "@/components/checkout/EmbeddedPayment";
import CheckoutSteps, { BOOKING_STEP_LABELS } from "@/components/checkout/CheckoutSteps";
import TrustBadges from "@/components/checkout/TrustBadges";
import BookingHeader from "@/components/booking/BookingHeader";
import BookingDetailsCard from "@/components/booking/BookingDetailsCard";
import BookingSummary from "@/components/booking/BookingSummary";
import { getBookingById } from "@/lib/db/bookings";
import { isHypConfigured } from "@/lib/hyp/client";

/** تُدَوزن عبر cache كي لا تُستعلم مرتين (metadata + الصفحة) في الطلب الواحد */
const getBooking = cache(getBookingById);

/** العنوان يتبع المرحلة — «الدفع الآمن» أثناء الدفع لا «تأكيد التسجيل» */
export async function generateMetadata({ params }: BookingPageProps): Promise<Metadata> {
  const { id } = await params;
  const booking = await getBooking(id);
  const awaiting =
    booking != null &&
    booking.payment_status !== "paid" &&
    booking.amount > 0 &&
    isHypConfigured() &&
    booking.status !== "cancelled";

  return {
    title: `${awaiting ? "الدفع الآمن" : "تأكيد التسجيل"} | Momzy`,
    description: "تفاصيل تسجيلكِ في الورشة",
    robots: { index: false, follow: false },
  };
}

/** نصوص الترويسة حسب المرحلة — تطابق تجربة /checkout في المتجر */
const HEADER_COPY = {
  awaiting: {
    crumb: "الدفع الآمن",
    title: "الدفع الآمن",
    subtitle: "أدخلي بيانات بطاقتك بأمان لتثبيت مقعدكِ",
  },
  confirmed: {
    crumb: "تأكيد التسجيل",
    title: "تأكيد التسجيل",
    subtitle: "تسجيلكِ مثبّت — نراكِ في الورشة!",
  },
  cancelled: {
    crumb: "التسجيل ملغى",
    title: "التسجيل ملغى",
    subtitle: "تواصلي معنا لو رغبتِ بالتسجيل مجددًا",
  },
} as const;

interface BookingPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ payment?: string }>;
}

/**
 * صفحة تأكيد التسجيل — تُقرأ بالـ UUID (غير قابل للتخمين).
 * الورشة المدفوعة غير المدفوعة بعد ⇒ تعرض بطاقة الدفع المدمجة، ولا تكشف
 * رابط اللقاء/المكان إلا بعد تثبيت التسجيل.
 */
export default async function BookingPage({ params, searchParams }: BookingPageProps) {
  const { id } = await params;
  const { payment } = await searchParams;
  const booking = await getBooking(id);

  if (!booking) return <BookingNotFound />;

  const isPaid = booking.payment_status === "paid";
  const isCancelled = booking.status === "cancelled";
  // بانتظار الدفع: ورشة مدفوعة + غير مدفوعة + HYP مفعّل + غير ملغاة
  const awaitingPayment = !isPaid && booking.amount > 0 && isHypConfigured() && !isCancelled;
  const paymentFailed = payment === "failed";
  const state = isCancelled ? "cancelled" : awaitingPayment ? "awaiting" : "confirmed";
  const isAwaiting = state === "awaiting";
  const copy = HEADER_COPY[state];

  return (
    <div style={{ background: "var(--offwh)", minHeight: "100vh", paddingBottom: 80 }}>
      {/* ── شريط العنوان ── */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #FFF5F7 0%, #FEF0F5 50%, #EFF8F8 100%)",
          paddingTop: 56,
          paddingBottom: 80,
        }}
      >
        <Container>
          <nav className="font-label text-[13px] text-light flex items-center gap-1.5 mb-4">
            <Link href="/" className="hover:text-teal transition-colors">الرئيسية</Link>
            <span>›</span>
            <Link href="/services" className="hover:text-teal transition-colors">الخدمات</Link>
            <span>›</span>
            <span className="text-mid">{copy.crumb}</span>
          </nav>
          <h1 className="font-heading font-bold text-h1 mb-2" style={{ color: "var(--dark)" }}>
            {copy.title}
          </h1>
          <p className="font-body text-[15px]" style={{ color: "var(--mid)", fontFamily: "'Tajawal', sans-serif" }}>
            {copy.subtitle}
          </p>
        </Container>
        <PageHeaderWave fillColor="var(--offwh)" />
      </div>

      {/* ── شريط التقدّم — نفس شريط المتجر بمفردات التسجيل ── */}
      {!isCancelled && (
        <Container>
          <div className="mt-8">
            <CheckoutSteps current={isAwaiting ? 2 : 3} labels={BOOKING_STEP_LABELS} />
          </div>
        </Container>
      )}

      <Container>
        {isAwaiting ? (
          /* ── مرحلة الدفع — تخطيط /checkout نفسه: الدفع + ملخّص جانبي ملتصق ── */
          <div className="mt-8 grid gap-8 grid-cols-1 md:[grid-template-columns:1fr_380px]">
            {/* الملخّص + الثقة — أول على الموبايل، العمود الأيسر على الديسكتوب */}
            <div className="md:order-2 md:sticky md:top-24 md:self-start">
              <BookingSummary booking={booking} />
              <div className="mt-5">
                <TrustBadges />
              </div>
            </div>

            {/* الدفع المدمج */}
            <div className="md:order-1">
              {paymentFailed && (
                <div
                  className="rounded-[16px] text-center mb-5 max-w-[680px] mx-auto"
                  style={{ background: "#FEF5F7", border: "1.5px solid var(--roselt)", padding: "14px 20px" }}
                >
                  <span className="font-label text-[13.5px]" style={{ color: "var(--rose)" }}>
                    لم تكتمل عملية الدفع — مقعدكِ ما زال محجوزًا، ويمكنكِ المحاولة مجددًا بالأسفل.
                  </span>
                </div>
              )}
              <EmbeddedPayment
                kind="booking"
                id={booking.id}
                reference={booking.booking_number}
                total={booking.amount}
              />
            </div>
          </div>
        ) : (
          /* ── التأكيد (أو الإلغاء) — إيصال بعمود واحد كصفحة /order ── */
          <div className="mt-8 max-w-[860px] mx-auto flex flex-col gap-6">
            <BookingHeader
              bookingNumber={booking.booking_number}
              createdAt={booking.created_at}
              state={state}
            />
            <BookingDetailsCard booking={booking} revealSession={state === "confirmed"} />

            <div className="flex flex-wrap justify-center gap-3 mt-2">
              <Link
                href="/services"
                className="font-label font-bold text-[14px] text-dark"
                style={{ background: "var(--yellow)", borderRadius: 50, padding: "13px 30px" }}
              >
                خدمات أخرى
              </Link>
              <Link
                href="/contact"
                className="font-label font-bold text-[14px] text-mid"
                style={{ background: "white", border: "1.5px solid var(--bord)", borderRadius: 50, padding: "13px 30px" }}
              >
                تواصلي معنا
              </Link>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}

/** واجهة "التسجيل غير موجود" */
function BookingNotFound() {
  return (
    <div style={{ background: "var(--offwh)", minHeight: "100vh", paddingTop: 80, paddingBottom: 80 }}>
      <Container>
        <div
          className="text-center mx-auto rounded-[22px]"
          style={{
            background: "white",
            border: "1.5px solid var(--bord)",
            padding: "60px 32px",
            maxWidth: 520,
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
          <h1 className="font-heading font-bold text-dark text-[24px] mb-3">التسجيل غير موجود</h1>
          <p className="font-label text-[14px] text-mid leading-[1.8] mb-6">
            لم نعثر على هذا التسجيل — ربما الرابط غير صحيح.
          </p>
          <Link
            href="/services"
            className="inline-block font-label font-bold text-[14px] text-dark"
            style={{ background: "var(--yellow)", border: "none", borderRadius: 50, padding: "13px 32px" }}
          >
            تصفّحي الخدمات
          </Link>
        </div>
      </Container>
    </div>
  );
}
