import type { Product } from "./types";

/**
 * هل المنتج رقمي (كتيب PDF)؟
 * المنتجات الرقمية: لا شحن لها (تُرسل بالبريد)، وهديتها بالبريد لا بالعنوان.
 * التعريف: تصنيف «كتب ودلائل» أو وجود فصول كتيب.
 */
export function isDigitalProduct(
  p: Pick<Product, "category" | "bookletChapters">
): boolean {
  return p.category === "كتب ودلائل" || (p.bookletChapters?.length ?? 0) > 0;
}
