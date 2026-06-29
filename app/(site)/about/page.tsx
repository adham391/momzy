import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import PageHeaderWave from "@/components/ui/PageHeaderWave";
import SectionWave from "@/components/ui/SectionWave";
import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";
import PolkaDots from "@/components/ui/PolkaDots";
import SectionsReveal from "@/components/ui/SectionsReveal";
import { getServices } from "@/lib/services/getServices";
import type { Service, ServiceColor } from "@/lib/services/types";

export const metadata: Metadata = {
  title: "عن هبة حسن | Momzy",
  description: "هبة حسن — ممرضة معتمدة ومرشدة رضاعة ومرافقة ولادة، مؤسِّسة Momzy",
};

/** شارة خبرة — نقطة ملونة + نص داكن على خلفية بيضاء */
function CredBadge({ label, color = "rose" }: { label: string; color?: "rose" | "teal" | "yellow" }) {
  const COLOR_MAP = {
    rose:   { dot: "var(--rose)" },
    teal:   { dot: "var(--teal)" },
    yellow: { dot: "#C09420"     },
  };
  const { dot } = COLOR_MAP[color];
  return (
    <span
      className="font-label font-bold text-label inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full whitespace-nowrap"
      style={{
        background: "white",
        color: "var(--dark)",
        border: "1px solid var(--bord)",
        letterSpacing: "0.3px",
      }}
    >
      <span
        style={{
          width: 6, height: 6, borderRadius: "50%",
          background: dot, flexShrink: 0,
        }}
      />
      {label}
    </span>
  );
}

/** رقم إنجاز — رقم كبير + label تحته */
function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <p
        className="font-bold text-h3 whitespace-nowrap"
        dir="ltr"
        style={{ color: "var(--teal)", fontFamily: "'Nunito', sans-serif", letterSpacing: "-0.5px" }}
      >
        {number}
      </p>
      <p
        className="text-body-sm leading-tight mt-1"
        style={{ color: "var(--mid)", fontFamily: "'Tajawal', sans-serif" }}
      >
        {label}
      </p>
    </div>
  );
}

/** أيقونة حسب نوع الخدمة */
const TYPE_EMOJI: Record<Service["type"], string> = {
  workshop:   "👥",
  individual: "💬",
  online:     "💻",
  home:       "🏠",
};

/** بطاقة خدمة — نمط OfferSection: شريط ملون + أيقونة + عنوان + وصف */
function ServiceItem({ service }: { service: Service }) {
  const COLOR_MAP: Record<ServiceColor, { bar: string; iconBg: string }> = {
    rose:   { bar: "linear-gradient(to left, var(--rose), var(--roselt))", iconBg: "linear-gradient(135deg, #fde4ec, var(--rosepale))" },
    teal:   { bar: "linear-gradient(to left, var(--teal), var(--mint))",   iconBg: "linear-gradient(135deg, #d4eeed, var(--tealpale))" },
    yellow: { bar: "linear-gradient(to left, var(--yellow), #f5d858)",     iconBg: "linear-gradient(135deg, #faedc8, var(--yellowlt))" },
    mint:   { bar: "linear-gradient(to left, var(--mint), #c5e4e1)",       iconBg: "linear-gradient(135deg, #d4eeed, rgba(168,216,213,0.4))" },
  };
  const c = COLOR_MAP[service.color];

  return (
    <Link
      href={`/services/${service.slug}`}
      className="bg-white rounded-[16px] p-[18px_20px] border-[1.5px] border-bord relative overflow-hidden flex items-start gap-3.5 [transition:transform_280ms_cubic-bezier(0.23,1,0.32,1),box-shadow_280ms_ease,border-color_200ms_ease] hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(0,0,0,0.09)] hover:border-transparent"
    >
      <span
        className="h-1 rounded-t-[22px] absolute top-0 left-0 right-0"
        style={{ background: c.bar }}
      />

      <span
        className="w-11 h-11 rounded-[12px] flex items-center justify-center shrink-0"
        style={{ background: c.iconBg, fontSize: 22 }}
      >
        {TYPE_EMOJI[service.type]}
      </span>

      <div className="pt-2.5">
        <p className="font-heading font-bold text-body mb-1.5" style={{ color: "var(--dark)" }}>{service.title}</p>
        <p className="text-body-sm leading-[1.7]" style={{ color: "var(--mid)", fontFamily: "'Tajawal', sans-serif" }}>{service.shortDescription}</p>
      </div>
    </Link>
  );
}

