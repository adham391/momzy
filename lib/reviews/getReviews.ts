import type { Review } from "./types";
import { getAllReviews } from "@/lib/sanity/queries/reviews";
import { SEED_REVIEWS } from "./seed";

/**
 * إحضار قائمة التقييمات.
 *
 * المصدر: Sanity CMS (أولاً)
 * Fallback: seed.ts في بيئة التطوير فقط إذا Sanity فارغ أو غير مضبوط
 *
 * @param limit — حد أقصى لعدد التقييمات (مثلاً 4 للصفحة الرئيسية)
 */
export async function getReviews(limit?: number): Promise<Review[]> {
  let reviews: Review[] = [];

  // إذا لم يُضبط projectId، ارجع للـ seed مباشرة
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    reviews = [...SEED_REVIEWS].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  } else {
    // المصدر الأساسي: Sanity
    reviews = await getAllReviews();

    // Fallback: seed في بيئة التطوير فقط
    if (reviews.length === 0 && process.env.NODE_ENV === "development") {
      reviews = [...SEED_REVIEWS].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }
  }

  return typeof limit === "number" ? reviews.slice(0, limit) : reviews;
}
