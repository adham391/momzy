"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/store/cart";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import OrderSummary from "@/components/checkout/OrderSummary";
import CheckoutUpsell from "@/components/checkout/CheckoutUpsell";
import Container from "@/components/ui/Container";
import PageHeaderWave from "@/components/ui/PageHeaderWave";

/** حاوية صفحة إتمام الشراء — تتحقق من وجود منتجات في السلة */
export default function CheckoutClient() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const items  = useCart((s) => s.items);
  const router = useRouter();

  /* إعادة التوجيه إذا كانت السلة فارغة */
  useEffect(() => {
    if (hydrated && items.length === 0) {
      router.replace("/shop");
    }
  }, [hydrated, items.length, router]);

  if (!hydrated || items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-light text-[15px]">جارٍ التحميل...</div>
      </div>
    );
  }

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
            <Link href="/shop" className="hover:text-teal transition-colors">المتجر</Link>
            <span>›</span>
            <span className="text-mid">إتمام الشراء</span>
          </nav>
          <h1
            className="font-heading font-bold text-h1 mb-2"
            style={{ color: "var(--dark)" }}
          >
            إتمام الشراء
          </h1>
          <p className="font-body text-[15px]" style={{ color: "var(--mid)", fontFamily: "'Tajawal', sans-serif" }}>
            أكملي بياناتك وسيصلك طلبك خلال 5 أيام عمل
          </p>
        </Container>
        <PageHeaderWave fillColor="var(--offwh)" />
      </div>

      {/* ── المحتوى الرئيسي ── */}
      <Container>
        <div className="mt-8">
          {/* Desktop: عمودان */}
          <div className="hidden md:grid gap-8" style={{ gridTemplateColumns: "1fr 380px" }}>
            <CheckoutForm />
            <div style={{ position: "sticky", top: 96, alignSelf: "start" }}>
              <OrderSummary />
            </div>
          </div>

          {/* Mobile: عمود واحد */}
          <div className="flex flex-col gap-6 md:hidden">
            <OrderSummary />
            <CheckoutForm />
          </div>

          {/* منتجات مقترحة */}
          <CheckoutUpsell />
        </div>
      </Container>
    </div>
  );
}
