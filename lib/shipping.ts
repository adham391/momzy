/**
 * منطق الشحن — دالة نقيّة آمنة للعميل والسيرفر (لا تستورد أي شيء خادمي).
 * القيم الفعلية تُقرأ من جدول settings عبر lib/db/settings.ts (سيرفر).
 */

export interface ShippingConfig {
  /** رسوم الشحن الافتراضية (₪) */
  defaultCost: number;
  /** حد الشحن المجاني (₪) — 0 يعني لا يوجد */
  freeMin: number;
}

/** احتياطي إذا تعذّر قراءة الإعدادات */
export const DEFAULT_SHIPPING: ShippingConfig = { defaultCost: 35, freeMin: 0 };

/**
 * يحسب رسوم الشحن لطلب.
 * - سلة فارغة ⇒ 0
 * - تجاوز حد الشحن المجاني (إن وُجد) ⇒ 0
 * - غير ذلك ⇒ الرسوم الافتراضية
 */
export function computeShipping(
  subtotal: number,
  itemCount: number,
  config: ShippingConfig
): number {
  if (itemCount <= 0) return 0;
  if (config.freeMin > 0 && subtotal >= config.freeMin) return 0;
  return config.defaultCost;
}
