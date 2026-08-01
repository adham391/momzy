import Container from "@/components/ui/Container";
import SectionLabel from "@/components/ui/SectionLabel";
import type { Product } from "@/lib/products/types";
import { Heart, Sparkles, Users } from "lucide-react";

interface ProductLongDescriptionProps {
  product: Product;
}

/** 3 pillars ثابتة للمنتجات الغنية */
const PILLARS = [
  {
    Icon:  Heart,
    title: "صُنع بحب",
    text:  "كل قطعةٍ اختيرت بعناية على يد خبيرةٍ بالأمومة، لا من كتالوج جاهز. هذا هو الفرق الذي تشعرين به أول ما تفتحين الصندوق.",
    style: { bg: "var(--rosepale)", border: "rgba(242,167,181,0.20)", color: "#F2A7B5" },
  },
  {
    Icon:  Sparkles,
    title: "تجربة فخمة",
    text:  "من لوحة الغلاف، إلى التغليف الداخلي، إلى الشريط الساتان — كل تفصيلٍ يقول: هذه لحظةٌ مهمّة.",
    style: { bg: "var(--tealpale)", border: "rgba(130,201,196,0.20)", color: "#82C9C4" },
  },
  {
    Icon:  Users,
    title: "رفقة حقيقية",
    text:  "الصندوق ليس نهاية الرحلة، بل بداية علاقةٍ مع Momzy ومع هبة — مجتمعٌ دافئ من أمهاتٍ يفهمنكِ.",
    style: { bg: "rgba(247,223,152,0.28)", border: "rgba(247,223,152,0.55)", color: "#B8920A" },
  },
];

export default function ProductLongDescription({ product }: ProductLongDescriptionProps) {
  const hasLong  = !!product.longDescription;
  const hasSpecs = !!product.specifications && product.specifications.length > 0;
  const hasPillars = hasLong; // نعرض الـ pillars فقط للمنتجات الغنية (لديها وصف طويل)

  return (
    <section style={{ background: "#FDFAF5", padding: "20px 0 clamp(68px, 6vw, 88px)" }}>
      <Container>
        <div className="mx-auto" style={{ maxWidth: 960 }}>
          {/* عنوان */}
          <div className="mb-6 md:mb-12 text-center">
            <SectionLabel color="teal" centered>التفاصيل</SectionLabel>
            <h2
              className="text-h2 font-heading font-bold"
              style={{
                color: "var(--dark)",
                lineHeight: 1.2,
              }}
            >
              {hasPillars ? (
                <>لماذا مشوار أم <span style={{ color: "var(--rose)", fontStyle: "italic" }}>مختلف</span></>
              ) : (
                "معلومات أكثر عن المنتج"
              )}
            </h2>
          </div>

          {/* pillars — للمنتجات الغنية */}
          {hasPillars && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {PILLARS.map(({ Icon, title, text, style }) => (
                <div
                  key={title}
                  className="flex flex-col items-center text-center p-5 sm:p-8 rounded-[20px] [transition:transform_250ms_cubic-bezier(0.23,1,0.32,1),box-shadow_250ms_ease] hover:-translate-y-[3px] hover:shadow-[0_8px_28px_rgba(242,167,181,0.08)]"
                  style={{
                    background: "white",
                    border: "1.5px solid rgba(242,167,181,0.15)",
                  }}
                >
                  {/* أيقونة في دائرة */}
                  <div
                    className="flex items-center justify-center mb-6"
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: "50%",
                      background: style.bg,
                      border: `1.5px solid ${style.border}`,
                    }}
                  >
                    <Icon size={26} color={style.color} strokeWidth={1.5} fill="none" />
                  </div>
                  <h3
                    className="font-heading font-bold mb-3"
                    style={{ fontSize: 20, color: "var(--dark)" }}
                  >
                    {title}
                  </h3>
                  <p
                    className="text-[14px] leading-[1.85]"
                    style={{ color: "var(--mid)", fontFamily: "'Tajawal', sans-serif" }}
                  >
                    {text}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* نص طويل — للمنتجات غير الغنية */}
          {!hasPillars && hasLong && (
            <p
              className="text-[16px] leading-[2] mb-10"
              style={{ color: "var(--mid)", fontFamily: "'Tajawal', sans-serif" }}
            >
              {product.longDescription}
            </p>
          )}

          {/* fallback */}
          {!hasPillars && !hasLong && !hasSpecs && (
            <p
              className="text-[16px] leading-[2]"
              style={{ color: "var(--mid)", fontFamily: "'Tajawal', sans-serif" }}
            >
              {product.description}
            </p>
          )}

          {/* جدول المواصفات */}
          {hasSpecs && (
            <div className={hasPillars ? "mt-12" : ""}>
              <h3
                className="font-heading font-bold mb-4"
                style={{ fontSize: 20, color: "var(--dark)" }}
              >
                المواصفات التقنية
              </h3>
              <div
                className="rounded-[16px] overflow-hidden"
                style={{ border: "1.5px solid var(--bord)", background: "#FDFAF5" }}
              >
                {product.specifications!.map((spec, idx) => (
                  <div
                    key={spec.key}
                    className="grid grid-cols-[140px_1fr] md:grid-cols-[200px_1fr] gap-4 px-5 py-3.5"
                    style={{
                      background: idx % 2 === 0 ? "var(--rosepale)" : "white",
                      borderBottom:
                        idx < product.specifications!.length - 1
                          ? "1px solid var(--bord)"
                          : "none",
                    }}
                  >
                    <div
                      className="font-label font-semibold text-[13px]"
                      style={{ color: "var(--rose)" }}
                    >
                      {spec.key}
                    </div>
                    <div
                      className="text-[14px]"
                      style={{ color: "var(--mid)", fontFamily: "'Tajawal', sans-serif" }}
                    >
                      {spec.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
