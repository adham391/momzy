import { Link } from "@/lib/i18n/navigation";
import Image from "next/image";
import PolkaDots from "@/components/ui/PolkaDots";
import Container from "@/components/ui/Container";
import MomzyText from "@/components/ui/MomzyText";
import CheckGlyph from "@/components/ui/CheckGlyph";
import { useTranslations, useLocale } from "next-intl";
import type { HomePageContent } from "@/lib/sanity/queries/homePage";

/** سهم اتجاه التقدّم — يشير لليسار في RTL ولليمين في LTR (يُقلَب) */
function DirArrow({ flip }: { flip: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={flip ? { transform: "scaleX(-1)" } : undefined}>
      <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * قسم الهيرو — صورة هبة على اليسار (ديسكتوب) + محتوى احترافي على اليمين.
 * الصورة في: public/images/heba.jpg
 */
export default function HeroSection({ content }: { content: HomePageContent }) {
  const t = useTranslations("home");
  const tNav = useTranslations("nav");
  const locale = useLocale();
  // الإنجليزية LTR — نعكس اتجاهات الصورة/التدرّج/الأسهم؛ العربية والعبرية RTL
  const isRtl = locale !== "en";
  return (
    <section
      className="relative overflow-hidden min-h-[500px] md:min-h-0"
      style={{
        background: "linear-gradient(140deg,#F2A7B5 0%,#FB9AB4 50%,#DC7A8A 100%)",
        zIndex: 1,
      }}
    >
      {/* ── صورة هبة — ديسكتوب: لوحة على جهة النهاية (يسار في RTL/يمين في LTR) تذوب حافتها نحو النص ── */}
      <div
        className="absolute inset-y-0 hidden md:block"
        style={{
          insetInlineEnd: 0,
          width: "68%",
          // القناع يتلاشى نحو النص (البداية): يمينًا في RTL ويسارًا في LTR
          WebkitMaskImage: `linear-gradient(to ${isRtl ? "right" : "left"}, #000 55%, transparent 100%)`,
          maskImage: `linear-gradient(to ${isRtl ? "right" : "left"}, #000 55%, transparent 100%)`,
        }}
        aria-hidden="true"
      >
        <Image
          src={content.heroImage}
          alt=""
          fill
          // مخفية على الجوال — «1px» يجعل المتصفح لا يطلب منها إلا أصغر نسخة
          sizes="(min-width: 768px) 68vw, 1px"
          loading="eager"
          fetchPriority="high"
          style={{ objectFit: "cover", objectPosition: "center 8%" }}
        />
      </div>
      {/* ── تدرّج خفيف على جهة النص (البداية) للتباين ── */}
      <div
        className="absolute inset-0 hidden md:block"
        style={{
          background: `linear-gradient(to ${isRtl ? "left" : "right"}, rgba(242,167,181,0.55) 0%, rgba(242,167,181,0.12) 38%, transparent 60%)`,
        }}
        aria-hidden="true"
      />

      {/* ── بطاقة تعريف هبة على الصورة (ديسكتوب فقط) — خارج مقتطف البحث ── */}
      <div
        data-nosnippet
        className="hero-rise absolute hidden md:flex items-center gap-3 z-[3]"
        style={{
          bottom: 84,
          insetInlineEnd: 40,
          background: "rgba(255,255,255,0.78)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.6)",
          borderRadius: 16,
          padding: "10px 16px 10px 14px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.14)",
          animationDelay: "0.6s",
        }}
      >
        {/* علامة توثيق */}
        <span
          className="flex items-center justify-center shrink-0 rounded-full"
          style={{ width: 34, height: 34, background: "var(--teal)", color: "white", fontSize: 16 }}
        >
          <CheckGlyph size={16} />
        </span>
        <div className="leading-tight">
          <div className="font-heading font-bold" style={{ color: "var(--dark)", fontSize: 16 }}>{t("hero.hebaName")}</div>
          <div className="font-label" style={{ color: "var(--mid)", fontSize: 11.5, letterSpacing: "0.2px" }}>
            {t("hero.hebaCredentials")}
          </div>
        </div>
      </div>

      {/* ── نقاط ديكورية متحركة ── */}
      <PolkaDots colors={["#ffffff", "#F7DF98", "#A8D8D5"]} opacity={0.16} count={16} />

      <Container className="relative z-[2]">
        <div className="flex items-center md:block pb-14 md:pb-0 min-h-0">
          <div className="text-center md:text-start py-8 md:pt-12 md:pb-[84px] w-full md:w-auto md:max-w-[480px]">

            {/* ── صورة هبة المؤطّرة — موبايل فقط (إطار أبيض + توثيق) ── */}
            <div className="md:hidden mx-auto mb-5 relative" style={{ width: 168, maxWidth: "54%" }}>
              <div
                className="relative rounded-[26px] overflow-hidden border-[5px] border-white"
                style={{ aspectRatio: "4 / 5", boxShadow: "0 18px 44px rgba(0,0,0,0.24)" }}
              >
                {/* أول ما تراه الزائرة على الجوال (LCP) — تُحمَّل مسبقًا وبأولوية */}
                <Image
                  src={content.heroImage}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 1px, 270px"
                  preload
                  fetchPriority="high"
                  // تقريب أكبر من cover (كـ background-size: 160%) — يعرض الرأس حتى الخصر كنسخة الديسكتوب
                  style={{ objectFit: "cover", objectPosition: "center 10%", transform: "scale(1.6)", transformOrigin: "50% 10%" }}
                />
              </div>
              {/* علامة توثيق teal */}
              <span
                className="absolute flex items-center justify-center rounded-full border-[3px] border-white"
                style={{
                  background: "var(--teal)",
                  color: "white",
                  width: 38,
                  height: 38,
                  fontSize: 16,
                  bottom: -10,
                  left: "50%",
                  transform: "translateX(-50%)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.22)",
                }}
              >
                <CheckGlyph size={16} />
              </span>
            </div>

            {/* ── eyebrow: خط + "MOMZY BY HEBA" ── */}
            <div
              className="hero-rise inline-flex items-center gap-2.5 mb-4"
              dir="ltr"
              style={{ animationDelay: "0.05s" }}
            >
              <span style={{ width: 26, height: 2, background: "var(--yellow)", borderRadius: 2 }} />
              <span
                className="font-label uppercase"
                style={{ color: "rgba(255,255,255,0.9)", fontSize: 11.5, letterSpacing: "3px", fontWeight: 700 }}
              >
                Momzy by Heba
              </span>
            </div>

            {/* ── العنوان الرئيسي (Amiri) ── */}
            <h1
              className="hero-rise font-heading font-bold text-white"
              style={{
                fontSize: "clamp(30px, 4.4vw, 50px)",
                lineHeight: 1.28,
                marginBottom: 16,
                textShadow: "0 2px 10px rgba(150,40,60,0.18)",
                animationDelay: "0.15s",
              }}
            >
              {content.heroTagline}
              <br className="hidden sm:block" />
              <span style={{ color: "var(--yellow)" }}> {content.heroTaglineAccent}</span>
            </h1>

            {/* ── وصف قصير ── */}
            <p
              className="hero-rise mb-6 mx-auto md:mx-0"
              style={{
                color: "rgba(255,255,255,0.95)",
                fontSize: "clamp(14px, 1.5vw, 16px)",
                lineHeight: 1.8,
                maxWidth: 460,
                animationDelay: "0.28s",
              }}
            >
              <MomzyText text={content.heroIntro} highlightClassName="text-yellow italic font-semibold" />
            </p>

            {/* ── نقاط القيمة — خارج مقتطف البحث: Google كان يعرضها وصفًا («✓استشارات ✓منتجات…») ── */}
            <ul
              data-nosnippet
              className="hero-rise inline-flex flex-col gap-2.5 mb-7"
              style={{ animationDelay: "0.4s" }}
            >
              {content.heroPoints.map((text, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2.5 font-medium"
                  style={{ color: "rgba(255,255,255,0.97)", fontSize: "clamp(13.5px, 1.4vw, 15px)" }}
                >
                  <span
                    className="flex items-center justify-center shrink-0 rounded-full"
                    style={{
                      width: 19,
                      height: 19,
                      background: "var(--teal)",
                      color: "white",
                      fontSize: 11,
                      boxShadow: "0 2px 6px rgba(130,201,196,0.5)",
                    }}
                  >
                    <CheckGlyph size={11} />
                  </span>
                  {text}
                </li>
              ))}
            </ul>

            {/* ── أزرار CTA — primary أبيض + ghost شفاف ── */}
            <div
              className="hero-rise flex gap-3 flex-row justify-center md:justify-start"
              style={{ animationDelay: "0.52s" }}
            >
              <Link
                href="/services"
                className="btn-wobble inline-flex items-center justify-center gap-2 font-bold whitespace-nowrap flex-1 md:flex-none"
                style={{
                  background: "white",
                  color: "#3FA39D",
                  borderRadius: 50,
                  padding: "13px 26px",
                  fontWeight: 700,
                  boxShadow: "0 8px 22px rgba(0,0,0,0.16)",
                  fontSize: 15,
                  maxWidth: 190,
                }}
              >
                {tNav("services")}
                <DirArrow flip={!isRtl} />
              </Link>
              <Link
                href="/shop"
                className="btn-wobble inline-flex items-center justify-center gap-2 font-bold whitespace-nowrap flex-1 md:flex-none"
                style={{
                  background: "rgba(255,255,255,0.14)",
                  color: "white",
                  border: "1.5px solid rgba(255,255,255,0.55)",
                  borderRadius: 50,
                  padding: "13px 26px",
                  fontWeight: 700,
                  backdropFilter: "blur(6px)",
                  WebkitBackdropFilter: "blur(6px)",
                  fontSize: 15,
                  maxWidth: 190,
                }}
              >
                {t("hero.productsCta")}
                <DirArrow flip={!isRtl} />
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
