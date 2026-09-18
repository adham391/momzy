/**
 * منطق الشحن — دالة نقيّة آمنة للعميل والسيرفر (لا تستورد أي شيء خادمي).
 * القيم الفعلية تُقرأ من جدول settings ومن حقل «شحن مجاني» في Sanity عبر lib/db/settings.ts (سيرفر).
 */

export interface ShippingConfig {
  /** رسوم الشحن الافتراضية (₪) */
  defaultCost: number;
  /** حد الشحن المجاني (₪) — 0 يعني لا يوجد */
  freeMin: number;
  /** منتجات فيزيائية شحنها مجاني دائمًا (حقل «شحن مجاني» في Sanity) — لا تستوجب رسومًا */
  freeShippingSlugs: string[];
}

/** عنصر سلة/طلب كما يراه حساب الشحن */
export interface ShippingItem {
  slug: string;
  /** رقمي — يصل بالبريد فلا يُشحن */
  isDigital?: boolean;
}

/** احتياطي إذا تعذّر قراءة الإعدادات */
export const DEFAULT_SHIPPING: ShippingConfig = { defaultCost: 35, freeMin: 0, freeShippingSlugs: [] };

/**
 * يحسب رسوم الشحن لطلب.
 * - لا عنصر يستوجب شحنًا مدفوعًا (كله رقمي، أو فيزيائي بشحن مجاني) ⇒ 0
 * - تجاوز حد الشحن المجاني (إن وُجد) ⇒ 0
 * - غير ذلك ⇒ الرسوم الافتراضية
 */
export function computeShipping(
  subtotal: number,
  items: readonly ShippingItem[],
  config: ShippingConfig
): number {
  const free = new Set(config.freeShippingSlugs);
  if (!items.some((i) => !i.isDigital && !free.has(i.slug))) return 0;
  if (config.freeMin > 0 && subtotal >= config.freeMin) return 0;
  return config.defaultCost;
}
