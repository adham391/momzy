/* ─────────────────────────────────────────────────────────
   الباقات — سعر مخفّض لمنتج عند وجود منتج آخر في السلة/الطلب.
   مصدر حقيقة واحد يُستخدم على العميل (عرض السلة والإجمالي)
   وعلى السيرفر (تسعير الطلب في createOrder) فتتطابق الفاتورة
   مع ما تراه العميلة تمامًا. دون أي اعتماد على مكتبات العميل.
   ───────────────────────────────────────────────────────── */

/** قاعدة باقة */
export interface BundleRule {
  /** يجب وجود هذا المنتج (slug) في السلة كي يُفعَّل الخصم */
  requires: string;
  /** المنتج (slug) الذي يحصل على السعر المخفّض */
  target: string;
  /** السعر داخل الباقة (بالشيكل) */
  bundlePrice: number;
  /** نص قصير للعرض */
  label?: string;
}

/** قواعد الباقات المفعّلة */
export const BUNDLE_RULES: BundleRule[] = [
  {
    requires: "mommy-journey-box",
    target: "tummy-time-booklet",
    bundlePrice: 49,
    label: "سعر خاص مع الصندوق",
  },
];

/** قاعدة الباقة على منتج معيّن ضمن مجموعة slugs — أو null */
export function bundleRuleFor(slug: string, cartSlugs: Iterable<string>): BundleRule | null {
  const set = cartSlugs instanceof Set ? cartSlugs : new Set(cartSlugs);
  return BUNDLE_RULES.find((r) => r.target === slug && set.has(r.requires)) ?? null;
}

/** قاعدة باقة يقدّمها هذا المنتج (يكون هو الشرط requires) — للعرض في صفحته */
export function bundleOfferedBy(slug: string): BundleRule | null {
  return BUNDLE_RULES.find((r) => r.requires === slug) ?? null;
}

/**
 * السعر الفعّال لمنتج بعد تطبيق الباقات.
 * @param listPrice سعره الأصلي (من Sanity)
 * @param cartSlugs الـ slugs الموجودة في السلة/الطلب
 */
export function effectivePrice(slug: string, listPrice: number, cartSlugs: Iterable<string>): number {
  const rule = bundleRuleFor(slug, cartSlugs);
  return rule ? Math.min(rule.bundlePrice, listPrice) : listPrice;
}
