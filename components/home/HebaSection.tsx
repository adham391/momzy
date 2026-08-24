import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import SectionLabel from "@/components/ui/SectionLabel";
import SectionWave from "@/components/ui/SectionWave";
import MomzyText from "@/components/ui/MomzyText";
import { useTranslations } from "next-intl";
import type { HomePageContent } from "@/lib/sanity/queries/homePage";

/** شهادات هبة المهنية مع ألوان النقطة — النص من مفاتيح home.heba.tags */
const HEBA_TAGS = [
  { key: "nurse",     dot: "var(--rose)" },
  { key: "lactation", dot: "var(--teal)" },
  { key: "doula",     dot: "#C09420"      },
];

/** قسم هبة حسن — مؤسِّسة Momzy (تصميم editorial فاخر) */
export default function HebaSection({ content }: { content: HomePageContent }) {
  const t = useTranslations("home");
  return (
    /** ─ الـ section شفاف — الـ wave يغطي نهاية قسم الأكثر مبيعاً ─ */
    <section className="relative reveal-section" style={{ marginTop: -60, zIndex: 4 }}>

      {/* ── موجة أعلى القسم ── */}
      <SectionWave fill="#F8F4EE" />

      {/* ── محتوى القسم ── */}
      <div className="relative overflow-hidden bg-cream pt-7 pb-12 md:pt-10 md:pb-24" style={{ marginTop: -1 }}>

        {/* ── هالات متدرّجة ناعمة للعمق ── */}
        <div
          aria-hidden="true"
          className="absolute pointer-events-none"
          style={{ top: -80, insetInlineEnd: -120, width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle, rgba(242,167,181,0.30), transparent 70%)", filter: "blur(20px)" }}
        />
        <div
          aria-hidden="true"
          className="absolute pointer-events-none"
          style={{ bottom: -100, insetInlineStart: -120, width: 460, height: 460, borderRadius: "50%", background: "radial-gradient(circle, rgba(130,201,196,0.26), transparent 70%)", filter: "blur(20px)" }}
        />

        <Container className="relative z-[2]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-7 md:gap-16 items-center">

            {/* ════════ عمود النص (يمين RTL) ════════ */}
            <div className="text-center md:text-right order-2 md:order-1">

              {/* eyebrow — نفس أسلوب باقي الأقسام */}
              <div className="flex justify-center md:justify-start">
                <SectionLabel color="teal">{content.hebaLabel}</SectionLabel>
              </div>

              {/* العنوان مع علامة اقتباس ديكورية */}
              <div className="relative">
                <span
                  aria-hidden="true"
                  className="absolute font-heading select-none"
                  style={{ top: -46, insetInlineStart: -10, fontSize: 120, lineHeight: 1, color: "rgba(242,167,181,0.22)" }}
                >
                  ❝
                </span>
                <h2 className="font-heading font-bold text-dark relative" style={{ fontSize: "clamp(28px, 3.6vw, 44px)", lineHeight: 1.25 }}>
                  {content.hebaHeadingLine1}
                  <br />
                  <MomzyText text={content.hebaHeadingLine2} />
                </h2>
              </div>

              {/* السيرة — فقرة واحدة على الموبايل، اثنتان على الديسكتوب */}
              <p className="text-body leading-[1.9] text-mid mt-4 md:mt-5 mb-5 md:mb-3.5">
                {content.hebaBio[0]}
              </p>
              {content.hebaBio[1] && (
                <p className="hidden md:block text-body leading-[1.9] text-mid mb-6">
                  {content.hebaBio[1]}
                </p>
              )}

              {/* شارات الاعتماد */}
              <div className="flex gap-2 flex-wrap justify-center md:justify-start mb-4 md:mb-6">
                {HEBA_TAGS.map((tag) => (
                  <span
                    key={tag.key}
                    className="font-label font-bold text-label inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full whitespace-nowrap"
                    style={{ background: "white", color: "var(--dark)", border: "1px solid var(--bord)", letterSpacing: "0.3px", boxShadow: "0 4px 14px rgba(0,0,0,0.05)" }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: tag.dot, flexShrink: 0 }} />
                    {t(`heba.tags.${tag.key}`)}
                  </span>
                ))}
              </div>

              {/* التوقيع */}
              <div className="flex items-center gap-3 justify-center md:justify-start mb-5 md:mb-7">
                <span className="font-heading italic text-rose" style={{ fontSize: 30, lineHeight: 1 }}>{content.hebaSignature}</span>
                <span style={{ width: 38, height: 1.5, background: "var(--roselt)" }} />
                <span className="font-label uppercase text-light" style={{ fontSize: 10, letterSpacing: "2px" }}>Heba Hasan</span>
              </div>

              {/* أزرار CTA */}
              <div className="flex gap-3 flex-wrap justify-center md:justify-start">
                <Button variant="rose" href="/services">{t("heba.bookCta")}</Button>
                <Button variant="outline-rose" href="/about">{t("heba.aboutCta")}</Button>
              </div>
            </div>

            {/* ════════ عمود الصورة (يسار RTL) ════════ */}
            <div className="relative flex justify-center order-1 md:order-2">
              <div className="relative w-[205px] md:w-[330px]">

                {/* شكل متدرّج خلف الصورة — عمق */}
                <div
                  aria-hidden="true"
                  className="absolute"
                  style={{
                    inset: -18,
                    insetInlineStart: 18,
                    top: 22,
                    borderRadius: "150px 150px 32px 32px",
                    background: "linear-gradient(150deg, var(--rose), var(--teal))",
                    opacity: 0.9,
                  }}
                />

                {/* نقاط ديكورية صغيرة */}
                <span aria-hidden="true" className="absolute" style={{ top: -14, insetInlineEnd: -10, width: 14, height: 14, borderRadius: "50%", background: "var(--yellow)" }} />
                <span aria-hidden="true" className="absolute" style={{ bottom: 60, insetInlineStart: -16, width: 10, height: 10, borderRadius: "50%", background: "var(--teal)" }} />
                <span aria-hidden="true" className="absolute font-heading" style={{ top: 8, insetInlineStart: -24, fontSize: 22, color: "var(--roselt)" }}>✦</span>

                {/* الصورة بإطار قوسي */}
                <div
                  className="relative bg-cover border-[6px] border-white shadow-[0_28px_70px_rgba(217,105,122,0.30)]"
                  style={{
                    aspectRatio: "4 / 5",
                    borderRadius: "150px 150px 32px 32px",
                    backgroundImage: `url('${content.heroImage}')`,
                    backgroundPosition: "center 12%",
                  }}
                >
                  {/* شارة توثيق */}
                  <span
                    className="absolute flex items-center justify-center rounded-full border-[3px] border-white shadow-[0_6px_16px_rgba(0,0,0,0.18)]"
                    style={{ background: "var(--teal)", color: "white", width: 44, height: 44, fontSize: 19, top: 16, insetInlineEnd: 16 }}
                  >
                    ✓
                  </span>
                </div>

                {/* بطاقة إحصائية عائمة — +1000 أم */}
                <div
                  className="absolute flex items-center gap-3"
                  style={{
                    bottom: -22,
                    insetInlineStart: -18,
                    background: "rgba(255,255,255,0.92)",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    border: "1px solid rgba(255,255,255,0.7)",
                    borderRadius: 18,
                    padding: "12px 18px",
                    boxShadow: "0 16px 40px rgba(0,0,0,0.14)",
                  }}
                >
                  <span className="font-heading font-bold" style={{ color: "var(--rose)", fontSize: 30, lineHeight: 1 }}>{content.hebaStat.number}</span>
                  <span className="text-start leading-tight text-mid" style={{ fontSize: 12.5, maxWidth: 92 }}>{content.hebaStat.label}</span>
                </div>
              </div>
            </div>

          </div>
        </Container>
      </div>

    </section>
  );
}
