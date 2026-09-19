import { NextResponse } from "next/server";
import { getUpcomingSlotsForService } from "@/lib/db/bookings";
import { getService } from "@/lib/services/getService";
import { toPublicSlot } from "@/lib/services/session";

/**
 * GET /api/availability?service=slug — كل الجلسات القادمة لخدمة، **بما فيها المكتملة**:
 * تظهر في رزنامة النموذج رمادية بعلامة «اكتمل العدد» ولا تُضغط (لا تختفي)،
 * وتحتها زر قائمة الانتظار لمن تريد.
 *
 * عام (تدفّق الحجز المجهول) — لذا تُعاد الفتحات بصيغتها العامة (`PublicSlot`):
 * بلا رابط اللقاء (يصل في تذكير اليوم السابق)، ومع `online` كي تعرف الواجهة أنّ اللقاء حضوري.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("service");
  if (!slug) return NextResponse.json({ slots: [] });

  const [slots, service] = await Promise.all([getUpcomingSlotsForService(slug), getService(slug)]);
  return NextResponse.json({ slots: slots.map((slot) => toPublicSlot(slot, service)) });
}
