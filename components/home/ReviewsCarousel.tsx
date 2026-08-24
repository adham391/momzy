"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ReviewCard from "./ReviewCard";
import type { Review } from "@/lib/reviews/types";

/** المسافة بين البطاقات (gap-4 = 1rem = 16px) — تُستخدم لحساب خطوة التمرير */
const CARD_GAP = 16;

/**
 * Carousel التقييمات الأفقي — يظهر حين يتجاوز عدد الآراء 4.
 * التنقّل بأزرار سابق/تالي (تعمل بالفأرة على الحاسوب)، مع بقاء السحب متاحًا على اللمس.
 * التمرير مُراعٍ لِـ RTL: «التالي» يكشف البطاقات التالية (يسارًا) عبر إنقاص scrollLeft.
 */
export default function ReviewsCarousel({ reviews }: { reviews: Review[] }) {
  const t = useTranslations("common");
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  /** تحديث حالة الحواف — لتعطيل الزر عند الوصول للبداية/النهاية */
  const updateEdges = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const x = Math.abs(el.scrollLeft); // القيمة المطلقة تُراعي scrollLeft السالب في RTL
    setAtStart(x <= 1);
    setAtEnd(max <= 1 || x >= max - 1);
  }, []);

  useEffect(() => {
    updateEdges();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateEdges, { passive: true });
    window.addEventListener("resize", updateEdges);
    return () => {
      el.removeEventListener("scroll", updateEdges);
      window.removeEventListener("resize", updateEdges);
    };
  }, [updateEdges]);

  /** خطوة التمرير = عرض بطاقة واحدة + الفجوة (fallback: 80% من عرض الحاوية) */
  const scrollByDir = (dir: "prev" | "next") => {
    const el = scrollerRef.current;
    if (!el) return;
    const firstCard = el.firstElementChild as HTMLElement | null;
    const step = firstCard ? firstCard.offsetWidth + CARD_GAP : el.clientWidth * 0.8;
    // في RTL: «التالي» (بطاقات لاحقة، يسارًا) = إنقاص scrollLeft
    el.scrollBy({ left: dir === "next" ? -step : step, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {/* ── مسار التمرير ── */}
      <div
        ref={scrollerRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pt-2 pb-4 scrollbar-hide"
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

      {/* ── أزرار التنقّل — سابق (يمين) / تالي (يسار) ── */}
      <div className="flex justify-center items-center gap-4 mt-7">
        <NavButton
          label={t("prev")}
          onClick={() => scrollByDir("prev")}
          disabled={atStart}
          icon={<ChevronRight size={22} strokeWidth={2.5} />}
        />
        <NavButton
          label={t("next")}
          onClick={() => scrollByDir("next")}
          disabled={atEnd}
          icon={<ChevronLeft size={22} strokeWidth={2.5} />}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   زر تنقّل دائري — أبيض مع ظل، يتعطّل عند الحافة
   ───────────────────────────────────────────────────────── */
function NavButton({
  label,
  onClick,
  disabled,
  icon,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="w-12 h-12 rounded-full bg-white text-dark flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.12)] [transition:transform_180ms_ease,opacity_180ms_ease,box-shadow_180ms_ease] hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgba(0,0,0,0.18)] active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
    >
      {icon}
    </button>
  );
}
