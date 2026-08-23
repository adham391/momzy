import type { Review, ReviewColor } from "@/lib/reviews/types";

/** خريطة لون الأفاتار → CSS class */
const AVATAR_BG: Record<ReviewColor, string> = {
  rose:   "bg-rose",
  teal:   "bg-gradient-to-br from-teal to-mint",
  yellow: "bg-gradient-to-br from-[#C09420] to-yellow",
  mint:   "bg-gradient-to-br from-mint to-teal",
};

/**
 * كارد التقييم الموحّد — يُستخدم في الشبكة (ReviewsSection) والـ Carousel (ReviewsCarousel).
 * لا يحتوي أي تفاعل → مكوّن مشترك بين server و client.
 */
export default function ReviewCard({ review }: { review: Review }) {
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
