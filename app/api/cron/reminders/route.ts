import { NextResponse } from "next/server";
import { sendDueReminders } from "@/lib/notifications/reminders";
import { sendHebaDailySchedule } from "@/lib/notifications/dailySchedule";
import { sweepAbandonedOrders } from "@/lib/notifications/recovery";
import { purgeOldRateLimits } from "@/lib/security/rateLimit";

export const dynamic = "force-dynamic";

/**
 * GET /api/cron/reminders — تذكير اليوم السابق (يحمل رابط اللقاء/المكان)،
 * ومعه جدول اليوم لهبة على واتساب (lib/notifications/dailySchedule.ts)
 * وتذكير الطلبات غير المدفوعة احتياطًا ليوم بلا زوّار (lib/notifications/recovery.ts).
 * يستدعيه Vercel Cron يوميًا (vercel.json) بترويسة `Authorization: Bearer $CRON_SECRET`؛
 * بلا المفتاح أو بمفتاح مختلف يُرفض — فلا يستطيع أحد تشغيل التذكيرات من الخارج.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await sendDueReminders();
  // جدول اليوم لهبة — بعد التذكيرات كي لا يؤخّرها، ولا يُفشل الردّ إن تعذّر واتساب
  const dailySchedule = await sendHebaDailySchedule();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  const unpaidOrderReminders = await sweepAbandonedOrders(siteUrl);
  await purgeOldRateLimits();
  return NextResponse.json({ ...result, dailySchedule, unpaidOrderReminders });
}
