import Image from "next/image";
import Container from "@/components/ui/Container";
import SectionLabel from "@/components/ui/SectionLabel";
import PolkaDots from "@/components/ui/PolkaDots";
import SectionWave from "@/components/ui/SectionWave";

/** نقاط "ليش Momzy" — أعيدت صياغتها من قصة Momzy، أوصاف قصيرة مدمجة */
const WHY_POINTS = [
  {
    icon: "/icons/services-icon.png",
    color: "rose" as const,
    title: "معرفة مهنية حقيقية",
    desc: "خبرة هبة المعتمدة بين يديكِ، لا نصائح عامة.",
  },
  {
    icon: "/icons/products-icon.png",
    color: "teal" as const,
    title: "منتجات مختارة بحب",
    desc: "كل منتج جرّبته هبة على أساس علمي موثوق.",
  },
  {
    icon: "/icons/blog-icon.png",
    color: "yellow" as const,
    title: "مجتمع يفهمكِ",
    desc: "مساحة آمنة تجمع أمهات يمررن برحلتك.",
  },
  {
    icon: "/icons/heart-icon.png",
    color: "rose" as const,
    title: "طفلك في القلب",
    desc: "دعمك كأم ينعكس على بداية حياة طفلك.",
  },
];

/** خلفية الأيقونة + حلقة ملونة خفيفة لكل لون */
const ICON_STYLE: Record<"rose" | "teal" | "yellow", { bg: string; ring: string }> = {
  rose:   { bg: "var(--rosepale)", ring: "rgba(242,167,181,0.50)" },
  teal:   { bg: "var(--tealpale)", ring: "rgba(130,201,196,0.50)" },
  yellow: { bg: "var(--yellowlt)", ring: "rgba(247,223,152,0.70)" },
};

/** قسم "ليش Momzy؟" — لماذا تختارين Momzy (القصة + القيم) */
export default function WhyMomzySection() {
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
              <SectionLabel color="teal" centered>قصتنا</SectionLabel>
            </div>
            <h2 className="font-heading text-h2 font-bold text-dark mb-4">
              ليش <span className="text-rose italic">Momzy</span>؟
            </h2>
            <p className="text-body leading-[1.9] text-mid">
              كل شي بدأ من قلب التجربة. <strong className="text-dark">هبة حسن</strong> — ممرضة
              معتمدة ومرافقة ولادة — رافقت أكثر من{" "}
              <span className="font-bold" style={{ color: "var(--teal)" }}>1000 أم</span>، وآمنت إنّ
              كل أم تستحق دعمًا حقيقيًا بأهم مرحلة في حياتها. هيك وُلدت{" "}
              <strong className="text-rose">Momzy</strong>.
            </p>
          </div>

          {/* ── قيم Momzy — صفوف أنيقة (أيقونة + عنوان + وصف) ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 max-w-[780px] mx-auto">
            {WHY_POINTS.map((point) => {
              const s = ICON_STYLE[point.color];
              return (
                <div key={point.title} className="group flex items-start gap-4 text-right">
                  {/* الأيقونة في دائرة ملونة بحلقة خفيفة */}
                  <span
                    className="flex items-center justify-center rounded-full shrink-0 [transition:transform_260ms_cubic-bezier(0.23,1,0.32,1)] group-hover:scale-105"
                    style={{ width: 54, height: 54, background: s.bg, border: `1.5px solid ${s.ring}` }}
                  >
                    <Image src={point.icon} alt="" width={28} height={28} className="object-contain" />
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
              «في Momzy نؤمن أن بداية الأمومة لحظة مفصلية — لحظة تتشكّل فيها تجربة الأم، وتبدأ فيها قصة حياة طفل جديد.»
            </p>
          </div>

        </Container>
      </div>

    </section>
  );
}
