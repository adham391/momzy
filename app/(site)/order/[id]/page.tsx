import type { Metadata } from "next";
import OrderConfirmationClient from "@/components/order/OrderConfirmationClient";

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "تأكيد الطلب | Momzy",
  description: "تم تأكيد طلبكِ بنجاح",
};

/** صفحة تأكيد الطلب — تعرض ملخص الطلب بعد إتمام الشراء */
export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params;
  return <OrderConfirmationClient orderNumber={id} />;
}
