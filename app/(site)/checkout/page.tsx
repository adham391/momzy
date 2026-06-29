import type { Metadata } from "next";
import CheckoutClient from "@/components/checkout/CheckoutClient";

export const metadata: Metadata = {
  title: "إتمام الشراء | Momzy",
  description: "أكملي طلبك بأمان — شحن سريع وأمان كامل",
};

/** صفحة إتمام الشراء */
export default function CheckoutPage() {
  return <CheckoutClient />;
}
