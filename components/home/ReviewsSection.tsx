import Container from "@/components/ui/Container";
import SectionLabel from "@/components/ui/SectionLabel";
import PolkaDots from "@/components/ui/PolkaDots";
import SectionWave from "@/components/ui/SectionWave";
import ReviewCard from "./ReviewCard";
import ReviewsCarousel from "./ReviewsCarousel";
import { getReviews } from "@/lib/reviews/getReviews";
import type { HomePageContent } from "@/lib/sanity/queries/homePage";

/** قسم تقييمات الأمهات — يقرأ من Sanity مع fallback إلى seed */
export default async function ReviewsSection({ content }: { content: HomePageContent }) {
  const reviews = await getReviews();
  if (reviews.length === 0) return null;

  // إذا كان عدد الآراء ≤ 4 → عرض شبكة عادية
  // إذا أكثر → Carousel أفقي قابل للسحب
  const useCarousel = reviews.length > 4;

  return (
    /** ─ الـ section شفاف — الـ wave يغطي نهاية ArticlesSection ─ */
    <section className="relative reveal-section" style={{ marginTop: -60, zIndex: 7 }}>

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
              <SectionLabel color="teal" centered>{content.reviewsLabel}</SectionLabel>
            </div>
            <h2 className="font-heading text-h2 font-bold text-dark">
              {content.reviewsTitle}
            </h2>
          </div>

          {useCarousel ? (
            /* ── Carousel أفقي بأزرار تنقّل — لما يصير عدد الآراء أكثر من 4 ── */
            <ReviewsCarousel reviews={reviews} />
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
