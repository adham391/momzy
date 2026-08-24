import { sanityFetch } from "@/lib/sanity/client";
import type { Review } from "@/lib/reviews/types";
import { tf, activeLocale } from "@/lib/sanity/i18n";

/** الحقول المطلوبة من document review — الحقول النصّية تُحلّ للغة الفعّالة ($loc) مع سقوط للعربية */
const REVIEW_FIELDS = `
  "slug": slug.current,
  ${tf("quote")},
  name,
  ${tf("info")},
  initial,
  color,
  rating,
  order
`;

/** جلب كل التقييمات — مرتبة حسب order */
export async function getAllReviews(locale?: string): Promise<Review[]> {
  const loc = await activeLocale(locale);
  const query = `*[_type == "review"] | order(order asc, _createdAt desc) {
    ${REVIEW_FIELDS}
  }`;

  const data = await sanityFetch<Review[]>(query, { loc }, 60);
  return data ?? [];
}
