import Link from "next/link";
import Container from "@/components/ui/Container";
import SectionLabel from "@/components/ui/SectionLabel";
import LatestBigCardBody from "./LatestBigCardBody";
import PolkaDots from "@/components/ui/PolkaDots";
import SectionWave from "@/components/ui/SectionWave";
import ProductImagePlaceholder from "@/components/shop/ProductImagePlaceholder";
import { getProduct } from "@/lib/products/getProduct";

/** قسم آخر التحديثات — صندوق مشوار أم فقط في المرحلة الأولى */
export default async function LatestSection() {
  const hero = await getProduct("mommy-journey-box");

  return (
    <section className="relative reveal-section" style={{ marginTop: -60, zIndex: 2 }}>

      {/* ── موجة أعلى القسم ── */}
      <SectionWave fill="#F5F0EA" />

      {/* ── محتوى القسم ── */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "#F5F0EA",
          backgroundImage: `
            radial-gradient(circle, rgba(242,167,181,0.18) 1px, transparent 1px),
            radial-gradient(circle, rgba(130,201,196,0.13) 1px, transparent 1px)
          `,
          backgroundSize: "28px 28px, 44px 44px",
          backgroundPosition: "0 0, 14px 14px",
          marginTop: -1,
        }}
      >
        <PolkaDots opacity={0.25} count={18} />

        <div className="pb-14">
          <Container className="relative z-[2]">

            {/* ── عنوان القسم ── */}
            <div className="flex items-end justify-between mb-6">
              <div>
                <SectionLabel color="teal">جديد في Momzy</SectionLabel>
                <h2 className="font-heading text-h2 font-bold text-dark">
                  آخر <span className="text-rose">التحديثات</span>
                </h2>
              </div>
              <Link
                href="/shop"
                className="text-btn font-semibold text-teal [transition:gap_200ms_cubic-bezier(0.23,1,0.32,1),color_150ms_ease] hover:gap-2 flex items-center gap-1.5 hover:text-teal/80"
              >
                كل المنتجات ←
              </Link>
            </div>

            {/* ── الكارد الكبير — عرض كامل ── */}
            <Link
              href="/shop/mommy-journey-box"
              className="group bg-white border-[1.5px] border-bord rounded-[24px] grid grid-cols-1 md:grid-cols-[1fr_1.2fr] overflow-hidden cursor-pointer [transition:transform_300ms_cubic-bezier(0.23,1,0.32,1),box-shadow_300ms_ease] hover:shadow-[0_20px_50px_rgba(0,0,0,0.10)] hover:-translate-y-1.5"
            >
              {/* منطقة الصورة */}
              <div className="relative min-h-[260px] md:min-h-[360px]">
                <ProductImagePlaceholder
                  src={hero?.mainImage}
                  alt={hero?.title ?? "صندوق مشوار أم"}
                  size="hero"
                  className="absolute inset-0 w-full h-full"
                />
                {/* badge — من Sanity أو إخفاء إذا فارغ */}
                {hero?.badge && (
                  <span
                    className="absolute top-3.5 end-3.5 text-dark font-label text-[12px] md:text-[13px] font-extrabold tracking-[1.5px] uppercase px-3.5 py-[5px] rounded-full z-10"
                    style={{
                      background:
                        hero.badgeColor === "rose" ? "var(--rose)"  :
                        hero.badgeColor === "teal" ? "var(--teal)"  :
                        "#F7DF98" /* yellow — افتراضي */,
                      animation:
                        hero.badgeColor === "rose" ? "pulse-badge 2s infinite"        :
                        hero.badgeColor === "teal" ? "none"                            :
                        "pulse-badge-yellow 2s infinite",
                      color:
                        hero.badgeColor === "teal" ? "white" : "var(--dark)",
                    }}
                  >
                    {hero.badge}
                  </span>
                )}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* محتوى الكارد */}
              <div className="p-10 flex flex-col justify-between">
                <div>
                  {hero?.label && (
                    <div className="font-label text-[11px] font-extrabold tracking-[2px] uppercase text-mid mb-2.5">
                      {hero.label}
                    </div>
                  )}
                  <div className="font-heading text-h3 text-dark mb-3 leading-[1.3]">
                    {hero?.title ?? "صندوق مشوار أم"}
                  </div>
                  <LatestBigCardBody description={hero?.description} />

                  {/* badges — لون كل tag من Sanity */}
                  {(hero?.tags ?? []).length > 0 && (
                    <div className="flex gap-2 flex-wrap mb-6">
                      {(hero?.tags ?? []).filter((tag): tag is import("@/lib/products/types").ProductTag =>
                        tag !== null && typeof tag === "object" && "label" in tag
                      ).map((tag) => (
                        <span
                          key={tag.label}
                          className="text-[10px] md:text-[12px] font-semibold px-3 py-1 rounded-xl"
                          style={{
                            background: tag.color === "teal" ? "var(--tealpale)" : "var(--rosepale)",
                            color:      tag.color === "teal" ? "var(--teal)"    : "var(--rose)",
                          }}
                        >
                          ✦ {tag.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <span
                  className="btn-wobble inline-flex items-center gap-2 bg-rose text-dark text-body font-extrabold shadow-[0_4px_16px_rgba(242,167,181,0.45)] px-7 py-3 rounded-full w-fit [transition:transform_200ms_cubic-bezier(0.23,1,0.32,1),box-shadow_200ms_ease] group-hover:shadow-[0_8px_24px_rgba(242,167,181,0.55)] group-hover:-translate-y-0.5"
                >
                  اشتري الآن ←
                </span>
              </div>
            </Link>

          </Container>
        </div>
      </div>

    </section>
  );
}
