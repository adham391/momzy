import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import ShopHeader from "@/components/shop/ShopHeader";
import ShopFilters from "@/components/shop/ShopFilters";
import { getProducts } from "@/lib/products/getProducts";

export const metadata: Metadata = {
  title: "المتجر | Momzy",
  description:
    "تصفحي منتجات Momzy — صناديق هدايا فاخرة، إكسسوارات الطفل، ومنتجات مختارة بعناية لمرافقتك في رحلة الأمومة.",
};

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
