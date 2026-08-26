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

/**
 * نسبة غلاف الكتيب (عرض/ارتفاع) — للمصغّرات الطولية في القوائم والسلة:
 * الحاوية بهذه النسبة تُملأ بالغلاف تمامًا بلا قص ولا هوامش.
 */
export const BOOKLET_COVER_RATIO = "1200 / 1705";
