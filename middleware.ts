import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** الدول المحظورة كلياً — ISO 3166-1 alpha-2 */
const BLOCKED_COUNTRIES = new Set([
  "IR", // إيران
  "SY", // سوريا
  "KP", // كوريا الشمالية
  "LB", // لبنان
  "PK", // باكستان
  "YE", // اليمن
  "SD", // السودان
  "AF", // أفغانستان
  "IQ", // العراق
  "SS", // جنوب السودان
  "RU", // روسيا
  "QA", // قطر
  "KW", // الكويت
]);

/**
 * المناطق المحظورة داخل دولة بعينها
 * المفتاح: كود الدولة — القيمة: مجموعة كودات المناطق المحظورة
 * PS = فلسطين، GZ = قطاع غزة فقط (WE = الضفة الغربية — مسموح)
 */
const BLOCKED_REGIONS: Record<string, Set<string>> = {
  PS: new Set(["GZ"]),
};

/** هل الطلب قادم من منطقة محظورة؟ */
function isBlocked(country: string, region: string): boolean {
  // دولة محظورة كلياً
  if (BLOCKED_COUNTRIES.has(country)) return true;

  // منطقة محظورة داخل دولة مسموح بها جزئياً
  if (BLOCKED_REGIONS[country]?.has(region)) return true;

  return false;
}

/** بيانات الموقع الجغرافي — يضيفها Vercel/Edge في runtime لكنها غير مُعرّفة في types */
interface GeoInfo {
  country?: string;
  region?: string;
}

export function middleware(request: NextRequest) {
  /* النوع غير معرّف في NextRequest الحديث، لكن Vercel يحقنه في runtime */
  const geo = (request as NextRequest & { geo?: GeoInfo }).geo;
  const country = geo?.country ?? "";
  const region  = geo?.region  ?? "";

  if (country && isBlocked(country, region)) {
    return NextResponse.redirect(new URL("/not-available", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // طبّق على كل الصفحات ما عدا: صفحة الحجب + assets + api
  matcher: ["/((?!not-available|_next/static|_next/image|api|icons|images|favicon).*)"],
};
