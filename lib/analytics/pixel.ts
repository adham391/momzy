/**
 * أحداث Meta Pixel — موضع واحد يعرف كيف تُرسَل.
 *
 * السكربت نفسه يُحمَّل في `TrackingScripts` (مشروط بـ`NEXT_PUBLIC_META_PIXEL_ID`)،
 * وهو يرسل `PageView` لأول صفحة تُفتح. البقية من هنا: بلا معرّف (أو قبل تحميل
 * السكربت) لا يحدث شيء — `fbq` غير موجود فنخرج بصمت.
 *
 * الأحداث القياسية التي تفهمها Meta: PageView · ViewContent · AddToCart ·
 * InitiateCheckout · Purchase · Lead.
 */

/** العملة التي تُقاس بها المبالغ في التقارير — أسعار الموقع بالشيكل دائمًا */
const REPORTING_CURRENCY = "ILS";

type PixelEventName = "PageView" | "ViewContent" | "AddToCart" | "InitiateCheckout" | "Purchase" | "Lead";

type Fbq = (command: "track", event: PixelEventName, params?: Record<string, unknown>) => void;

/** يرسل حدثًا قياسيًا إلى Meta — لا يفعل شيئًا إن لم يكن البكسل مفعّلًا */
export function pixelTrack(event: PixelEventName, params?: Record<string, unknown>): void {
  const fbq = (window as unknown as { fbq?: Fbq }).fbq;
  if (typeof fbq !== "function") return;
  fbq("track", event, params);
}

/** حدث بمبلغ — يضيف العملة التي تتوقّعها Meta مع كل قيمة */
export function pixelTrackValue(event: PixelEventName, value: number, params?: Record<string, unknown>): void {
  pixelTrack(event, { value, currency: REPORTING_CURRENCY, ...params });
}
