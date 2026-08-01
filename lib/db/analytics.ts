import { createAdminClient } from "@/lib/supabase/admin";

const DAY_MS = 86400000;
const DIRECT = "مباشر"; // تسمية الزيارات بلا مصدر

/** يسجّل حدث تتبّع — best-effort (يبتلع الأخطاء كي لا يعطّل التتبّع) */
export async function logEvent(e: Record<string, unknown>): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.from("analytics_events").insert({
      event_type: String(e.event_type ?? "unknown"),
      page: e.page ? String(e.page) : null,
      product_slug: e.product_slug ? String(e.product_slug) : null,
      service_slug: e.service_slug ? String(e.service_slug) : null,
      order_id: e.order_id ? String(e.order_id) : null,
      value: e.value != null ? Number(e.value) : null,
      session_id: e.session_id ? String(e.session_id) : null,
      utm_source: e.utm_source ? String(e.utm_source) : null,
      utm_medium: e.utm_medium ? String(e.utm_medium) : null,
      utm_campaign: e.utm_campaign ? String(e.utm_campaign) : null,
      referrer: e.referrer ? String(e.referrer) : null,
    });
  } catch {
    /* التتبّع best-effort */
  }
}

/* ── استعلامات لوحة التحليلات ── */

export interface SourceStat {
  source: string;
  count: number;
}

/** مصادر الزيارات — عدد الجلسات لكل مصدر UTM */
export async function getTrafficSources(days = 30): Promise<SourceStat[]> {
  const supabase = createAdminClient();
  const since = new Date(Date.now() - days * DAY_MS).toISOString();
  const { data } = await supabase
    .from("analytics_events")
    .select("utm_source, session_id")
    .eq("event_type", "page_view")
    .gte("created_at", since);

  const sessionsBySource = new Map<string, Set<string>>();
  for (const e of data ?? []) {
    const src = (e.utm_source as string | null) || DIRECT;
    const set = sessionsBySource.get(src) ?? new Set<string>();
    if (e.session_id) set.add(String(e.session_id));
    sessionsBySource.set(src, set);
  }
  return Array.from(sessionsBySource.entries())
    .map(([source, set]) => ({ source, count: set.size }))
    .sort((a, b) => b.count - a.count);
}

export interface SalesSourceStat {
  source: string;
  revenue: number;
  orders: number;
}

/** المبيعات حسب المصدر — من طلبات غير ملغاة */
export async function getSalesBySource(days = 30): Promise<SalesSourceStat[]> {
  const supabase = createAdminClient();
  const since = new Date(Date.now() - days * DAY_MS).toISOString();
  const { data } = await supabase
    .from("orders")
    .select("utm_source, total_amount, order_status")
    .gte("created_at", since);

  const map = new Map<string, { revenue: number; orders: number }>();
  for (const o of data ?? []) {
    if (o.order_status === "cancelled") continue;
    const src = (o.utm_source as string | null) || DIRECT;
    const cur = map.get(src) ?? { revenue: 0, orders: 0 };
    cur.revenue += Number(o.total_amount ?? 0);
    cur.orders += 1;
    map.set(src, cur);
  }
  return Array.from(map.entries())
    .map(([source, v]) => ({ source, ...v }))
    .sort((a, b) => b.revenue - a.revenue);
}

export interface ProductStat {
  name: string;
  quantity: number;
  revenue: number;
}

/** أفضل المنتجات مبيعاً */
export async function getBestSellers(days = 30, limit = 5): Promise<ProductStat[]> {
  const supabase = createAdminClient();
  const sinceDate = new Date(Date.now() - days * DAY_MS);
  const { data } = await supabase
    .from("order_items")
    .select("product_name, quantity, total_price, orders(order_status, created_at)");

  const map = new Map<string, { quantity: number; revenue: number }>();
  for (const it of data ?? []) {
    const order = it.orders as { order_status?: string; created_at?: string } | null;
    if (!order || order.order_status === "cancelled") continue;
    if (order.created_at && new Date(order.created_at) < sinceDate) continue;
    const name = String(it.product_name);
    const cur = map.get(name) ?? { quantity: 0, revenue: 0 };
    cur.quantity += Number(it.quantity ?? 0);
    cur.revenue += Number(it.total_price ?? 0);
    map.set(name, cur);
  }
  return Array.from(map.entries())
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit);
}

export interface DailySales {
  date: string;
  revenue: number;
  orders: number;
}

/** مبيعات يومية على مدى N يوم (مع تعبئة الأيام الفارغة) */
export async function getDailySales(days = 30): Promise<DailySales[]> {
  const supabase = createAdminClient();
  const sinceDate = new Date(Date.now() - (days - 1) * DAY_MS);
  sinceDate.setHours(0, 0, 0, 0);
  const { data } = await supabase
    .from("orders")
    .select("created_at, total_amount, order_status")
    .gte("created_at", sinceDate.toISOString());

  const map = new Map<string, { revenue: number; orders: number }>();
  for (const o of data ?? []) {
    if (o.order_status === "cancelled") continue;
    const day = String(o.created_at).slice(0, 10);
    const cur = map.get(day) ?? { revenue: 0, orders: 0 };
    cur.revenue += Number(o.total_amount ?? 0);
    cur.orders += 1;
    map.set(day, cur);
  }

  const result: DailySales[] = [];
  for (let i = 0; i < days; i++) {
    const key = new Date(sinceDate.getTime() + i * DAY_MS).toISOString().slice(0, 10);
    const v = map.get(key) ?? { revenue: 0, orders: 0 };
    result.push({ date: key, ...v });
  }
  return result;
}

export interface ConversionStat {
  sessions: number;
  purchases: number;
  rate: number;
}

/** معدّل التحويل — طلبات ÷ جلسات */
export async function getConversionRate(days = 30): Promise<ConversionStat> {
  const supabase = createAdminClient();
  const since = new Date(Date.now() - days * DAY_MS).toISOString();

  const { data: events } = await supabase
    .from("analytics_events")
    .select("session_id")
    .eq("event_type", "page_view")
    .gte("created_at", since);
  const sessions = new Set((events ?? []).map((e) => String(e.session_id)).filter(Boolean)).size;

  const { count } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .neq("order_status", "cancelled")
    .gte("created_at", since);
  const purchases = count ?? 0;

  const rate = sessions > 0 ? (purchases / sessions) * 100 : 0;
  return { sessions, purchases, rate };
}
