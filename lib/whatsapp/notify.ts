import { sendWhatsAppTemplate, isWhatsAppConfigured } from "./client";
import { getHebaWhatsAppNumber } from "@/lib/db/settings";

/**
 * إشعار هبة على واتساب — **جدول اليوم صباحًا وحده**.
 *
 * الطلب الجديد والحجز الجديد يصلان هبة بالإيميل بكل تفاصيلهما، فرسالة واتساب
 * معهما تكرارٌ يُعوّدها تجاهُلَ الإشعارات. الباقي: جدولٌ واحد كل صباح.
 *
 * القالب المعتمد من Meta: `momzy_daily_schedule` بثلاثة بارامترات (DailyScheduleParams).
 * best-effort ومشروط بإعداد Meta + وجود رقم هبة — وإلا no-op صامت.
 */

/**
 * بارامترات القالب — كلٌّ سطر واحد:
 *   {{1}} اليوم والتاريخ · {{2}} الخلاصة (عدد الجلسات والمسجّلات) · {{3}} الجلسات بالتفصيل
 */
export interface DailyScheduleParams {
  dateLabel: string;
  summary: string;
  sessions: string;
}

/** يرسل لهبة جدول يومها — تُبنى نصوصه في lib/notifications/dailySchedule.ts */
export async function notifyHebaDailySchedule(params: DailyScheduleParams): Promise<boolean> {
  if (!isWhatsAppConfigured()) return false;
  const to = await getHebaWhatsAppNumber();
  if (!to) return false;

  return sendWhatsAppTemplate({
    to,
    bodyParams: [params.dateLabel, params.summary, params.sessions],
  });
}
