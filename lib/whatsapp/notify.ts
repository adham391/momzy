import { sendWhatsAppTemplate, isWhatsAppConfigured } from "./client";
import { getHebaWhatsAppNumber } from "@/lib/db/settings";
import type { OrderWithItems } from "@/lib/db/types";
import type { BookingRow } from "@/lib/db/bookings";

/**
 * إشعارات هبة التلقائية عبر واتساب (Meta Cloud API).
 *
 * تستخدم قالبًا واحدًا بأربعة بارامترات (جسم القالب):
 *   {{1}} النوع (طلب جديد / حجز جديد)
 *   {{2}} الرقم (MZ-… / BK-…)
 *   {{3}} العميلة (الاسم · الهاتف)
 *   {{4}} التفاصيل (المبلغ+الكمية / الخدمة+الموعد)
 *
 * كلها best-effort ومشروطة بإعداد Meta + وجود رقم هبة — وإلا no-op صامت.
 */

/** تاريخ+وقت الحجز بصيغة بسيطة بلا محارف اتجاه (بارامترات القالب لا تقبل أسطرًا/رموز تحكّم) */
function plainSlot(dateStr: string, startTime: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${startTime.slice(0, 5)}`;
}

/** يشعر هبة بطلب جديد */
export async function notifyHebaNewOrder(order: OrderWithItems): Promise<void> {
  if (!isWhatsAppConfigured()) return;
  const to = await getHebaWhatsAppNumber();
  if (!to) return;

  const itemCount = order.items.reduce((n, it) => n + it.quantity, 0);
  await sendWhatsAppTemplate({
    to,
    bodyParams: [
      "طلب جديد",
      order.order_number,
      `${order.customer_name} · ${order.customer_phone}`,
      `${order.total_amount} ₪ · ${itemCount} منتج`,
    ],
  });
}

/** يشعر هبة بحجز جديد */
export async function notifyHebaNewBooking(b: BookingRow): Promise<void> {
  if (!isWhatsAppConfigured()) return;
  const to = await getHebaWhatsAppNumber();
  if (!to) return;

  await sendWhatsAppTemplate({
    to,
    bodyParams: [
      "حجز جديد",
      b.booking_number,
      `${b.customer_name} · ${b.customer_phone}`,
      `${b.service_name ?? "خدمة"} · ${plainSlot(b.date, b.start_time)}`,
    ],
  });
}
