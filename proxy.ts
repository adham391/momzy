import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { createMiddlewareClient } from "@/lib/supabase/middleware";
import { routing } from "@/lib/i18n/routing";

/** موجّه اللغات — يعيد كتابة / → /ar داخليًا ويخدم /he و /en */
const intlMiddleware = createIntlMiddleware(routing);

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

/** بيانات الموقع الجغرافي — يحقنها الـ runtime (Edge) في request.geo، غير مُعرّفة في types */
interface GeoInfo {
  country?: string;
  region?: string;
}

/**
 * بلد ومنطقة الزائر (ISO 3166-1 / 3166-2).
 * منذ Next.js 16 يعمل Proxy على Node.js runtime افتراضيًا، فلم يعد
 * `request.geo` مضمونًا — لذا نقرأ ترويسات Vercel للموقع الجغرافي
 * (متاحة على Edge وNode معًا)، ونُبقي request.geo كاحتياط.
 */
function getGeo(request: NextRequest): { country: string; region: string } {
  const injected = (request as NextRequest & { geo?: GeoInfo }).geo;
  if (injected?.country) {
    return {
      country: injected.country.toUpperCase(),
      region: (injected.region ?? "").toUpperCase(),
    };
  }
  const h = request.headers;
  return {
    country: (h.get("x-vercel-ip-country") ?? "").toUpperCase(),
    region: (h.get("x-vercel-ip-country-region") ?? "").toUpperCase(),
  };
}

/** هل المسار صفحة الحجب الجغرافي؟ (بأي بادئة لغة) */
function isNotAvailablePath(pathname: string): boolean {
  return /^\/(he\/|en\/)?not-available\/?$/.test(pathname);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /* ── 1. الحجب الجغرافي (أولاً) — تُستثنى صفحة الحجب نفسها لمنع حلقة redirect ── */
  if (!isNotAvailablePath(pathname)) {
    const { country, region } = getGeo(request);
    if (country && isBlocked(country, region)) {
      return NextResponse.redirect(new URL("/not-available", request.url));
    }
  }

  /* ── 2. حماية لوحة الأدمن (خارج شجرة اللغات) ── */
  const isAdminArea = pathname.startsWith("/admin");
  // صفحة الدخول مستثناة من الفحص (وإلا حلقة redirect لا نهائية).
  // الخروج = server action (يُنفَّذ على مسار اللوحة نفسه)، لا يحتاج استثناء.
  const isAuthPath = pathname === "/admin/login";

  if (isAdminArea && !isAuthPath) {
    const { supabase, response } = createMiddlewareClient(request);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // غير مسجّل دخول → لصفحة الدخول
    if (!user) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    // مسجّل → أكمل (response يحمل كوكيز الجلسة المُجدَّدة)
    // فحص "أدمن نشط" يتم في layout اللوحة عبر جدول admins.
    return response;
  }

  /* ── 3. الأدمن (login) والاستوديو خارج نظام اللغات ── */
  if (isAdminArea || pathname.startsWith("/studio")) {
    return NextResponse.next();
  }

  /* ── 4. توجيه اللغات — يعيد كتابة / → /ar داخليًا ويخدم /he و /en ── */
  return intlMiddleware(request);
}

export const config = {
  // طبّق على كل الصفحات ما عدا: assets + api
  matcher: ["/((?!_next/static|_next/image|api|icons|images|favicon).*)"],
};
