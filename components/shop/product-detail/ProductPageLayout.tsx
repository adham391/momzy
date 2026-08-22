import Container from "@/components/ui/Container";
import SectionWave from "@/components/ui/SectionWave";
import ProductCard from "@/components/shop/ProductCard";
import { getProducts } from "@/lib/products/getProducts";
import { getProduct } from "@/lib/products/getProduct";
import { bundleOfferedBy } from "@/lib/bundles";
import ProductHero from "./ProductHero";
import BundleUpsell from "./BundleUpsell";
import ProductShortDescription from "./ProductShortDescription";
import ProductContents from "./ProductContents";
import ProductStory from "./ProductStory";
import ProductGiftTargets from "./ProductGiftTargets";
import ProductLongDescription from "./ProductLongDescription";
import ProductTestimonials from "./ProductTestimonials";
import ProductFAQ from "./ProductFAQ";
import ProductFinalCTA from "./ProductFinalCTA";
import ProductStickyMobileCTA from "./ProductStickyMobileCTA";
import type { Product } from "@/lib/products/types";

interface ProductPageLayoutProps {
  product: Product;
}

/**
 * ألوان الـ wave — يجب أن تطابق خلفية القسم الذي يأتي بعد الـ wave مباشرة
 * قاعدة: wave fill = section background → انتقال سلس لا فجوة
 */
const WAVES = {
  shortDesc:    "#FEF5F7",   // = ProductShortDescription bg: var(--rosepale)
  contents:     "#F8F4EE",   // = ProductContents bg: var(--cream) #F8F4EE
  story:        "#FDFAF5",   // = ProductStory bg: offwh (تغيير من tealpale لإزالة الأزرق)
  giftTargets:  "#FEF5F7",   // = ProductGiftTargets bg: var(--rosepale) #FEF5F7
  longDesc:     "#FDFAF5",   // = ProductLongDescription bg: #FDFAF5 — wave مرئي من rosepale
  testimonials: "#F5F0EA",   // = ProductTestimonials bg: #F5F0EA
  faq:          "#F8F4EE",   // = ProductFAQ bg: var(--cream) #F8F4EE
  finalCta:     "#F2A7B5",   // = ProductFinalCTA gradient start: #F2A7B5
  related:      "#FDFAF5",   // = Related Products bg: var(--offwh)
};

/**
 * المنسّق — يرتب أقسام صفحة المنتج.
 * كل قسم مُغلّف بـ wrapper يضيف:
 *   - marginTop: -60  (يخفي الحافة العلوية خلف الـ wave)
 *   - zIndex متصاعد  (يضمن تراكب صحيح)
 *   - SectionWave    (بلون خلفية القسم الحالي)
 */
export default async function ProductPageLayout({ product }: ProductPageLayoutProps) {
  // جلب المنتجات المرتبطة مسبقاً لإخفاء القسم كاملاً عند غيابها
  const allProducts = await getProducts({ inStockOnly: true });
  const relatedProducts = allProducts.filter((p) => p.slug !== product.slug).slice(0, 3);

  // باقة يقدّمها هذا المنتج (مثال: الصندوق يقدّم الكتيب بسعر خاص)
  const bundleRule = bundleOfferedBy(product.slug);
  const bundleProduct = bundleRule ? await getProduct(bundleRule.target) : null;

  return (
    <div style={{ background: "#FDFAF5" }}>

      {/* 1. Hero — لا wave قبله (هو القسم الأول) */}
      <ProductHero product={product} />

      {/* 1.5 عرض الباقة — أضيفي الكتيب بسعر خاص (شرطي، z=2 بين الهيرو والوصف) */}
      {bundleProduct && bundleRule && (
        <div className="relative" style={{ marginTop: -60, zIndex: 2 }}>
          <SectionWave fill="#F8F4EE" />
          <div style={{ marginTop: -1 }}>
            <BundleUpsell box={product} booklet={bundleProduct} rule={bundleRule} />
          </div>
        </div>
      )}

      {/* 2. Short Description */}
      <div className="relative" style={{ marginTop: -60, zIndex: 3 }}>
        <SectionWave fill={WAVES.shortDesc} />
        <div style={{ marginTop: -1 }}>
          <ProductShortDescription text={product.longDescription ?? product.description} />
        </div>
      </div>

      {/* 4. Contents (شرطي) */}
      {product.contents && product.contents.length > 0 && (
        <div className="relative" style={{ marginTop: -60, zIndex: 4 }}>
          <SectionWave fill={WAVES.contents} />
          <div style={{ marginTop: -1 }}>
            <ProductContents items={product.contents} />
          </div>
        </div>
      )}

      {/* 5. Story (شرطي) */}
      {product.story && (
        <div className="relative" style={{ marginTop: -60, zIndex: 5 }}>
          <SectionWave fill={WAVES.story} />
          <div style={{ marginTop: -1 }}>
            <ProductStory story={product.story} />
          </div>
        </div>
      )}

      {/* 6. Gift Targets (شرطي) */}
      {product.giftTargets && product.giftTargets.length > 0 && (
        <div className="relative" style={{ marginTop: -60, zIndex: 6 }}>
          <SectionWave fill={WAVES.giftTargets} />
          <div style={{ marginTop: -1 }}>
            <ProductGiftTargets targets={product.giftTargets} />
          </div>
        </div>
      )}

      {/* 8. Long Description */}
      <div className="relative" style={{ marginTop: -60, zIndex: 8 }}>
        <SectionWave fill={WAVES.longDesc} />
        <div style={{ marginTop: -1 }}>
          <ProductLongDescription product={product} />
        </div>
      </div>

      {/* 9. Testimonials (شرطي) */}
      {product.testimonials && product.testimonials.length > 0 && (
        <div className="relative" style={{ marginTop: -60, zIndex: 9 }}>
          <SectionWave fill={WAVES.testimonials} />
          <div style={{ marginTop: -1 }}>
            <ProductTestimonials items={product.testimonials} />
          </div>
        </div>
      )}

      {/* 10. FAQ (شرطي) */}
      {product.faqs && product.faqs.length > 0 && (
        <div className="relative" style={{ marginTop: -60, zIndex: 10 }}>
          <SectionWave fill={WAVES.faq} />
          <div style={{ marginTop: -1 }}>
            <ProductFAQ items={product.faqs} />
          </div>
        </div>
      )}

      {/* 11. Final CTA — overflow-hidden يمنع الدوائر الديكورية من الخروج فوق الـ wave */}
      <div className="relative overflow-hidden" style={{ marginTop: -60, zIndex: 11 }}>
        <SectionWave fill={WAVES.finalCta} />
        <div style={{ marginTop: -1 }}>
          <ProductFinalCTA product={product} />
        </div>
      </div>

      {/* 12. Related Products — يظهر فقط إذا وُجدت منتجات أخرى */}
      {relatedProducts.length > 0 && (
        <div className="relative" style={{ marginTop: -60, zIndex: 12 }}>
          <SectionWave fill={WAVES.related} />
          <div style={{ marginTop: -1 }}>
            <section style={{ background: "var(--offwh)", padding: "28px 0 96px" }}>
              <Container>
                <h2
                  className="font-heading font-bold mb-8"
                  style={{ fontSize: 28, color: "var(--dark)" }}
                >
                  منتجات أخرى من Momzy
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {relatedProducts.map((p) => (
                    <ProductCard key={p.slug} product={p} />
                  ))}
                </div>
              </Container>
            </section>
          </div>
        </div>
      )}

      {/* 12. Sticky Mobile CTA — لا wave */}
      <ProductStickyMobileCTA product={product} />

    </div>
  );
}
