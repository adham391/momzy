import { NextResponse } from "next/server";
import { isDomesticRequest } from "@/lib/geo/country";
import { currencyFor } from "@/lib/currency";
import { getUsdRate } from "@/lib/db/settings";

/**
 * GET /api/geo — هل الزائرة داخل البلاد، وبأي عملة تدفع وبأي سعر صرف؟
 * للواجهة كي تنبّه قبل الإرسال (الصندوق واللقاءات الحضورية من داخل البلاد فقط)
 * وتعرض الأسعار بعملة الزائرة؛ الحكم الفعلي في /api/orders و/api/bookings.
 * لا يُخزَّن: الجواب يتبع عنوان IP.
 */
export async function GET(request: Request) {
  const domestic = isDomesticRequest(request.headers);
  const currency = currencyFor(domestic);
  const usdRate = currency === "USD" ? await getUsdRate() : null;
  return NextResponse.json(
    { domestic, currency, usdRate },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
