import { Link } from "@/lib/i18n/navigation";
import Container from "@/components/ui/Container";
import SectionLabel from "@/components/ui/SectionLabel";
import PolkaDots from "@/components/ui/PolkaDots";
import SectionWave from "@/components/ui/SectionWave";
import ProductCard from "@/components/shop/ProductCard";
import { getProducts } from "@/lib/products/getProducts";
import type { HomePageContent } from "@/lib/sanity/queries/homePage";

/** قسم "الأكثر مبيعاً" — شبكة منتجات بشارة ترتيب (مثل متاجر الأمومة العصرية) */
export default async function BestSellersSection({ content }: { content: HomePageContent }) {
  const products = (await getProducts({ inStockOnly: true })).slice(0, 4);

  // لا تعرض القسم إذا لا توجد منتجات
  if (products.length === 0) return null;

  return (
    /** ─ الـ section شفاف — الـ wave يغطي نهاية قسم "ليش Momzy" ─ */
    <section className="relative reveal-section" style={{ marginTop: -60, zIndex: 3 }}>

      {/* ── موجة أعلى القسم ── */}
      <SectionWave fill="#F5F0EA" />

      {/* ── محتوى القسم — خلفية كريمية بنقش نقاط ناعم ── */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "#F5F0EA",
          backgroundImage: `
            radial-gradient(circle, rgba(242,167,181,0.16) 1px, transparent 1px),
            radial-gradient(circle, rgba(130,201,196,0.12) 1px, transparent 1px)
          `,
          backgroundSize: "28px 28px, 44px 44px",
          backgroundPosition: "0 0, 14px 14px",
          marginTop: -1,
          paddingTop: 20,
          paddingBottom: 64,
        }}
      >
        <PolkaDots opacity={0.18} count={14} />

        <Container className="relative z-[2]">

          {/* ── عنوان القسم ── */}
          <div className="flex items-end justify-between mb-7">
            <div>
              <SectionLabel color="teal">{content.bestSellersLabel}</SectionLabel>
              <h2 className="font-heading text-h2 font-bold text-dark">
                {content.bestSellersTitle}
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-btn font-semibold text-teal [transition:gap_200ms_cubic-bezier(0.23,1,0.32,1),color_150ms_ease] hover:gap-2 flex items-center gap-1.5 hover:text-teal/80"
            >
              كل المنتجات ←
            </Link>
          </div>

          {/* ── شبكة المنتجات — تتوسّط عند قلة المنتجات، عمودان على الموبايل ── */}
          <div
            className={
              products.length === 1
                ? "grid grid-cols-1 max-w-[320px] mx-auto"
                : products.length === 2
                ? "grid grid-cols-2 gap-3 sm:gap-4 max-w-[680px] mx-auto"
                : products.length === 3
                ? "grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5 max-w-[1000px] mx-auto"
                : "grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5"
            }
          >
            {products.map((product, idx) => (
              <div key={product.slug} className="relative h-full">
                {/* شارة الترتيب — الأكثر مبيعاً */}
                <span
                  className="absolute top-2.5 end-2.5 z-20 flex items-center gap-0.5 font-label font-extrabold rounded-full"
                  style={{
                    background: "linear-gradient(135deg, #C09420, #E6C254)",
                    color: "white",
                    fontSize: 10,
                    padding: "3px 8px",
                    boxShadow: "0 4px 12px rgba(192,148,32,0.4)",
                  }}
                >
                  ★ #{idx + 1}
                </span>

                <ProductCard product={product} showTags={false} />
              </div>
            ))}
          </div>

        </Container>
      </div>

    </section>
  );
}
