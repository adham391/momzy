import { NextResponse } from "next/server";
import { isDomesticRequest } from "@/lib/geo/country";

/**
 * GET /api/geo — هل الزائرة داخل البلاد؟
 * للواجهة كي تنبّه قبل الإرسال (الصندوق واللقاءات الحضورية من داخل البلاد فقط)؛
 * الحكم الفعلي في /api/orders و/api/bookings. لا يُخزَّن: الجواب يتبع عنوان IP.
 */
export function GET(request: Request) {
  const domestic = isDomesticRequest(request.headers);
  return NextResponse.json({ domestic }, { headers: { "Cache-Control": "private, no-store" } });
}
