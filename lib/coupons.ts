/** منطق الكوبون — آمن للعميل والسيرفر (لا يستورد شيئاً خادمياً) */

export type CouponType = "percentage" | "fixed";

/**
 * كوبون مطبّق على السلة — يُحفظ في الـ store.
 * نحفظ القاعدة (النوع/القيمة/الحد الأدنى) لإعادة حساب الخصم حيّاً مع تغيّر السلة،
 * فلا يبقى خصم قديم إذا تغيّرت الكمية.
 */
export interface AppliedCoupon {
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount: number;
  label: string;
}

/** يحسب خصم الكوبون على مجموع حالي (0 إذا لم يعد صالحاً) */
export function couponDiscount(coupon: AppliedCoupon | null, subtotal: number): number {
  if (!coupon) return 0;
  if (subtotal < coupon.minOrderAmount) return 0;
  const raw =
    coupon.type === "percentage" ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
  return Math.min(raw, subtotal);
}
