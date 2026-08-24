import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import CheckoutClient from "@/components/checkout/CheckoutClient";
import { getShippingConfig } from "@/lib/db/settings";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "checkout" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

/** صفحة إتمام الشراء — تجلب إعدادات الشحن من settings وتمرّرها للعميل */
export default async function CheckoutPage() {
  const shipping = await getShippingConfig();
  return <CheckoutClient shipping={shipping} />;
}
