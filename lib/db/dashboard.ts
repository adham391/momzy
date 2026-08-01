import { createAdminClient } from "@/lib/supabase/admin";
import { toLatinDigits } from "@/lib/utils/format";
import { countOrders, getOrdersSince, listOrders } from "./orders";
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

/** إحصائيات لوحة التحكم */
export interface DashboardStats {
  salesToday: number;
  salesWeek: number;
  salesMonth: number;
  ordersToday: number;
  newOrdersCount: number; // pending
  unshippedCount: number; // pending + confirmed
  recentOrders: OrderRow[];
  upcomingBookingsCount: number;
  todayBookingsCount: number;
  recentBookings: BookingLite[];
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** يجمع كل أرقام لوحة التحكم في نداء واحد */
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createAdminClient();

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(now.getTime() - 7 * DAY_MS);
  const monthAgo = new Date(now.getTime() - 30 * DAY_MS);
  const todayStr = startOfToday.toISOString().slice(0, 10); // YYYY-MM-DD

  // ── الطلبات ──
  const [ordersMonth, newOrdersCount, unshippedCount, recentOrders] = await Promise.all([
    getOrdersSince(monthAgo.toISOString()),
    countOrders(["pending"]),
    countOrders(["pending", "confirmed"]),
    listOrders({ limit: 5 }),
  ]);

  // المبيعات = مجموع الطلبات غير الملغاة (قبل ربط الدفع الفعلي بـ HYP)
  const notCancelled = ordersMonth.filter((o) => o.order_status !== "cancelled");
  const sumSince = (since: Date) =>
    notCancelled
      .filter((o) => new Date(o.created_at) >= since)
      .reduce((sum, o) => sum + o.total_amount, 0);

  const salesToday = sumSince(startOfToday);
  const salesWeek = sumSince(weekAgo);
  const salesMonth = notCancelled.reduce((sum, o) => sum + o.total_amount, 0);
  const ordersToday = ordersMonth.filter((o) => new Date(o.created_at) >= startOfToday).length;

  // ── الحجوزات (تمتلئ في المرحلة 4 — الآن غالباً صفر) ──
  const [upcoming, todayCount, recentBookingsRes] = await Promise.all([
    supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .gte("date", todayStr)
      .in("status", ["pending", "confirmed"]),
    supabase.from("bookings").select("*", { count: "exact", head: true }).eq("date", todayStr),
    supabase
      .from("bookings")
      .select("id, booking_number, customer_name, service_name, date, start_time, status, amount")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const recentBookings: BookingLite[] = (recentBookingsRes.data ?? []).map((b) => ({
    id: String(b.id),
    booking_number: String(b.booking_number),
    customer_name: toLatinDigits(String(b.customer_name)),
    service_name: b.service_name ? toLatinDigits(String(b.service_name)) : null,
    date: String(b.date),
    start_time: String(b.start_time),
    status: String(b.status),
    amount: Number(b.amount ?? 0),
  }));

  return {
    salesToday,
    salesWeek,
    salesMonth,
    ordersToday,
    newOrdersCount,
    unshippedCount,
    recentOrders,
    upcomingBookingsCount: upcoming.count ?? 0,
    todayBookingsCount: todayCount.count ?? 0,
    recentBookings,
  };
}
