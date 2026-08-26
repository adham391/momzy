import { NextResponse } from "next/server";
import { getTokenAccess } from "@/lib/db/downloads";
import { fetchBookletPageResponse } from "@/lib/booklets/reader";

/**
 * مدة الكاش في متصفح القارئة (خاص) — توازن بين سلاسة التقليب المتكرر
 * وبين ألا تبقى الصفحات متاحة طويلًا بعد انتهاء صلاحية التوكن.
 */
const CACHE_TTL_SECONDS = 3600;

/**
 * GET /api/booklet/[token]/[page]
 * يبثّ صورة صفحة واحدة من الكتيب (WebP) بعد التحقق من توكن الشراء.
 * لا يكشف روابط التخزين — الوصول الوحيد للصفحات عبر هذا المسار.
 * فحص حدود الصفحات ضمني: صفحة غير موجودة في التخزين ⇒ 404 (بلا جلب meta).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string; page: string }> }
) {
  const { token, page } = await params;

  const pageNum = Number(page);
  if (!Number.isInteger(pageNum) || pageNum < 1) {
    return new NextResponse(null, { status: 400 });
  }

  // تحقّق خفيف من التوكن (عمودان فقط — موجود + غير منتهٍ)
  const access = await getTokenAccess(token);
  if (!access) {
    return new NextResponse(null, { status: 403 });
  }

  // بثّ مباشر من التخزين — لا تُحمَّل الصورة كاملة في ذاكرة السيرفر
  const upstream = await fetchBookletPageResponse(access.productSlug, pageNum);
  if (!upstream) {
    return new NextResponse(null, { status: 404 });
  }

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": `private, max-age=${CACHE_TTL_SECONDS}`,
    },
  });
}
