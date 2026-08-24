"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { useRouter } from "@/lib/i18n/navigation";
import { useCart } from "@/lib/store/cart";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import OrderSummary from "@/components/checkout/OrderSummary";
import CheckoutUpsell from "@/components/checkout/CheckoutUpsell";
import CheckoutSteps from "@/components/checkout/CheckoutSteps";
import TrustBadges from "@/components/checkout/TrustBadges";
import EmbeddedPayment from "@/components/checkout/EmbeddedPayment";
import Container from "@/components/ui/Container";
import PageHeaderWave from "@/components/ui/PageHeaderWave";
import type { ShippingConfig } from "@/lib/shipping";

type Step = "delivery" | "payment";

/**
 * حاوية إتمام الشراء — تدفّق **مرحلي على صفحة واحدة**:
 *   ① التوصيل (النموذج) ← ② الدفع (iframe مدمج) — بلا انتقال صفحات.
 * الطلب يُنشأ عند الانتقال للدفع (قياسي)، والرابط يُزامَن بـ ?order= ليصمد التحديث.
 */
export default function CheckoutClient({ shipping }: { shipping: ShippingConfig }) {
  const t    = useTranslations("checkout");
  const tNav = useTranslations("nav");
  const [hydrated, setHydrated] = useState(false);
  const [step, setStep]         = useState<Step>("delivery");
  const [orderId, setOrderId]   = useState<string | null>(null);

  const items  = useCart((s) => s.items);
  const router = useRouter();

  /* hydration + استعادة مرحلة الدفع من الرابط عند التحديث (?order=) */
  useEffect(() => {
    setHydrated(true);
    const o = new URLSearchParams(window.location.search).get("order");
    if (o) {
      setOrderId(o);
      setStep("payment");
    }
  }, []);

  /* سلة فارغة → المتجر (في مرحلة التوصيل فقط — بعد إنشاء الطلب لا يهم) */
  useEffect(() => {
    if (hydrated && step === "delivery" && items.length === 0) {
      router.replace("/shop");
    }
  }, [hydrated, step, items.length, router]);

  /** الانتقال لمرحلة الدفع بعد إنشاء الطلب — يُزامن الرابط بلا إعادة تحميل */
  function goToPayment(id: string) {
    setOrderId(id);
    setStep("payment");
    window.history.replaceState(null, "", `/checkout?order=${id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /** الرجوع لتعديل بيانات التوصيل */
  function backToDelivery() {
    setStep("delivery");
    window.history.replaceState(null, "", "/checkout");
  }

  if (!hydrated || (step === "delivery" && items.length === 0)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-light text-[15px]">{t("loading")}</div>
      </div>
    );
  }

  const isPayment = step === "payment";

  /** قسم الخطوة (نموذج أو دفع) — key لإعادة تشغيل أنيميشن الدخول عند التبديل */
  const stepSection = (
    <div key={step} className="checkout-step-in">
      {isPayment && orderId ? (
        <EmbeddedPayment id={orderId} onEdit={backToDelivery} />
      ) : (
        <CheckoutForm shipping={shipping} onProceedToPayment={goToPayment} />
      )}
    </div>
  );

  const summaryAside = (
    <>
      <OrderSummary shipping={shipping} readOnly={isPayment} />
      <div className="mt-5">
        <TrustBadges />
      </div>
    </>
  );

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
            <Link href="/" className="hover:text-teal transition-colors">{tNav("home")}</Link>
            <span>›</span>
            <Link href="/shop" className="hover:text-teal transition-colors">{tNav("shop")}</Link>
            <span>›</span>
            <span className="text-mid">{isPayment ? t("securePayment") : t("completePurchase")}</span>
          </nav>
          <h1 className="font-heading font-bold text-h1 mb-2" style={{ color: "var(--dark)" }}>
            {isPayment ? t("securePayment") : t("completePurchase")}
          </h1>
          <p className="font-body text-[15px]" style={{ color: "var(--mid)", fontFamily: "'Tajawal', sans-serif" }}>
            {isPayment ? t("paymentSubtitle") : t("deliverySubtitle")}
          </p>
        </Container>
        <PageHeaderWave fillColor="var(--offwh)" />
      </div>

      {/* ── شريط التقدّم ── */}
      <Container>
        <div className="mt-8">
          <CheckoutSteps current={isPayment ? 2 : 1} />
        </div>
      </Container>

      {/* ── المحتوى — شبكة واحدة متجاوبة (نسخة واحدة من كل قسم) ── */}
      <Container>
        <div className="mt-8 grid gap-8 grid-cols-1 md:[grid-template-columns:1fr_380px]">
          {/* الملخّص + الثقة — أول على الموبايل، العمود الأيسر (track 2) الملتصق على الديسكتوب */}
          <div className="md:order-2 md:sticky md:top-24 md:self-start">{summaryAside}</div>
          {/* الخطوة (نموذج ↔ دفع) — أخير على الموبايل، العمود الأيمن (track 1) على الديسكتوب */}
          <div className="md:order-1">{stepSection}</div>
        </div>

        {/* منتجات مقترحة — مرحلة التوصيل فقط */}
        {!isPayment && (
          <div className="mt-8">
            <CheckoutUpsell />
          </div>
        )}
      </Container>
    </div>
  );
}
