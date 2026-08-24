import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Container from "@/components/ui/Container";
import PageHeaderWave from "@/components/ui/PageHeaderWave";
import SectionWave from "@/components/ui/SectionWave";
import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";
import PolkaDots from "@/components/ui/PolkaDots";
import SectionsReveal from "@/components/ui/SectionsReveal";
import { getServices } from "@/lib/services/getServices";
import { getAboutPage } from "@/lib/sanity/queries/aboutPage";
import MomzyText from "@/components/ui/MomzyText";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

/** ألوان نقاط الشهادات (بالترتيب) */
const CRED_DOTS = ["var(--rose)", "var(--teal)", "#C09420"];

/** ستايل أيقونة الفلسفة (يتناوب حسب الترتيب) */
const PHIL_STYLE = [
  { bg: "var(--rosepale)", ring: "rgba(242,167,181,0.50)" },
  { bg: "var(--tealpale)", ring: "rgba(130,201,196,0.50)" },
  { bg: "var(--yellowlt)", ring: "rgba(247,223,152,0.70)" },
];

/** شعار النوع الملوّن — نفس أسلوب صفحة الخدمات */
const EMBLEM: Record<string, { bg: string; accent: string }> = {
  rose:   { bg: "linear-gradient(135deg,#FDE4EC,#F7C4CE)", accent: "#D9697A" },
  teal:   { bg: "linear-gradient(135deg,#D4EEED,#A8D8D5)", accent: "#4FA8A6" },
  yellow: { bg: "linear-gradient(135deg,#FEF4D0,#F7DF98)", accent: "#B8920A" },
  mint:   { bg: "linear-gradient(135deg,#DDF0EE,#A8D8D5)", accent: "#5DA9A4" },
};