export default async function AboutPage() {
  // جلب الخدمات الفعلية من Sanity / seed
  const services = await getServices();

  return (
    <div style={{ background: "var(--offwh)", minHeight: "100vh" }}>

      {/* ═════════════ HERO احترافي — 2 أعمدة: صورة + كل المعلومات ═════════════ */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #FFF5F7 0%, #FEF0F5 35%, #FAF6F0 70%, #EFF8F8 100%)",
          paddingTop: 56,
          paddingBottom: 120,
        }}
      >
        {/* ── Blobs ديكورية كبيرة ── */}
        <div
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            width: 420, height: 420, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(130,201,196,0.22) 0%, transparent 70%)",
            top: -140, right: "-8%",
            filter: "blur(20px)",
          }}
        />
        <div
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            width: 320, height: 320, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(242,167,181,0.28) 0%, transparent 70%)",
            bottom: -100, left: "-5%",
            filter: "blur(20px)",
          }}
        />
        <div
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            width: 200, height: 200, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(247,223,152,0.25) 0%, transparent 70%)",
            top: "30%", left: "30%",
            filter: "blur(30px)",
          }}
        />

        {/* PolkaDots خفيفة فوق */}
        <PolkaDots colors={["#F2A7B5", "#82C9C4", "#F7DF98"]} opacity={0.15} count={12} />

        <Container>
          <div className="relative z-[2] grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 lg:gap-16 items-center">

            {/* ── العمود الأيمن (RTL: الأول) — كل المعلومات ── */}
            <div className="order-2 lg:order-1">

              {/* Label */}
              <div className="mb-3">
                <SectionLabel color="teal">تعرفي على المؤسِّسة</SectionLabel>
              </div>

              {/* الاسم — كبير وفخم */}
              <h1
                className="font-heading font-bold text-display mb-4"
                style={{ color: "var(--dark)", lineHeight: 1.1 }}
              >
                هبة <span style={{ color: "var(--rose)", fontStyle: "italic" }}>حسن</span>
              </h1>

              {/* Tagline */}
              <p
                className="text-body leading-[1.8] mb-5"
                style={{
                  color: "var(--mid)",
                  fontFamily: "'Tajawal', sans-serif",
                  maxWidth: 540,
                }}
              >
                ممرضة معتمدة، مرشدة رضاعة، ومرافقة ولادة — مع أكثر من 3 سنوات من الخبرة الميدانية في رعاية الأمهات وأطفالهن.
              </p>

              {/* شارات الخبرة */}
              <div className="flex flex-wrap gap-2 mb-7">
                <CredBadge label="ممرضة معتمدة" color="rose" />
                <CredBadge label="مرشدة رضاعة" color="teal" />
                <CredBadge label="مرافقة ولادة" color="yellow" />
              </div>

              {/* أرقام إنجازات */}
              <div
                className="grid grid-cols-3 gap-2 sm:gap-4 rounded-[18px] p-4 sm:p-5 mb-7 max-w-[480px]"
                style={{
                  background: "rgba(255,255,255,0.7)",
                  backdropFilter: "blur(8px)",
                  border: "1.5px solid rgba(255,255,255,0.8)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
                }}
              >
                <StatCard number="+1000" label="أم تحت رعايتها" />
                <StatCard number="+3"    label="سنوات خبرة" />
                <StatCard number="+500"  label="جلسة استشارية" />
              </div>

              {/* أزرار */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="rose" href="/services" className="w-full sm:w-auto justify-center">احجزي مع هبة ←</Button>
                <Button variant="outline-rose" href="/contact" className="w-full sm:w-auto justify-center">تواصلي معنا</Button>
              </div>
            </div>

            {/* ── العمود الأيسر (RTL: الثاني) — صورة الأفاتار مع إطار فني ── */}
            <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
              <div className="relative">
                {/* خلفية ديكورية خلف الصورة */}
                <div
                  aria-hidden
                  className="absolute -inset-6 rounded-[36px]"
                  style={{
                    background: "linear-gradient(135deg, var(--rose) 0%, var(--teal) 100%)",
                    opacity: 0.1,
                    transform: "rotate(-3deg)",
                  }}
                />
                <div
                  aria-hidden
                  className="absolute -inset-4 rounded-[32px]"
                  style={{
                    background: "linear-gradient(135deg, var(--rosepale) 0%, var(--tealpale) 100%)",
                    transform: "rotate(2deg)",
                  }}
                />

                {/* صورة الأفاتار */}
                <div
                  className="relative rounded-[28px] overflow-hidden flex items-center justify-center"
                  style={{
                    width: 280, height: 320,
                    background: "linear-gradient(135deg, #FFE9EE 0%, #E2F2F1 100%)",
                    border: "3px solid white",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.10), 0 6px 20px rgba(242,167,181,0.20)",
                    fontSize: 140,
                  }}
                >
                  👩‍⚕️
                  {/* TODO: استبدال بصورة هبة الحقيقية من Sanity */}
                </div>

                {/* badge عائم — "Momzy founder" */}
                <div
                  className="absolute -bottom-4 -start-4 bg-white rounded-[16px] p-3 flex items-center gap-2.5"
                  style={{
                    border: "1.5px solid var(--bord)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  }}
                >
                  <span
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold"
                    style={{
                      background: "linear-gradient(135deg, var(--rose), var(--teal))",
                      fontFamily: "'Nunito', sans-serif",
                      fontSize: 14,
                    }}
                  >
                    M
                  </span>
                  <p className="font-heading font-bold text-body-sm leading-none" style={{ color: "var(--dark)" }}>
                    مؤسِّسة Momzy
                  </p>
                </div>

              </div>
            </div>
          </div>
        </Container>

        <PageHeaderWave fillColor="var(--offwh)" />
      </div>

      {/* ═════════════ قسم القصة — bio مفصّل ═════════════ */}
      <section className="relative reveal-section" style={{ zIndex: 2 }}>
        <Container>
          <div className="mx-auto pt-6 pb-16 max-w-[760px] text-center">
            <div className="flex justify-center mb-2">
              <SectionLabel color="teal" centered>قصتها</SectionLabel>
            </div>
            <h2 className="font-heading font-bold text-h2 mb-6" style={{ color: "var(--dark)", lineHeight: 1.3 }}>
              من أول نبضة قلب — <span style={{ color: "var(--rose)", fontStyle: "italic" }}>هبة بجانبك</span>
            </h2>
            <p
              className="text-body leading-[2] mb-4"
              style={{ color: "var(--mid)", fontFamily: "'Tajawal', sans-serif" }}
            >
              هبة حسن مؤسِّسة منصة Momzy، انطلقت من خبرة ميدانية حقيقية في مرافقة الأمهات. بفهم عميق لاحتياجات الأم في مراحلها المختلفة، تقدّم هبة معرفة دقيقة ودعماً حقيقياً مبنياً على تجربة واقعية.
            </p>
            <p
              className="text-body leading-[2]"
              style={{ color: "var(--mid)", fontFamily: "'Tajawal', sans-serif" }}
            >
              من أول نبضة قلب حتى الخطوة الأولى لطفلك — هبة بجانبك بعلم وحب وشغف حقيقي.
            </p>
          </div>
        </Container>
      </section>

      {/* ═════════════ قسم خدماتها — zIndex 3 ═════════════ */}
      <section className="relative reveal-section" style={{ marginTop: -60, zIndex: 3 }}>
        <SectionWave fill="var(--cream)" />
        <div style={{ background: "var(--cream)", marginTop: -1, paddingTop: 40, paddingBottom: 80 }}>
          <Container>
            <div className="text-center mb-12 max-w-[640px] mx-auto">
              <div className="flex justify-center">
                <SectionLabel color="teal" centered>خدماتها</SectionLabel>
              </div>
              <h2
                className="font-heading font-bold text-h2 mt-2 mb-4"
                style={{ color: "var(--rose)", lineHeight: 1.25 }}
              >
                ماذا تقدم هبة؟
              </h2>
              <p
                className="text-body leading-[1.85]"
                style={{ color: "var(--dark)", fontFamily: "'Tajawal', sans-serif" }}
              >
                خدمات شاملة تواكبك في كل مرحلة — من الحمل إلى السنة الأولى لطفلك.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[900px] mx-auto">
              {services.map((service) => (
                <ServiceItem key={service.slug} service={service} />
              ))}
            </div>
          </Container>
        </div>
      </section>

      {/* ═════════════ CTA نهائي — zIndex 4 ═════════════ */}
      <section className="relative overflow-hidden reveal-section" style={{ marginTop: -60, zIndex: 4 }}>
        <SectionWave fill="var(--rosepale)" />
        <div
          className="relative overflow-hidden"
          style={{
            background: "var(--rosepale)",
            marginTop: -2,
            padding: "8px 0 0",
          }}
        >
          <PolkaDots colors={["#F2A7B5", "#82C9C4", "#F7DF98"]} opacity={0.12} count={10} />

          <Container>
            <div className="text-center relative z-10 py-8" style={{ maxWidth: 600, margin: "0 auto" }}>
              <div className="flex justify-center mb-4">
                <SectionLabel color="teal" centered className="text-xl">جاهزة للبدء؟</SectionLabel>
              </div>

              <h2 className="text-h2 font-heading font-bold mb-4" style={{ color: "var(--dark)", lineHeight: 1.25 }}>
                دعينا نبدأ رحلتك مع هبة
              </h2>

              <p
                className="text-body mb-6"
                style={{ color: "var(--mid)", fontFamily: "'Tajawal', sans-serif", lineHeight: 1.9 }}
              >
                اختاري الخدمة التي تناسبك أو تواصلي معنا للمساعدة في الاختيار.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                <Button variant="rose" href="/services" className="w-full sm:w-auto justify-center">استكشفي الخدمات ←</Button>
                <Button variant="outline-rose" href="/contact" className="w-full sm:w-auto justify-center">تواصلي معنا</Button>
              </div>
            </div>
          </Container>

          <svg
            viewBox="0 0 1440 60"
            preserveAspectRatio="none"
            style={{ display: "block", width: "100%", height: 60, marginTop: 0 }}
            aria-hidden="true"
          >
            <path
              d="M0,20 C240,60 480,0 720,30 C960,60 1200,0 1440,20 L1440,60 L0,60 Z"
              fill="var(--offwh)"
            />
          </svg>
        </div>
      </section>

      <SectionsReveal />
    </div>
  );
}
