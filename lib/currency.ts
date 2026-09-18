/**
 * عملة الخصم — الشيكل داخل البلاد، والدولار الأمريكي من خارجها.
 *
 * الأسعار في الموقع بالشيكل دائمًا؛ التحويل يحدث مرة واحدة عند إنشاء الطلب أو الحجز
 * بسعر الصرف المضبوط في /admin/settings ويُحفظ معه (currency · charged_amount · exchange_rate)،
 * فلا يتغيّر المبلغ لو تغيّر السعر بعد ذلك. الشيكل يبقى أساس الإحصاءات ولوحة الأدمن.
 */

export type Currency = "ILS" | "USD";

/** رمز العملة في HYP (البارامتر Coin) */
export const HYP_COIN: Record<Currency, string> = { ILS: "1", USD: "2" };

/** مفتاح سعر الصرف في جدول settings — ₪ لكل $1 */
export const USD_RATE_SETTING = "usd_rate";

/** الاحتياطي حين لا يُضبط السعر في /admin/settings */
export const DEFAULT_USD_RATE = 3.6;

/** ما يلزم لعرض الأسعار للزائرة: عملتها وسعر الصرف */
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
