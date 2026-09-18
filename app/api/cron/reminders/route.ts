import { NextResponse } from "next/server";
import { sendDueReminders } from "@/lib/notifications/reminders";

export const dynamic = "force-dynamic";

/**
 * GET /api/cron/reminders — تذكير اليوم السابق (يحمل رابط اللقاء/المكان).
 * يستدعيه Vercel Cron يوميًا (vercel.json) بترويسة `Authorization: Bearer $CRON_SECRET`؛
 * بلا المفتاح أو بمفتاح مختلف يُرفض — فلا يستطيع أحد تشغيل التذكيرات من الخارج.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await sendDueReminders();
  return NextResponse.json(result);
}
