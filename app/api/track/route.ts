import { NextResponse } from "next/server";
import { logEvent } from "@/lib/db/analytics";

/**
 * POST /api/track — يسجّل حدث تتبّع في analytics_events.
 * عام (يُستدعى من العميل)، best-effort — يعيد ok دائمًا كي لا يعطّل الواجهة.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    await logEvent(body);
  } catch {
    /* تجاهل — التتبّع لا يجب أن يكسر شيئًا */
  }
  return NextResponse.json({ ok: true });
}
