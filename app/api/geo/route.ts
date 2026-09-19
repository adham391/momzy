import { NextResponse } from "next/server";
import { isDomesticRequest } from "@/lib/geo/country";
import { currencyFor } from "@/lib/currency";

/**
 * GET /api/geo — هل الزائرة داخل البلاد، وبأي عملة تدفع؟ (أسعار الدولار ثابتة لكل منتج وخدمة)
 * للواجهة كي تنبّه قبل الإرسال (الصندوق واللقاءات الحضورية من داخل البلاد فقط)
 * وتعرض الأسعار بعملة الزائرة؛ الحكم الفعلي في /api/orders و/api/bookings.
 * لا يُخزَّن: الجواب يتبع عنوان IP.
 */
export async function GET(request: Request) {
  const domestic = isDomesticRequest(request.headers);
  const currency = currencyFor(domestic);
  return NextResponse.json(
    { domestic, currency },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
