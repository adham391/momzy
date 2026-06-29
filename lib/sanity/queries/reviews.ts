import { sanityFetch } from "@/lib/sanity/client";
import type { Review } from "@/lib/reviews/types";

/** الحقول المطلوبة من document review */
const REVIEW_FIELDS = `
  "slug": slug.current,
  quote,
  name,
  info,
  initial,
  color,
  rating,
  order
`;

/** جلب كل التقييمات — مرتبة حسب order */
export async function getAllReviews(): Promise<Review[]> {
  const query = `*[_type == "review"] | order(order asc, _createdAt desc) {
    ${REVIEW_FIELDS}
  }`;

  const data = await sanityFetch<Review[]>(query, {}, 60);
  return data ?? [];
}
