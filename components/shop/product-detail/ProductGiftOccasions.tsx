import Container from "@/components/ui/Container";
import SectionLabel from "@/components/ui/SectionLabel";

/** المناسبات التي يكون فيها صندوق Momzy هدية مثالية */
const OCCASIONS = [
  {
    emoji: "🤰",
    title: "Baby Shower",
    description: "احتفال قبل الولادة بأسبوعين أو ثلاثة",
    color: "rose" as const,
  },
  {
    emoji: "👶",
    title: "بعد الولادة مباشرة",
    description: "أوّل ٤٨ ساعة — لحظة تحتاج فيها الحضن",
    color: "teal" as const,
  },
  {
    emoji: "💝",
    title: "زيارة أوّل شهر",
    description: "بدل باقة الورد التقليدية — هدية تبقى",
    color: "yellow" as const,
  },
  {
    emoji: "💐",
    title: "عيد الأمومة الأوّل",
    description: "أول عيد ميلاد لها كأم",
    color: "mint" as const,
  },
];

/** خريطة الألوان */
const COLOR_MAP = {
  rose:   { bg: "var(--rosepale)",   border: "rgba(242,167,181,0.20)", accent: "var(--rose)" },
  teal:   { bg: "var(--tealpale)",   border: "rgba(130,201,196,0.20)", accent: "var(--teal)" },
  yellow: { bg: "rgba(247,223,152,0.28)", border: "rgba(247,223,152,0.55)", accent: "#C09420" },
  mint:   { bg: "rgba(168,216,213,0.18)", border: "rgba(168,216,213,0.40)", accent: "#6BB5B0" },
};

/**
 * قسم "متى تُهدي Momzy؟" — يساعد المُهدية على تحديد التوقيت المناسب
 * ويعزّز التموضع الهدية للمنتج.
 */
export default function ProductGiftOccasions() {
  return (
    <section
      style={{
        background: "var(--cream)",
        padding: "28px 0 clamp(80px, 10vw, 120px)",
      }}
    >
      <Container>
        <div className="mb-12 text-center">
          <SectionLabel color="teal" centered>متى تُهدي؟</SectionLabel>
          <h2
            className="text-h2 font-heading font-bold"
            style={{ color: "var(--dark)", lineHeight: 1.2 }}
          >
            كل لحظة تستحق <span style={{ color: "var(--rose)", fontStyle: "italic" }}>الاحتفال</span>
          </h2>
          <p
            className="mt-4 text-body leading-[1.85] mx-auto"
            style={{ color: "var(--mid)", fontFamily: "'Tajawal', sans-serif", maxWidth: 580 }}
          >
            صندوق مشوار أم ليس مرتبطاً بمناسبة واحدة — هو لكل لحظة في رحلة الأم الجديدة.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 max-w-[1100px] mx-auto">
          {OCCASIONS.map((occasion) => {
            const c = COLOR_MAP[occasion.color];
            return (
              <div
                key={occasion.title}
                className="bg-white rounded-[20px] p-6 text-center [transition:transform_280ms_cubic-bezier(0.23,1,0.32,1),box-shadow_280ms_ease,border-color_280ms_ease] hover:-translate-y-1.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)]"
                style={{ border: `1.5px solid ${c.border}` }}
              >
                {/* أيقونة الإيموجي داخل دائرة ملونة */}
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: c.bg, fontSize: 32 }}
                >
                  {occasion.emoji}
                </div>

                <h3
                  className="font-heading font-bold text-body mb-2"
                  style={{ color: c.accent, lineHeight: 1.3 }}
                >
                  {occasion.title}
                </h3>

                <p
                  className="text-body-sm leading-[1.7]"
                  style={{ color: "var(--mid)", fontFamily: "'Tajawal', sans-serif" }}
                >
                  {occasion.description}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
