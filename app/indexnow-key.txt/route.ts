import { INDEXNOW_KEY } from "@/lib/seo/indexnow";

export const dynamic = "force-static";

/**
 * GET /indexnow-key.txt — مفتاح IndexNow في جذر الموقع.
 * Bing يقرؤه ليتأكد أن بلاغات الصفحات الجديدة منّا (الملف عامّ بطبيعته).
 */
export function GET() {
  return new Response(INDEXNOW_KEY, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
