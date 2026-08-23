import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProduct } from "@/lib/products/getProduct";
import { getAllProductSlugs } from "@/lib/sanity/queries/products";
import { SEED_PRODUCTS } from "@/lib/products/seed";
import ProductPageLayout from "@/components/shop/product-detail/ProductPageLayout";
import BookletDetail from "@/components/shop/product-detail/BookletDetail";

/** ISR — يُعاد بناء الصفحة كل 60 ثانية بعد تحديث Sanity */
export const revalidate = 60;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

/** توليد static params — من Sanity أو seed كـ fallback */
export async function generateStaticParams() {
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    return SEED_PRODUCTS.map((p) => ({ slug: p.slug }));
  }
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

/** metadata ديناميكي حسب المنتج */
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "منتج غير موجود | Momzy" };
  return {
    title: `${product.title} | Momzy`,
    description: product.description,
    openGraph: {
      title: product.title,
      description: product.description,
      images: product.mainImage ? [product.mainImage] : undefined,
    },
  };
}

/** صفحة المنتج — قالب موحد، أقسام شرطية حسب البيانات */
export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  // الكتيبات الرقمية لها قالب مستقل — نكتشفها بوجود فصول الكتيب
  const isBooklet = !!(product.bookletChapters && product.bookletChapters.length > 0);

  return isBooklet
    ? <BookletDetail product={product} />
    : <ProductPageLayout product={product} />;
}
