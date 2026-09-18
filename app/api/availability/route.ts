import { NextResponse } from "next/server";
import { getAvailableSlots, getUpcomingSlotsForService } from "@/lib/db/bookings";
import { getService } from "@/lib/services/getService";
import { toPublicSlot } from "@/lib/services/session";

/**
 * GET /api/availability?service=slug — الفتحات المتاحة لخدمة.
 * عام (تدفّق الحجز المجهول) — لذا تُعاد الفتحات بصيغتها العامة (`PublicSlot`):
 * بلا رابط اللقاء (يُكشف بعد الدفع فقط)، ومع `online` كي تعرف الواجهة أنّ اللقاء حضوري.
 *
 * يعيد أيضاً `totalUpcoming` (بما فيها المكتملة) كي يميّز النموذج بين
 * «لا مواعيد مجدولة» و«المقاعد مكتملة» — رسالتان مختلفتان تمامًا للأم.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("service");
  if (!slug) return NextResponse.json({ slots: [], totalUpcoming: 0 });

  const [slots, upcoming, service] = await Promise.all([
    getAvailableSlots(slug),
    getUpcomingSlotsForService(slug),
    getService(slug),
  ]);
  return NextResponse.json({
    slots: slots.map((slot) => toPublicSlot(slot, service?.type)),
    totalUpcoming: upcoming.length,
  });
}
