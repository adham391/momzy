import Image from "next/image";
import Container from "@/components/ui/Container";
import SectionLabel from "@/components/ui/SectionLabel";
import PolkaDots from "@/components/ui/PolkaDots";
import SectionWave from "@/components/ui/SectionWave";
import MomzyText from "@/components/ui/MomzyText";
import type { HomePageContent } from "@/lib/sanity/queries/homePage";

/** خلفية الأيقونة + حلقة ملونة خفيفة لكل لون (تتناوب حسب الترتيب) */
const ICON_STYLE = [
  { bg: "var(--rosepale)", ring: "rgba(242,167,181,0.50)" },
  { bg: "var(--tealpale)", ring: "rgba(130,201,196,0.50)" },
  { bg: "var(--yellowlt)", ring: "rgba(247,223,152,0.70)" },
];

/** قسم "ليش Momzy؟" — المحتوى من Sanity (مع fallback) */
export default function WhyMomzySection({ content }: { content: HomePageContent }) {
  return (
    /** ─ الـ section شفاف — الـ wave يغطي نهاية الهيرو ─ */
    <section className="relative reveal-section" style={{ marginTop: -60, zIndex: 2 }}>

      {/* ── موجة أعلى القسم ── */}
      <SectionWave fill="#FDFAF5" />

      {/* ── محتوى القسم ── */}
      <div className="relative overflow-hidden bg-offwh" style={{ marginTop: -1, paddingTop: 20, paddingBottom: 60 }}>
        <PolkaDots colors={["#F2A7B5", "#82C9C4", "#F7DF98"]} opacity={0.16} count={14} />

        <Container className="relative z-[2]">

          {/* ── العنوان + القصة ── */}
          <div className="text-center max-w-[640px] mx-auto mb-9">
            <div className="flex justify-center">
              <SectionLabel color="teal" centered>{content.whyLabel}</SectionLabel>
            </div>
            <h2 className="font-heading text-h2 font-bold text-dark mb-4">
              <MomzyText text={content.whyHeading} />
            </h2>
            <p className="text-body leading-[1.9] text-mid">
              <MomzyText text={content.whyIntro} />
            </p>
          </div>

          {/* ── قيم Momzy — صفوف أنيقة (أيقونة + عنوان + وصف) ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 max-w-[780px] mx-auto">
            {content.whyValues.map((point, idx) => {
              const s = ICON_STYLE[idx % 3];
              return (
                <div key={idx} className="group flex items-start gap-4 text-right">
                  {/* الأيقونة في دائرة ملونة بحلقة خفيفة */}
                  <span
                    className="flex items-center justify-center rounded-full shrink-0 overflow-hidden [transition:transform_260ms_cubic-bezier(0.23,1,0.32,1)] group-hover:scale-105"
                    style={{ width: 54, height: 54, background: s.bg, border: `1.5px solid ${s.ring}` }}
                  >
                    {point.icon && (
                      <Image src={point.icon} alt="" width={28} height={28} className="object-contain" />
                    )}
                  </span>
                  {/* العنوان + الوصف */}
                  <div className="pt-1">
                    <h3 className="font-heading font-bold text-dark mb-1" style={{ fontSize: 16.5 }}>
                      {point.title}
                    </h3>
                    <p className="text-mid leading-[1.6]" style={{ fontSize: 13.5 }}>
                      {point.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── اقتباس ختامي ── */}
          <div className="text-center mt-10">
            <p
              className="font-heading italic text-mid mx-auto max-w-[620px] md:max-w-none md:whitespace-nowrap"
              style={{ fontSize: "clamp(15px, 1.7vw, 18px)", lineHeight: 1.9 }}
            >
              <MomzyText text={content.whyQuote} />
            </p>
          </div>

        </Container>
      </div>

    </section>
  );
}
