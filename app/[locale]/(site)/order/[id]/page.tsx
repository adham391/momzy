import type { Metadata } from "next";
import { Link } from "@/lib/i18n/navigation";
import Container from "@/components/ui/Container";
import PageHeaderWave from "@/components/ui/PageHeaderWave";
import OrderHeader from "@/components/order/OrderHeader";
import OrderInfoCard from "@/components/order/OrderInfoCard";
import OrderItemsList from "@/components/order/OrderItemsList";
import OrderDownloads from "@/components/order/OrderDownloads";
import OrderTotals from "@/components/order/OrderTotals";
import OrderActions from "@/components/order/OrderActions";
import PaymentRetryCard from "@/components/order/PaymentRetryCard";
import CheckoutSteps from "@/components/checkout/CheckoutSteps";
import ClearCart from "@/components/order/ClearCart";
import TrackEvent from "@/components/analytics/TrackEvent";
import { getOrderById } from "@/lib/db/orders";
import { getDownloadsByOrder } from "@/lib/db/downloads";
import { isHypConfigured } from "@/lib/hyp/client";
import { getProductImageMap } from "@/lib/products/getProductImageMap";
import type { CartItem } from "@/lib/store/cart";

export const metadata: Metadata = {
  title: "تأكيد الطلب | Momzy",
  description: "تم تأكيد طلبكِ بنجاح",
};

interface OrderPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ payment?: string }>;
}

/** صورة احتياطية لعنصر منتج غير موجود في المصدر */
const FALLBACK_IMAGE = "/icons/momzy-logo.png";

/**
 * صفحة تأكيد الطلب — server component يقرأ الطلب من Supabase بالـ UUID.
 * الـ UUID غير قابل للتخمين، لذا آمن لعرض بيانات الطلب لمن يملك الرابط (العميل).
 */
export default async function OrderPage({ params, searchParams }: OrderPageProps) {
  const { id } = await params;
  const { payment } = await searchParams;
  const order = await getOrderById(id);

  if (!order) return <OrderNotFound />;

  // حالة الدفع تحدّد شكل الصفحة:
  //  - مدفوع، أو HYP غير مفعّل (تدفّق يدوي) ⇒ الطلب مكتمل (نجاح + تفريغ السلة + تتبّع الشراء)
  //  - HYP مفعّل والطلب غير مدفوع ⇒ بانتظار الدفع (نُبقي السلة، لا نتتبّع شراءً، نعرض زر إتمام الدفع)
  const isPaid          = order.payment_status === "paid";
  const awaitingPayment = !isPaid && isHypConfigured();
  const orderComplete   = !awaitingPayment;
  const paymentFailed   = payment === "failed";

  // خريطة الصور من المصدر (الصور غير مخزّنة في order_items)
  const imageMap = await getProductImageMap();
  const items: CartItem[] = order.items.map((it) => ({
    id: it.id,
    slug: it.product_slug,
    title: it.product_name,
    mainImage: imageMap.get(it.product_slug) ?? FALLBACK_IMAGE,
    price: it.unit_price,
    quantity: it.quantity,
    ...(it.gift ? { gift: it.gift } : {}),
  }));

  return (
    <div style={{ background: "var(--offwh)", minHeight: "100vh", paddingBottom: 80 }}>
      {/* تفريغ السلة + تتبّع الشراء — فقط عند اكتمال الطلب (لا أثناء انتظار الدفع) */}
      {orderComplete && <ClearCart />}
      {orderComplete && (
        <TrackEvent event="purchase" data={{ value: order.total_amount, order_id: order.id }} />
      )}

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
          <h1 className="font-heading font-bold text-h1 mb-2" style={{ color: "var(--dark)" }}>
            تأكيد الطلب
          </h1>
        </Container>
        <PageHeaderWave fillColor="var(--offwh)" />
      </div>

      {/* ── المحتوى ── */}
      <Container>
        <div className="mt-8 max-w-[920px] mx-auto flex flex-col gap-6">
          <CheckoutSteps current={awaitingPayment ? 2 : 3} />
          <OrderHeader orderNumber={order.order_number} createdAt={order.created_at} paid={!awaitingPayment} />
          {awaitingPayment && (
            <PaymentRetryCard orderId={order.id} amount={order.total_amount} failed={paymentFailed} />
          )}
          <OrderInfoCard
            customer={{
              name: order.customer_name,
              email: order.customer_email,
              phone: order.customer_phone,
              city: order.customer_city,
              address: order.customer_address,
            }}
            notes={order.notes ?? undefined}
            building={order.customer_building ?? undefined}
            postalCode={order.customer_postal_code ?? undefined}
          />
          <OrderItemsList items={items} />
          {orderComplete && <OrderDownloads downloads={await getDownloadsByOrder(order.id)} />}
          <OrderTotals
            subtotal={order.subtotal}
            shippingCost={order.shipping_cost}
            discount={order.discount_amount}
            total={order.total_amount}
          />
          <OrderActions />
        </div>
      </Container>
    </div>
  );
}

/** واجهة "الطلب غير موجود" */
function OrderNotFound() {
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
          <h1 className="font-heading font-bold text-dark text-[24px] mb-3">الطلب غير موجود</h1>
          <p className="font-label text-[14px] text-mid leading-[1.8] mb-6">
            لم نعثر على هذا الطلب — ربما الرابط غير صحيح.
          </p>
          <Link
            href="/shop"
            className="inline-block font-label font-bold text-[14px] text-dark"
            style={{ background: "var(--yellow)", border: "none", borderRadius: 50, padding: "13px 32px" }}
          >
            العودة للمتجر
          </Link>
        </div>
      </Container>
    </div>
  );
}
