/**
 * بلد الزائرة — من ترويسات الموقع الجغرافي التي تضيفها حافة Vercel لكل طلب
 * (تُستنتج من عنوان IP، والمتصفح لا يستطيع تزويرها). محليًا لا توجد، فالبلد فارغ = مجهول.
 *
 * يستخدمها الحجب الجغرافي في proxy.ts، وقاعدة «من داخل البلاد فقط» للصندوق
 * واللقاءات الحضورية في /api/orders و/api/bookings.
 */

const COUNTRY_HEADER = "x-vercel-ip-country";
const REGION_HEADER = "x-vercel-ip-country-region";

/**
 * للتجربة محليًا فقط (يُتجاهَل في الإنتاج): كوكي `dev-geo-country=US` في المتصفح
 * تُقلّد زائرة من ذلك البلد — وبمنطقة: `PS-GZ`. تسري على الحجب الجغرافي وقاعدة داخل البلاد معًا.
 */
const DEV_OVERRIDE_COOKIE = "dev-geo-country";

/** البلاد — إسرائيل والضفة الغربية: حيث يُشحن الصندوق ومن حيث تأتي الأمهات إلى اللقاءات الحضورية */
const DOMESTIC_COUNTRIES: ReadonlySet<string> = new Set(["IL", "PS"]);

/** قطاع غزة محجوب عن الموقع كله في proxy.ts — ويُستثنى هنا أيضًا كي لا يمرّ عبر /api مباشرة */
const GAZA = { country: "PS", region: "GZ" };

/** رمز الخطأ حين تُرفض عملية من خارج البلاد — تقرأه الواجهة لتعرض رسالتها بلغة الزائرة */
export const DOMESTIC_ONLY_CODE = "domestic_only";

function devOverride(headers: Headers): { country: string; region: string } | null {
  if (process.env.NODE_ENV === "production") return null;
  const match = headers
    .get("cookie")
    ?.match(new RegExp(`(?:^|;\\s*)${DEV_OVERRIDE_COOKIE}=([A-Za-z]{2})(?:-([A-Za-z0-9]{1,3}))?`));
  return match ? { country: match[1].toUpperCase(), region: (match[2] ?? "").toUpperCase() } : null;
}

/** رمز البلد ISO 3166-1 alpha-2 بحروف كبيرة — فارغ حين لا يُعرف */
export function countryFromHeaders(headers: Headers): string {
  return devOverride(headers)?.country ?? (headers.get(COUNTRY_HEADER) ?? "").toUpperCase();
}

/** رمز المنطقة داخل البلد (ISO 3166-2) — فارغ حين لا يُعرف */
export function regionFromHeaders(headers: Headers): string {
  return devOverride(headers)?.region ?? (headers.get(REGION_HEADER) ?? "").toUpperCase();
}

/**
 * هل الزائرة داخل البلاد؟ البلد المجهول (بلا ترويسة — بيئة التطوير أو IP لم يُحدَّد)
 * يُعامَل كداخل البلاد: القاعدة تمنع الحالة الواضحة ولا تُعطّل زبونة محلية بسبب IP غريب.
 */
export function isDomestic(country: string, region = ""): boolean {
  if (country === "") return true;
  if (country === GAZA.country && region === GAZA.region) return false;
  return DOMESTIC_COUNTRIES.has(country);
}

/** الحكم من ترويسات الطلب مباشرة — لواجهات /api */
export function isDomesticRequest(headers: Headers): boolean {
  return isDomestic(countryFromHeaders(headers), regionFromHeaders(headers));
}
