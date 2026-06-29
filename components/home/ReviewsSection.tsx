import Container from "@/components/ui/Container";
import SectionLabel from "@/components/ui/SectionLabel";
import PolkaDots from "@/components/ui/PolkaDots";
import SectionWave from "@/components/ui/SectionWave";
import { getReviews } from "@/lib/reviews/getReviews";
import type { ReviewColor } from "@/lib/reviews/types";

/** خريطة لون الأفاتار → CSS class */
const AVATAR_BG: Record<ReviewColor, string> = {
  rose:   "bg-rose",
  teal:   "bg-gradient-to-br from-teal to-mint",
  yellow: "bg-gradient-to-br from-[#C09420] to-yellow",
  mint:   "bg-gradient-to-br from-mint to-teal",
};

/** قسم تقييمات الأمهات — يقرأ من Sanity مع fallback إلى seed */
export default async function ReviewsSection() {
  const reviews = await getReviews();
  if (reviews.length === 0) return null;

  // إذا كان عدد الآراء ≤ 4 → عرض شبكة عادية
  // إذا أكثر → Carousel أفقي قابل للسحب
  const useCarousel = reviews.length > 4;

  return (
    /** ─ الـ section شفاف — الـ wave يغطي نهاية ArticlesSection ─ */
    <section className="relative reveal-section" style={{ marginTop: -60, zIndex: 6 }}>

      {/* ── موجة أعلى القسم ── */}
      <SectionWave fill="#F5D98E" />

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
            <div className="flex justify-center">
              <SectionLabel color="teal" centered>تجارب حقيقية</SectionLabel>
            </div>
            <h2 className="font-heading text-h2 font-bold text-dark">
              ماذا قالت <span className="text-rose italic">الأمهات؟</span>
            </h2>
            {useCarousel && (
              <p className="text-body-sm mt-3" style={{ color: "var(--mid)", fontFamily: "'Tajawal', sans-serif" }}>
                اسحبي ←→ لرؤية المزيد من الآراء
              </p>
            )}
          </div>

          {useCarousel ? (
            /* ── Carousel أفقي — لما يصير عدد الآراء أكثر من 4 ── */
            <div
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 scrollbar-hide"
              style={{ scrollbarWidth: "none" }}
            >
              {reviews.map((review) => (
                <div
                  key={review.slug}
                  className="snap-start shrink-0 w-[280px] sm:w-[320px] md:w-[calc((100%-3rem)/4)]"
                >
                  <ReviewCard review={review} />
                </div>
              ))}
            </div>
          ) : (
            /* ── شبكة عادية — لما العدد ≤ 4 ── */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {reviews.map((review) => (
                <ReviewCard key={review.slug} review={review} />
              ))}
            </div>
          )}
        </Container>
      </div>

    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   كارد التقييم الموحّد — يُستخدم في الشبكة والـ Carousel
   ───────────────────────────────────────────────────────── */
import type { Review } from "@/lib/reviews/types";

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="bg-white rounded-[22px] p-[26px] shadow-[0_4px_20px_rgba(0,0,0,0.08)] [transition:transform_250ms_cubic-bezier(0.23,1,0.32,1),box-shadow_250ms_ease] hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.12)] h-full">
      {/* النجوم */}
      <div className="text-[13px] text-[#D4A820] tracking-[2px] mb-3.5">
        {"★".repeat(review.rating)}
      </div>

      {/* الاقتباس */}
      <p className="font-heading text-body italic text-mid leading-[1.8] mb-5">
        &ldquo;{review.quote}&rdquo;
      </p>

      {/* معلومات المراجعة */}
      <div className="flex items-center gap-2.5">
        <span
          className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-extrabold text-white shrink-0 font-label ${AVATAR_BG[review.color]}`}
        >
          {review.initial}
        </span>
        <div>
          <div className="text-body-sm font-bold text-dark">{review.name}</div>
          <div className="text-[11px] md:text-[13px] text-light">{review.info}</div>
        </div>
      </div>
    </div>
  );
}
