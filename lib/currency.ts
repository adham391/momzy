/**
 * عملة الخصم — الشيكل داخل البلاد، والدولار الأمريكي من خارجها.
 *
 * لكل منتج وخدمة تُباع خارج البلاد **سعر دولار ثابت** تضعه هبة في Studio (`priceUsd`) —
 * لا سعر صرف عام. منه يُشتقّ «سعر صرف الطلب» (قائمة الشيكل ÷ قائمة الدولار)، وبه يتحوّل
 * كل مبلغ في الطلب: فالمنتج وحده يُعرض ويُخصم بسعره الثابت تمامًا، والخصم (كوبون أو باقة)
 * ينطبق على الدولار بالنسبة نفسها. يُحسب مرة عند إنشاء الطلب أو الحجز ويُحفظ معه
 * (currency · charged_amount · exchange_rate). الشيكل يبقى أساس الإحصاءات ولوحة الأدمن.
 */

export type Currency = "ILS" | "USD";

/** رمز العملة في HYP (البارامتر Coin) */
export const HYP_COIN: Record<Currency, string> = { ILS: "1", USD: "2" };

/** احتياطي لمنتج أو خدمة بلا سعر دولار في Studio — ₪ لكل $1 (كي لا تتعطّل البيعة) */
export const FALLBACK_USD_RATE = 3.6;

/** ما يلزم لعرض أسعار طلب للزائرة: عملتها وسعر صرف الطلب */
export interface PriceContext {
  currency: Currency;
  usdRate: number;
}

/** عملة الزائرة من موقعها — الدولار من خارج البلاد */
export const currencyFor = (domestic: boolean): Currency => (domestic ? "ILS" : "USD");

/** ₪ → $ بسنتين — تقريب واحد للواجهة والسيرفر كي يتطابق ما تراه العميلة مع ما يُخصم */
export function ilsToUsd(ils: number, rate: number): number {
  return Math.round((ils / rate) * 100) / 100;
}

/** سعر عنصر بالدولار: الثابت من Studio، وإلا تحويل احتياطي */
export function usdPriceOf(ils: number, priceUsd?: number | null): number {
  return typeof priceUsd === "number" && priceUsd > 0 ? priceUsd : ilsToUsd(ils, FALLBACK_USD_RATE);
}

/** سطر في قائمة الطلب: سعره بالشيكل، وسعره الثابت بالدولار إن وُجد */
export interface PricedLine {
  ils: number;
  usd?: number | null;
  quantity: number;
}

/**
 * سعر صرف الطلب (₪ لكل $1) من أسعار الدولار الثابتة: قائمة الشيكل ÷ قائمة الدولار.
 * الواجهة والسيرفر يحسبانه بالدالة نفسها، فيطابق ما تراه العميلة ما يُخصم.
 */
export function orderUsdRate(lines: PricedLine[]): number {
  const ils = lines.reduce((sum, l) => sum + l.ils * l.quantity, 0);
  const usd = lines.reduce((sum, l) => sum + usdPriceOf(l.ils, l.usd) * l.quantity, 0);
  return ils > 0 && usd > 0 ? ils / usd : FALLBACK_USD_RATE;
}

/** المبلغ الذي يُخصم فعلًا بعملة الزائرة */
export function toCharged(ils: number, ctx: PriceContext): number {
  return ctx.currency === "USD" ? ilsToUsd(ils, ctx.usdRate) : ils;
}

/** «₪1,133» أو «$13.24» */
export function formatMoney(amount: number, currency: Currency): string {
  return currency === "USD"
    ? `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : `₪${amount.toLocaleString("en-US")}`;
}

/** سعر شيكلي كما تراه الزائرة — بالدولار من خارج البلاد، وبالشيكل قبل معرفة موقعها */
export function displayPrice(ils: number, ctx: PriceContext | null): string {
  return ctx ? formatMoney(toCharged(ils, ctx), ctx.currency) : formatMoney(ils, "ILS");
}

/** ما خُصم فعلًا لطلب أو حجز محفوظ: «$13.61 (₪49)» بالدولار، أو «₪49» */
export function formatCharged(ils: number, currency: Currency, charged: number | null): string {
  if (currency === "USD" && charged != null) {
    // عزل LTR (‏⁦…⁩): بدونه تعيد صفحات RTL ترتيب المبلغين والقوسين
    return `⁦${formatMoney(charged, "USD")} (${formatMoney(ils, "ILS")})⁩`;
  }
  return formatMoney(ils, "ILS");
}