/** أيقونة نوع الخدمة — SVG (نفس أيقونات صفحة الخدمات) */
function TypeIcon({ type }: { type: string }) {
  const common = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (type === "workshop") {
    return (
      <svg {...common}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }
  if (type === "online") {
    return (
      <svg {...common}>
        <rect x="2" y="4" width="14" height="13" rx="2" />
        <path d="m22 7-6 4 6 4V7z" />
      </svg>
    );
  }
  if (type === "home") {
    return (
      <svg {...common}>
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.5V21h14V9.5" />
        <path d="M9 21v-6h6v6" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M20 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 20l1.9-4.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

export default async function AboutPage() {
  const [services, about, t, tMenu] = await Promise.all([
    getServices(),
    getAboutPage(),
    getTranslations("about"),
    getTranslations("menu"),
  ]);
  const [nameFirst, ...nameRest] = about.name.split(" ");
  const nameAccent = nameRest.join(" ");

  return (
    <div style={{ background: "var(--offwh)", minHeight: "100vh" }}>

      {/* ═════════════ HERO — editorial فاخر ═════════════ */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #FFF5F7 0%, #FEF0F5 35%, #FAF6F0 70%, #EFF8F8 100%)",
          paddingTop: 48,
          paddingBottom: 116,
        }}
      >
        {/* هالات متدرّجة */}
        <div aria-hidden className="absolute pointer-events-none" style={{ width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle, rgba(130,201,196,0.22), transparent 70%)", top: -140, insetInlineEnd: "-8%", filter: "blur(20px)" }} />
        <div aria-hidden className="absolute pointer-events-none" style={{ width: 340, height: 340, borderRadius: "50%", background: "radial-gradient(circle, rgba(242,167,181,0.28), transparent 70%)", bottom: -110, insetInlineStart: "-6%", filter: "blur(20px)" }} />
        <PolkaDots colors={["#F2A7B5", "#82C9C4", "#F7DF98"]} opacity={0.14} count={12} />

        <Container>
          <div className="relative z-[2] grid grid-cols-1 md:grid-cols-[1fr_auto] gap-10 md:gap-16 items-center">

            {/* ── النص (يمين) ── */}
            <div className="order-2 md:order-1 text-center md:text-start">
              <div className="flex justify-center md:justify-start">
                <SectionLabel color="teal">{about.heroLabel}</SectionLabel>
              </div>

              <h1 className="font-heading font-bold mb-4" style={{ color: "var(--dark)", fontSize: "clamp(40px, 6vw, 64px)", lineHeight: 1.05 }}>
                {nameFirst} <span style={{ color: "var(--rose)", fontStyle: "italic" }}>{nameAccent}</span>
              </h1>

              {/* شهادات */}
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-5">
                {about.credentials.map((label, i) => (
                  <span key={i} className="font-label font-bold text-label inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full whitespace-nowrap" style={{ background: "white", color: "var(--dark)", border: "1px solid var(--bord)", boxShadow: "0 4px 14px rgba(0,0,0,0.05)" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: CRED_DOTS[i % CRED_DOTS.length] }} />
                    {label}
                  </span>
                ))}
              </div>

              <p className="text-body leading-[1.85] mb-6 mx-auto md:mx-0" style={{ color: "var(--mid)", fontFamily: "'Tajawal', sans-serif", maxWidth: 520 }}>
                {about.tagline}
              </p>

              {/* أرقام — صف أنيق بفواصل */}
              <div className="inline-flex items-center gap-5 sm:gap-7 rounded-[18px] px-6 py-4 mb-6" style={{ background: "rgba(255,255,255,0.72)", backdropFilter: "blur(8px)", border: "1.5px solid rgba(255,255,255,0.85)", boxShadow: "0 8px 28px rgba(0,0,0,0.05)" }}>
                {about.stats.map((s, i) => (
                  <div key={s.label} className="flex items-center gap-5 sm:gap-7">
                    {i > 0 && <span style={{ width: 1, height: 34, background: "var(--bord)" }} />}
                    <div className="text-center">
                      <div dir="ltr" className="font-bold whitespace-nowrap" style={{ color: "var(--teal)", fontFamily: "'Nunito', sans-serif", fontSize: "clamp(20px, 2.4vw, 26px)", letterSpacing: "-0.5px" }}>{s.number}</div>
                      <div className="leading-tight mt-0.5" style={{ color: "var(--mid)", fontFamily: "'Tajawal', sans-serif", fontSize: 11.5 }}>{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* توقيع */}
              <div className="flex items-center gap-3 justify-center md:justify-start mb-7">
                <span className="font-heading italic text-rose" style={{ fontSize: 28, lineHeight: 1 }}>{about.signature}</span>
                <span style={{ width: 36, height: 1.5, background: "var(--roselt)" }} />
                <span className="font-label uppercase text-light" style={{ fontSize: 10, letterSpacing: "2px" }}>Heba Hasan</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <Button variant="rose" href="/services" className="w-full sm:w-auto justify-center">{t("bookWithHeba")}</Button>
                <Button variant="outline-rose" href="/contact" className="w-full sm:w-auto justify-center">{tMenu("contact")}</Button>
              </div>
            </div>

            {/* ── الصورة (يسار) — إطار قوسي ── */}
            <div className="order-1 md:order-2 flex justify-center">
              <div className="relative w-[230px] md:w-[330px]">
                {/* شكل متدرّج خلف الصورة */}
                <div aria-hidden className="absolute" style={{ inset: -18, insetInlineStart: 20, top: 24, borderRadius: "160px 160px 32px 32px", background: "linear-gradient(150deg, var(--rose), var(--teal))", opacity: 0.9 }} />
                {/* نقاط ديكورية */}
                <span aria-hidden className="absolute" style={{ top: -14, insetInlineEnd: -10, width: 14, height: 14, borderRadius: "50%", background: "var(--yellow)" }} />
                <span aria-hidden className="absolute" style={{ bottom: 64, insetInlineStart: -16, width: 10, height: 10, borderRadius: "50%", background: "var(--teal)" }} />
                <span aria-hidden className="absolute font-heading" style={{ top: 6, insetInlineStart: -26, fontSize: 24, color: "var(--roselt)" }}>✦</span>

                {/* الصورة */}
                <div className="relative bg-cover border-[6px] border-white shadow-[0_28px_70px_rgba(217,105,122,0.30)]" style={{ aspectRatio: "4 / 5", borderRadius: "160px 160px 32px 32px", backgroundImage: `url('${about.image}')`, backgroundPosition: "center 12%" }}>
                  <span className="absolute flex items-center justify-center rounded-full border-[3px] border-white shadow-[0_6px_16px_rgba(0,0,0,0.18)]" style={{ background: "var(--teal)", color: "white", width: 44, height: 44, fontSize: 19, top: 16, insetInlineEnd: 16 }}>✓</span>
                </div>

                {/* بطاقة مؤسِّسة عائمة */}
                <div className="absolute flex items-center gap-2.5" style={{ bottom: -18, insetInlineStart: -16, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.7)", borderRadius: 16, padding: "10px 14px", boxShadow: "0 16px 40px rgba(0,0,0,0.14)" }}>
                  <span className="flex items-center justify-center rounded-full text-white font-bold shrink-0" style={{ width: 34, height: 34, background: "linear-gradient(135deg, var(--rose), var(--teal))", fontFamily: "'Nunito', sans-serif", fontSize: 14 }}>M</span>
                  <span className="font-heading font-bold leading-none" style={{ color: "var(--dark)", fontSize: 14 }}>{t("founderBadge")}</span>
                </div>
              </div>
            </div>
          </div>
        </Container>

        <PageHeaderWave fillColor="var(--offwh)" />
      </div>

      {/* ═════════════ القصة — اقتباس + bio ═════════════ */}
      <section className="relative reveal-section" style={{ zIndex: 2 }}>
        <Container>
          <div className="mx-auto pt-8 pb-14 max-w-[720px] text-center">
            <div className="flex justify-center mb-2">
              <SectionLabel color="teal" centered>{about.storyLabel}</SectionLabel>
            </div>

            {/* اقتباس كبير */}
            <p className="font-heading italic mx-auto mb-7" style={{ color: "var(--dark)", fontSize: "clamp(20px, 2.6vw, 30px)", lineHeight: 1.6, maxWidth: 640 }}>
              <MomzyText text={about.storyQuote} />
            </p>

            {about.storyParagraphs.map((para, i) => (
              <p key={i} className="text-body leading-[2] mb-4 last:mb-0" style={{ color: "var(--mid)", fontFamily: "'Tajawal', sans-serif" }}>
                {para}
              </p>
            ))}
          </div>
        </Container>
      </section>

      {/* ═════════════ فلسفتها — كيف ترافقك ═════════════ */}
      <section className="relative reveal-section" style={{ marginTop: -60, zIndex: 3 }}>
        <SectionWave fill="#FDFAF5" />
        <div className="relative overflow-hidden bg-offwh" style={{ marginTop: -1, paddingTop: 20, paddingBottom: 60 }}>
          <PolkaDots colors={["#F2A7B5", "#82C9C4", "#F7DF98"]} opacity={0.14} count={12} />
          <Container className="relative z-[2]">
            <div className="text-center mb-9 max-w-[600px] mx-auto">
              <div className="flex justify-center">
                <SectionLabel color="teal" centered>{about.philosophyLabel}</SectionLabel>
              </div>
              <h2 className="font-heading font-bold text-h2 mt-1" style={{ color: "var(--dark)" }}>
                {about.philosophyHeading}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 max-w-[780px] mx-auto">
              {about.philosophyValues.map((item, idx) => {
                const c = PHIL_STYLE[idx % 3];
                return (
                  <div key={idx} className="group flex items-start gap-4 text-start">
                    <span className="flex items-center justify-center rounded-full shrink-0 overflow-hidden [transition:transform_260ms_cubic-bezier(0.23,1,0.32,1)] group-hover:scale-105" style={{ width: 54, height: 54, background: c.bg, border: `1.5px solid ${c.ring}` }}>
                      {item.icon && <Image src={item.icon} alt="" width={28} height={28} className="object-contain" />}
                    </span>
                    <div className="pt-1">
                      <h3 className="font-heading font-bold text-dark mb-1" style={{ fontSize: 16.5 }}>{item.title}</h3>
                      <p className="text-mid leading-[1.6]" style={{ fontSize: 13.5 }}>{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Container>
        </div>
      </section>

      {/* ═════════════ خدماتها ═════════════ */}
      <section className="relative reveal-section" style={{ marginTop: -60, zIndex: 4 }}>
        <SectionWave fill="var(--cream)" />
        <div style={{ background: "var(--cream)", marginTop: -1, paddingTop: 20, paddingBottom: 64 }}>
          <Container>
            <div className="text-center mb-8 max-w-[600px] mx-auto">
              <div className="flex justify-center">
                <SectionLabel color="rose" centered>{about.servicesLabel}</SectionLabel>
              </div>
              <h2 className="font-heading font-bold text-h2 mt-1" style={{ color: "var(--dark)" }}>
                {about.servicesHeading}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[860px] mx-auto">
              {services.map((service) => {
                const e = EMBLEM[service.color] ?? EMBLEM.rose;
                return (
                <a
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  className="group bg-white rounded-[16px] border-[1.5px] border-bord relative overflow-hidden flex items-start gap-3.5 [transition:transform_280ms_cubic-bezier(0.23,1,0.32,1),box-shadow_280ms_ease,border-color_200ms_ease] hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(0,0,0,0.09)] hover:border-transparent"
                  style={{ padding: "18px 20px" }}
                >
                  <span className="w-11 h-11 rounded-[12px] flex items-center justify-center shrink-0 shadow-sm" style={{ background: e.bg, color: e.accent }}>
                    <TypeIcon type={service.type} />
                  </span>
                  <div>
                    <p className="font-heading font-bold mb-1.5 leading-snug" style={{ color: "var(--dark)", fontSize: 15.5 }}>{service.title}</p>
                    <p className="leading-[1.7] line-clamp-2" style={{ color: "var(--mid)", fontFamily: "'Tajawal', sans-serif", fontSize: 13 }}>{service.shortDescription}</p>
                  </div>
                </a>
                );
              })}
            </div>
          </Container>
        </div>
      </section>

      {/* ═════════════ CTA نهائي ═════════════ */}
      <section className="relative overflow-hidden reveal-section" style={{ marginTop: -60, zIndex: 5 }}>
        <SectionWave fill="var(--rosepale)" />
        <div className="relative overflow-hidden" style={{ background: "var(--rosepale)", marginTop: -2 }}>
          <PolkaDots colors={["#F2A7B5", "#82C9C4", "#F7DF98"]} opacity={0.12} count={10} />
          <Container>
            <div className="text-center relative z-10 pt-10 pb-8" style={{ maxWidth: 600, margin: "0 auto" }}>
              <div className="flex justify-center mb-3">
                <SectionLabel color="teal" centered>{about.ctaLabel}</SectionLabel>
              </div>
              <h2 className="text-h2 font-heading font-bold mb-3" style={{ color: "var(--dark)", lineHeight: 1.25 }}>
                <MomzyText text={about.ctaHeading} />
              </h2>
              <p className="text-body mb-6" style={{ color: "var(--mid)", fontFamily: "'Tajawal', sans-serif", lineHeight: 1.9 }}>
                {about.ctaText}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="rose" href="/services" className="w-full sm:w-auto justify-center">{t("exploreServices")}</Button>
                <Button variant="outline-rose" href="/contact" className="w-full sm:w-auto justify-center">{tMenu("contact")}</Button>
              </div>
            </div>
          </Container>

          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: 60 }} aria-hidden="true">
            <path d="M0,20 C240,60 480,0 720,30 C960,60 1200,0 1440,20 L1440,60 L0,60 Z" fill="var(--offwh)" />
          </svg>
        </div>
      </section>

      <SectionsReveal />
    </div>
  );
}
