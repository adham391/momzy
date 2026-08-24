import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/Container";
import ShopHeader from "@/components/shop/ShopHeader";
import ShopFilters from "@/components/shop/ShopFilters";
import { getProducts } from "@/lib/products/getProducts";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "shop" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

/** ISR — يُعاد بناء الصفحة كل ساعة */
export const revalidate = 3600;

/** صفحة المتجر — server component يجلب المنتجات + يمررها لـ Client filter wrapper */
export default async function ShopPage() {
  const products = await getProducts({ inStockOnly: true });

  return (
    <>
      <ShopHeader />
      <div style={{ paddingTop: 16, paddingBottom: 80 }}>
        <Container>
          <ShopFilters products={products} />
        </Container>
      </div>
    </>
  );
}
