/* ─────────────────────────────────────────────────────────
   أنواع التقييمات — تطابق Sanity schema review
   ───────────────────────────────────────────────────────── */

/** لون الأفاتار */
export type ReviewColor = "rose" | "teal" | "yellow" | "mint";

/** واجهة التقييم */
export interface Review {
  /** المعرّف الفريد للترتيب — slug تلقائي */
  slug: string;
  /** نص التقييم */
  quote: string;
  /** اسم الأم — "سارة م." */
  name: string;
  /** معلومة إضافية — "أم لطفلة ٤ أشهر" */
  info: string;
  /** الحرف الأول للأفاتار — "س" */
  initial: string;
  /** لون الأفاتار */
  color: ReviewColor;
  /** عدد النجوم 1-5 */
  rating: number;
  /** ترتيب العرض — الأصغر يظهر أولاً */
  order?: number;
}
