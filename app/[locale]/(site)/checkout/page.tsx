import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import CheckoutClient from "@/components/checkout/CheckoutClient";
import { getShippingConfig } from "@/lib/db/settings";
import { getProducts } from "@/lib/products/getProducts";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "checkout" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

/** صفحة إتمام الشراء — تجلب إعدادات الشحن وأسعار الدولار الثابتة وتمرّرها للعميل */
export default async function CheckoutPage() {
  const [shipping, products] = await Promise.all([getShippingConfig(), getProducts()]);
  // سعر كل منتج بالدولار من Studio — منه يُحسب ما تراه الزائرة من خارج البلاد كما يحسبه السيرفر
  const usdPrices = Object.fromEntries(products.map((p) => [p.slug, p.priceUsd ?? null]));
  return <CheckoutClient shipping={shipping} usdPrices={usdPrices} />;
}
