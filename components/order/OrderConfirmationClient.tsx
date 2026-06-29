"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Container from "@/components/ui/Container";
import PageHeaderWave from "@/components/ui/PageHeaderWave";
import OrderHeader      from "@/components/order/OrderHeader";
import OrderInfoCard    from "@/components/order/OrderInfoCard";
import OrderItemsList   from "@/components/order/OrderItemsList";
import OrderTotals      from "@/components/order/OrderTotals";
import OrderActions     from "@/components/order/OrderActions";
import { getOrder, type Order } from "@/lib/utils/orders";
import { useCart } from "@/lib/store/cart";

interface OrderConfirmationClientProps {
  orderNumber: string;
}

/** الحالات المحتملة لتحميل الطلب */
type LoadStatus = "loading" | "loaded" | "notFound";

/** صفحة تأكيد الطلب — تقرأ الطلب من localStorage بعد hydration */
export default function OrderConfirmationClient({ orderNumber }: OrderConfirmationClientProps) {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [order,  setOrder]  = useState<Order | null>(null);
  const clearCart = useCart((s) => s.clearCart);

  /* قراءة الطلب من localStorage + تفريغ السلة بعد النجاح */
  useEffect(() => {
    const fetched = getOrder(orderNumber);
    if (fetched) {
      setOrder(fetched);
      setStatus("loaded");
      clearCart(); // تفريغ السلة هنا لتجنب race condition في CheckoutClient
    } else {
      setStatus("notFound");
    }
  }, [orderNumber, clearCart]);

  /* ── حالة التحميل ── */
  if (status === "loading") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-light text-[15px]">جارٍ تحميل تفاصيل الطلب...</div>
      </div>
    );
  }

  /* ── الطلب غير موجود ── */
  if (status === "notFound" || !order) {
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
            <h1 className="font-heading font-bold text-dark text-[24px] mb-3">
              الطلب غير موجود
            </h1>
            <p className="font-label text-[14px] text-mid leading-[1.8] mb-6">
              لم نعثر على طلب برقم <span className="font-bold text-dark" style={{ direction: "ltr" }}>{orderNumber}</span>
              <br />
              ربما انتهت صلاحية الجلسة أو تم مسح بيانات المتصفح.
            </p>
            <Link
              href="/shop"
              className="inline-block font-label font-bold text-[14px] text-dark"
              style={{
                background: "var(--yellow)",
                border: "none",
                borderRadius: 50,
                padding: "13px 32px",
                textDecoration: "none",
              }}
            >
              العودة للمتجر
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  /* ── الطلب جاهز ── */
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
            <span className="text-mid">تأكيد الطلب</span>
          </nav>
          <h1
            className="font-heading font-bold text-h1 mb-2"
            style={{ color: "var(--dark)" }}
          >
            تأكيد الطلب
          </h1>
        </Container>
        <PageHeaderWave fillColor="var(--offwh)" />
      </div>

      {/* ── المحتوى الرئيسي ── */}
      <Container>
        <div className="mt-8 max-w-[920px] mx-auto flex flex-col gap-6">
          <OrderHeader   orderNumber={order.orderNumber} createdAt={order.createdAt} />
          <OrderInfoCard customer={order.customer} notes={order.notes} />
          <OrderItemsList items={order.items} />
          <OrderTotals
            subtotal={order.subtotal}
            shippingCost={order.shippingCost}
            discount={order.discount}
            total={order.total}
          />
          <OrderActions />
        </div>
      </Container>
    </div>
  );
}
