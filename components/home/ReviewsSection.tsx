import Container from "@/components/ui/Container";
import { cn } from "@/lib/utils/cn";
import { REVIEWS } from "@/lib/utils/constants";
import PolkaDots from "@/components/ui/PolkaDots";

/** عدد النجوم في كل تقييم */
const STARS_COUNT = 5;

/** قسم تقييمات الأمهات */
export default function ReviewsSection() {
  return (
    /** ─ الـ section شفاف — الـ wave يغطي نهاية ArticlesSection ─ */
    <section className="relative reveal-section" style={{ marginTop: -40, zIndex: 6 }}>

      {/* ── موجة أعلى القسم — gradient يطابق خلفية القسم ── */}
      <svg
        viewBox="0 0 1440 40"
        preserveAspectRatio="none"
        style={{ display: "block", width: "100%", height: 40 }}
        aria-hidden="true"
      >
        <path d="M0,20 C480,0 960,0 1440,20 L1440,40 L0,40 Z" fill="#F5D98E" />
      </svg>

      {/* ── محتوى القسم ── */}
      <div
        className="relative overflow-hidden bg-gradient-to-b from-[#F5D98E] to-[#FB9AB4]"
        style={{ marginTop: -1, paddingTop: 16, paddingBottom: 60 }}
      >
        {/* نقاط ديكورية متحركة */}
        <PolkaDots colors={["#ffffff", "#FEF5F7", "#FEFBF0"]} opacity={0.2} count={14} />

        <Container className="relative z-[2]">
          {/* عنوان القسم */}
          <div className="text-center mb-[52px]">
            <div className="font-label text-[18px] font-bold tracking-[3px] uppercase text-dark flex items-center justify-center gap-2 mb-3.5">
              <span>تجارب حقيقية</span>
            </div>
            <h2 className="font-heading text-[clamp(28px,3.5vw,44px)] font-bold text-dark">
              ماذا قالت <span className="text-white italic">الأمهات</span>؟
            </h2>
          </div>

          {/* شبكة التقييمات */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {REVIEWS.map((review) => (
              <div
                key={review.name}
                className="bg-white rounded-[22px] p-[26px] shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-250 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.12)]"
              >
                {/* النجوم */}
                <div className="text-[13px] text-[#D4A820] tracking-[2px] mb-3.5">
                  {"★".repeat(STARS_COUNT)}
                </div>

                {/* الاقتباس */}
                <p className="font-heading text-[15px] italic text-mid leading-[1.8] mb-5">
                  &ldquo;{review.quote}&rdquo;
                </p>

                {/* معلومات المراجعة */}
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center text-sm font-extrabold text-white shrink-0 font-label",
                      review.avatarBg
                    )}
                  >
                    {review.initial}
                  </span>
                  <div>
                    <div className="text-[13px] font-bold text-dark">{review.name}</div>
                    <div className="text-[11px] text-light">{review.info}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </div>

    </section>
  );
}
