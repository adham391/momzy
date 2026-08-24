import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Check } from "lucide-react";
import Container from "@/components/ui/Container";
import SectionLabel from "@/components/ui/SectionLabel";
import SectionWave from "@/components/ui/SectionWave";
import ProductCard from "@/components/shop/ProductCard";
import { getProducts } from "@/lib/products/getProducts";
import type { Product } from "@/lib/products/types";
import ProductFAQ from "./ProductFAQ";
import ProductStickyMobileCTA from "./ProductStickyMobileCTA";
import BookletHero, { BookletFinalCTA } from "./BookletHero";

interface BookletDetailProps {
  product: Product;
}

/**
 * صفحة الكتيب الرقمي — قالب مستقل عن قالب الصندوق.
 * يعيد استخدام السلة (BookletHero) وقسم الأسئلة الشائعة والشريط الثابت،
 * ويقدّم أقسامًا خاصة بالكتيب: الخطّاف · نبذة · المحتويات · الفائدة · الجمهور.
 */
export default async function BookletDetail({ product }: BookletDetailProps) {
  const t = await getTranslations("booklet");
  const allProducts = await getProducts({ inStockOnly: true });
  const related = allProducts.filter((p) => p.slug !== product.slug).slice(0, 3);

  const hook = product.bookletHook;
  const about = product.bookletAbout ?? [];
  const chapters = product.bookletChapters ?? [];
  const benefits = product.bookletBenefits ?? [];
  const audience = product.bookletAudience ?? [];

  return (
    <div style={{ background: "#FDFAF5" }}>
      {/* 1. Hero */}
      <BookletHero product={product} />

      {/* 2. الخطّاف — نص شاعري */}
      {hook && (
        <Wave fill="#FEF5F7" z={3}>
          <section style={{ background: "var(--rosepale)", padding: "28px 0 clamp(72px, 8vw, 100px)" }}>
            <Container>
              <div className="mx-auto text-center" style={{ maxWidth: 760 }}>
                <div
                  className="mx-auto mb-6 flex items-center justify-center"
                  style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(130,201,196,0.18)", border: "1.5px solid rgba(130,201,196,0.35)", fontSize: 22, color: "var(--teal)" }}
                >
                  ✦
                </div>
                <p className="text-h4 font-heading" style={{ color: "var(--mid)", lineHeight: 1.9, fontStyle: "italic" }}>
                  {hook}
                </p>
              </div>
            </Container>
          </section>
        </Wave>
      )}

      {/* 3. نبذة عن الكتيب */}
      {about.length > 0 && (
        <Wave fill="#FDFAF5" z={4}>
          <section style={{ background: "#FDFAF5", padding: "20px 0 clamp(68px, 6vw, 88px)" }}>
            <Container>
              <div className="mx-auto" style={{ maxWidth: 760 }}>
                <div className="mb-6 md:mb-10 text-center">
                  <SectionLabel color="teal" centered>{t("aboutLabel")}</SectionLabel>
                  <h2 className="text-h2 font-heading font-bold" style={{ color: "var(--dark)", lineHeight: 1.2 }}>
                    {t.rich("aboutTitle", { i: (chunks) => <span style={{ color: "var(--rose)", fontStyle: "italic" }}>{chunks}</span> })}
                  </h2>
                </div>
                {about.map((p, i) => (
                  <p key={i} className="text-[16px] leading-[2] mb-5" style={{ color: "var(--mid)", fontFamily: "'Tajawal', sans-serif" }}>
                    {p}
                  </p>
                ))}
              </div>
            </Container>
          </section>
        </Wave>
      )}

      {/* 4. ماذا ستجدين داخل الكتيب */}
      {chapters.length > 0 && (
        <Wave fill="#F8F4EE" z={5}>
          <section style={{ background: "var(--cream)", padding: "20px 0 clamp(68px, 6vw, 88px)" }}>
            <Container>
              <div className="mb-6 md:mb-12 text-center">
                <SectionLabel color="teal" centered>{t("chaptersLabel")}</SectionLabel>
                <h2 className="text-h2 font-heading font-bold" style={{ color: "var(--dark)", lineHeight: 1.2 }}>
                  {t.rich("chaptersTitle", { i: (chunks) => <span style={{ color: "var(--rose)", fontStyle: "italic" }}>{chunks}</span> })}
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4" style={{ maxWidth: 900, margin: "0 auto" }}>
                {chapters.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-[14px] p-4"
                    style={{ background: "white", border: "1.5px solid rgba(242,167,181,0.15)" }}
                  >
                    <span
                      className="flex items-center justify-center shrink-0 font-label font-bold"
                      style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--tealpale)", color: "var(--teal)", fontSize: 14 }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-[15px]" style={{ color: "var(--dark)", fontFamily: "'Tajawal', sans-serif", fontWeight: 500 }}>
                      {c}
                    </span>
                  </div>
                ))}
              </div>
            </Container>
          </section>
        </Wave>
      )}

      {/* 5. ماذا سيفيدك */}
      {benefits.length > 0 && (
        <Wave fill="#FDFAF5" z={6}>
          <section style={{ background: "#FDFAF5", padding: "20px 0 clamp(68px, 6vw, 88px)" }}>
            <Container>
              <div className="mb-6 md:mb-10 text-center">
                <SectionLabel color="teal" centered>{t("benefitsLabel")}</SectionLabel>
                <h2 className="text-h2 font-heading font-bold" style={{ color: "var(--dark)", lineHeight: 1.2 }}>
                  {t.rich("benefitsTitle", { i: (chunks) => <span style={{ color: "var(--rose)", fontStyle: "italic" }}>{chunks}</span> })}
                </h2>
                <p className="mt-3 mx-auto" style={{ color: "var(--mid)", fontSize: 15, maxWidth: 560, fontFamily: "'Tajawal', sans-serif" }}>
                  {t("benefitsIntro")}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4" style={{ maxWidth: 880, margin: "0 auto" }}>
                {benefits.map((b, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-[14px] p-4"
                    style={{ background: "white", border: "1.5px solid rgba(130,201,196,0.18)" }}
                  >
                    <span
                      className="flex items-center justify-center shrink-0"
                      style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--teal)", marginTop: 1 }}
                    >
                      <Check size={15} color="white" strokeWidth={3} />
                    </span>
                    <span className="text-[15px] leading-[1.7]" style={{ color: "var(--dark)", fontFamily: "'Tajawal', sans-serif", fontWeight: 500 }}>
                      {b}
                    </span>
                  </div>
                ))}
              </div>
            </Container>
          </section>
        </Wave>
      )}

      {/* 6. لمن صُمّم هذا الكتيب */}
      {audience.length > 0 && (
        <Wave fill="#FEF5F7" z={7}>
          <section style={{ background: "var(--rosepale)", padding: "20px 0 clamp(68px, 6vw, 88px)" }}>
            <Container>
              <div className="mb-6 md:mb-10 text-center">
                <h2 className="text-h2 font-heading font-bold" style={{ color: "var(--dark)", lineHeight: 1.2 }}>
                  {t.rich("audienceTitle", { i: (chunks) => <span style={{ color: "var(--rose)", fontStyle: "italic" }}>{chunks}</span> })}
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4" style={{ maxWidth: 900, margin: "0 auto" }}>
                {audience.map((a, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-[16px] p-4 sm:p-5"
                    style={{ background: "white", border: "1.5px solid rgba(242,167,181,0.15)", boxShadow: "0 6px 24px rgba(242,167,181,0.08)" }}
                  >
                    <span
                      className="flex items-center justify-center shrink-0"
                      style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--rosepale)", border: "1.5px solid rgba(242,167,181,0.25)", fontSize: 18 }}
                    >
                      🌸
                    </span>
                    <span className="text-[15px] leading-[1.7]" style={{ color: "var(--dark)", fontFamily: "'Tajawal', sans-serif", fontWeight: 500 }}>
                      {a}
                    </span>
                  </div>
                ))}
              </div>
            </Container>
          </section>
        </Wave>
      )}

      {/* 7. الأسئلة الشائعة (شرطي) */}
      {product.faqs && product.faqs.length > 0 && (
        <Wave fill="#F8F4EE" z={8}>
          <ProductFAQ items={product.faqs} />
        </Wave>
      )}

      {/* 8. CTA النهائي */}
      <Wave fill="#82C9C4" z={9} clip>
        <BookletFinalCTA product={product} />
      </Wave>

      {/* 9. منتجات أخرى */}
      {related.length > 0 && (
        <Wave fill="#FDFAF5" z={10}>
          <section style={{ background: "var(--offwh)", padding: "28px 0 96px" }}>
            <Container>
              <h2 className="font-heading font-bold mb-8" style={{ fontSize: 28, color: "var(--dark)" }}>
                {t("relatedTitle")}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {related.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>
            </Container>
          </section>
        </Wave>
      )}

      {/* الشريط الثابت للجوال */}
      <ProductStickyMobileCTA product={product} />
    </div>
  );
}

/** غلاف قسم — يضيف الموجة الفاصلة + التراكب (نظير نمط ProductPageLayout) */
function Wave({ fill, z, clip, children }: { fill: string; z: number; clip?: boolean; children: ReactNode }) {
  return (
    <div className={`relative${clip ? " overflow-hidden" : ""}`} style={{ marginTop: -60, zIndex: z }}>
      <SectionWave fill={fill} />
      <div style={{ marginTop: -1 }}>{children}</div>
    </div>
  );
}
