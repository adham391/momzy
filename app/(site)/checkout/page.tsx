import type { Metadata } from "next";
import CheckoutClient from "@/components/checkout/CheckoutClient";
import { getShippingConfig } from "@/lib/db/settings";

export const metadata: Metadata = {
  title: "إتمام الشراء | Momzy",
  description: "أكملي طلبك بأمان — شحن سريع وأمان كامل",
};

/** صفحة إتمام الشراء — تجلب إعدادات الشحن من settings وتمرّرها للعميل */
export default async function CheckoutPage() {
  const shipping = await getShippingConfig();
  return <CheckoutClient shipping={shipping} />;
}
