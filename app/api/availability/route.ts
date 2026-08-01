import { NextResponse } from "next/server";
import { getAvailableSlots, getUpcomingSlotsForService } from "@/lib/db/bookings";

/**
 * GET /api/availability?service=slug — الفتحات المتاحة لخدمة.
 * عام (تدفّق الحجز المجهول).
 *
 * يعيد أيضاً `totalUpcoming` (بما فيها المكتملة) كي يميّز النموذج بين
 * «لا مواعيد مجدولة» و«المقاعد مكتملة» — رسالتان مختلفتان تمامًا للأم.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const service = searchParams.get("service");
  if (!service) return NextResponse.json({ slots: [], totalUpcoming: 0 });

  const [slots, upcoming] = await Promise.all([
    getAvailableSlots(service),
    getUpcomingSlotsForService(service),
  ]);
  return NextResponse.json({ slots, totalUpcoming: upcoming.length });
}
