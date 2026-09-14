import { createAdminClient } from "@/lib/supabase/admin";
import { toLatinDigits } from "@/lib/utils/format";
import { isInPeriod, localDayKey, periodFirstDay, periodQueryStart } from "@/lib/stats/period";
import { SETTLED_BOOKING_FILTER, SETTLED_ORDER_FILTER } from "@/lib/stats/settlement";
import { listOrders } from "./orders";
import type { OrderRow } from "./types";

/** حجز مختصر لعرض لوحة التحكم */
export interface BookingLite {
  id: string;
  booking_number: string;
  customer_name: string;
  service_name: string | null;
  date: string;
  start_time: string;
  status: string;
  amount: number;
}

/**
 * إحصائيات لوحة التحكم — الطلبات والحجوزات المدفوعة (أو المجانية) غير الملغاة فقط،
 * بالقاعدة نفسها في التحليلات (lib/stats/settlement.ts). الأيام بتوقيت إسرائيل.
 */
export interface DashboardStats {
  salesToday: number;
  /** آخر 7 أيام شاملةً اليوم */
  salesWeek: number;
  /** آخر 30 يومًا شاملةً اليوم */
  salesMonth: number;
  ordersToday: number;
  /** طلبات مدفوعة فيها منتج يُشحن، ولم تُشحن بعد */
  unshippedCount: number;
  recentOrders: OrderRow[];
  upcomingBookingsCount: number;
  todayBookingsCount: number;
  recentBookings: BookingLite[];
}

const WEEK_DAYS = 7;
const MONTH_DAYS = 30;
/** عدد العناصر في قائمتي «الأحدث» */
const RECENT_LIMIT = 5;

/** يحوّل صف حجز إلى العرض المختصر */
function toBookingLite(b: Record<string, unknown>): BookingLite {
  return {
    id: String(b.id),
    booking_number: String(b.booking_number),
    customer_name: toLatinDigits(String(b.customer_name)),
    service_name: b.service_name ? toLatinDigits(String(b.service_name)) : null,
    date: String(b.date),
    start_time: String(b.start_time),
    status: String(b.status),
    amount: Number(b.amount ?? 0),
  };
}

/** يجمع كل أرقام لوحة التحكم */
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createAdminClient();
  const now = new Date();
  const today = localDayKey(now);

  const [monthOrders, unshipped, recentOrders, upcoming, todayBookings, recentBookings] = await Promise.all([
    // مبيعات آخر 30 يومًا — ومنها تُحسب مبيعات اليوم والأسبوع
    supabase
      .from("orders")
      .select("total_amount, created_at")
      .or(SETTLED_ORDER_FILTER)
      .neq("order_status", "cancelled")
      .gte("created_at", periodQueryStart(MONTH_DAYS, now)),
    // بانتظار الشحن: مدفوع، فيه منتج فيزيائي، ولم يُشحن — الكتيبات تُسلَّم بالبريد وحدها
    supabase
      .from("orders")
      .select("id, order_items!inner(product_type)", { count: "exact", head: true })
      .eq("order_items.product_type", "physical")
      .or(SETTLED_ORDER_FILTER)
      .in("order_status", ["pending", "confirmed"]),
    listOrders({ limit: RECENT_LIMIT, settledOnly: true }),
    supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .gte("date", today)
      .in("status", ["pending", "confirmed"])
      .or(SETTLED_BOOKING_FILTER),
    supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("date", today)
      .neq("status", "cancelled")
      .or(SETTLED_BOOKING_FILTER),
    supabase
      .from("bookings")
      .select("id, booking_number, customer_name, service_name, date, start_time, status, amount")
      .neq("status", "cancelled")
      .or(SETTLED_BOOKING_FILTER)
      .order("created_at", { ascending: false })
      .limit(RECENT_LIMIT),
  ]);

  const sales = (monthOrders.data ?? []).map((o) => ({
    at: String(o.created_at),
    amount: Number(o.total_amount ?? 0),
  }));
  const sumSince = (firstDay: string) =>
    sales.filter((s) => isInPeriod(s.at, firstDay)).reduce((sum, s) => sum + s.amount, 0);
  const todays = sales.filter((s) => localDayKey(s.at) === today);

  return {
    salesToday: todays.reduce((sum, s) => sum + s.amount, 0),
    salesWeek: sumSince(periodFirstDay(WEEK_DAYS, now)),
    salesMonth: sumSince(periodFirstDay(MONTH_DAYS, now)),
    ordersToday: todays.length,
    unshippedCount: unshipped.count ?? 0,
    recentOrders,
    upcomingBookingsCount: upcoming.count ?? 0,
    todayBookingsCount: todayBookings.count ?? 0,
    recentBookings: (recentBookings.data ?? []).map(toBookingLite),
  };
}
