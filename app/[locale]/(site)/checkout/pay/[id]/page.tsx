import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "@/lib/i18n/navigation";
import Container from "@/components/ui/Container";
import PageHeaderWave from "@/components/ui/PageHeaderWave";
import CheckoutSteps from "@/components/checkout/CheckoutSteps";
import EmbeddedPayment from "@/components/checkout/EmbeddedPayment";
import { getOrderById } from "@/lib/db/orders";
import { isHypConfigured } from "@/lib/hyp/client";

interface PayPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export async function generateMetadata({ params }: PayPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "checkout" });
  return {
    title: t("payMetaTitle"),
    robots: { index: false, follow: false },
  };
}

/**
 * صفحة الدفع المدمجة (استرداد) — تُستضاف iframe صفحة دفع HYP داخل الموقع.
 * يصلها العميل من زر «إتمام الدفع» في صفحة التأكيد حين لم يكتمل الدفع.
 * حراسات: طلب غير موجود → الرئيسية · مدفوع أو HYP غير مفعّل → صفحة التأكيد.
 */
export default async function PayPage({ params }: PayPageProps) {
  const { id, locale } = await params;
  const t = await getTranslations("checkout");
  const order = await getOrderById(id);

  if (!order) return redirect({ href: "/", locale });
  if (order.payment_status === "paid" || !isHypConfigured()) return redirect({ href: `/order/${id}`, locale });

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
          <h1 className="font-heading font-bold text-h1 mb-2" style={{ color: "var(--dark)" }}>
            {t("securePayment")}
          </h1>
          <p className="font-body text-[15px]" style={{ color: "var(--mid)", fontFamily: "'Tajawal', sans-serif" }}>
            {t("paySubtitle")}
          </p>
        </Container>
        <PageHeaderWave fillColor="var(--offwh)" />
      </div>

      {/* ── شريط التقدّم ── */}
      <Container>
        <div className="mt-8">
          <CheckoutSteps current={2} />
        </div>
      </Container>

      {/* ── الدفع المدمج ── */}
      <Container>
        <div className="mt-8">
          <EmbeddedPayment id={order.id} reference={order.order_number} total={order.total_amount} />
        </div>
      </Container>
    </div>
  );
}
