import { NextResponse, after } from "next/server";
import { logEvent } from "@/lib/db/analytics";
import { sweepAbandonedOrdersFromTraffic } from "@/lib/notifications/recovery";

/**
 * POST /api/track — يسجّل حدث تتبّع في analytics_events.
 * عام (يُستدعى من العميل)، best-effort — يعيد ok دائمًا كي لا يعطّل الواجهة.
 * وبعد الرد يفحص الطلبات غير المدفوعة (مقيَّدًا) — فيصل تذكير الدفع بلا انتظار طلب جديد.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    await logEvent(body);
  } catch {
    /* تجاهل — التتبّع لا يجب أن يكسر شيئًا */
  }
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  after(() => sweepAbandonedOrdersFromTraffic(siteUrl));
  return NextResponse.json({ ok: true });
}
