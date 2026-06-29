import TopBar from "@/components/layout/TopBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartSidebar from "@/components/shop/CartSidebar";
import FloatingCartButton from "@/components/shop/FloatingCartButton";
import CartAddedModal from "@/components/shop/CartAddedModal";
import { getSiteSettings } from "@/lib/sanity/queries/siteSettings";

/**
 * تخطيط صفحات الموقع العامة
 * يجلب إعدادات الموقع من Sanity ويمرّرها لـ TopBar + Footer
 */
export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <>
      <TopBar settings={settings.topBar} />
      <Header />
      <main>{children}</main>
      <Footer settings={settings} />

      {/* ── نظام السلة — متاح على كل الصفحات ── */}
      <CartSidebar />
      <FloatingCartButton />
      <CartAddedModal />
    </>
  );
}
