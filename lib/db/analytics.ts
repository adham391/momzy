import { createAdminClient } from "@/lib/supabase/admin";
import { buildSeries, periodQueryStart, type SeriesPoint, type StatsPeriod } from "@/lib/stats/period";
import { isSettled, SETTLED_ORDER_FILTER } from "@/lib/stats/settlement";
import { fetchAllRows } from "./fetchAllRows";

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

/* ── استعلامات «نظرة عامة» ──
 * المبيعات هنا للطلبات المدفوعة (أو المجانية) غير الملغاة فقط — القاعدة نفسها
 * في لوحة التحكم وتبويبات الفئات (lib/stats/settlement.ts).
 * كل استعلام يُجلب على دفعات: Supabase يقطع النتيجة عند 1000 صف بصمت. */

/** بداية نافذة N يوم (ISO) */
function sinceISO(days: number): string {
  return new Date(Date.now() - days * DAY_MS).toISOString();
}

/** زيارة صفحة مختصرة — مصدرها وجلستها */
interface PageViewSession {
  source: string;
  sessionId: string | null;
}

/** زيارات الصفحات في الفترة */
async function fetchPageViewSessions(days: number): Promise<PageViewSession[]> {
  const supabase = createAdminClient();
  const since = sinceISO(days);
  const rows = await fetchAllRows((from, to) =>
    supabase
      .from("analytics_events")
      .select("id, utm_source, session_id")
      .eq("event_type", "page_view")
      .gte("created_at", since)
      .order("id")
      .range(from, to)
  );
  return rows.map((row) => ({
    source: (row.utm_source as string | null) || DIRECT,
    sessionId: row.session_id ? String(row.session_id) : null,
  }));
}

export interface SourceStat {
  source: string;
  count: number;
}

/** مصادر الزيارات — عدد الجلسات لكل مصدر UTM */
export async function getTrafficSources(days = 30): Promise<SourceStat[]> {
  const sessionsBySource = new Map<string, Set<string>>();
  for (const view of await fetchPageViewSessions(days)) {
    const set = sessionsBySource.get(view.source) ?? new Set<string>();
    if (view.sessionId) set.add(view.sessionId);
    sessionsBySource.set(view.source, set);
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

/** المبيعات حسب المصدر — الطلبات المدفوعة فقط */
export async function getSalesBySource(days = 30): Promise<SalesSourceStat[]> {
  const supabase = createAdminClient();
  const since = sinceISO(days);
  const rows = await fetchAllRows((from, to) =>
    supabase
      .from("orders")
      .select("id, utm_source, total_amount")
      .or(SETTLED_ORDER_FILTER)
      .neq("order_status", "cancelled")
      .gte("created_at", since)
      .order("id")
      .range(from, to)
  );

  const map = new Map<string, { revenue: number; orders: number }>();
  for (const order of rows) {
    const src = (order.utm_source as string | null) || DIRECT;
    const cur = map.get(src) ?? { revenue: 0, orders: 0 };
    cur.revenue += Number(order.total_amount ?? 0);
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

/** أفضل المنتجات مبيعًا — من الطلبات المدفوعة فقط */
export async function getBestSellers(days = 30, limit = 5): Promise<ProductStat[]> {
  const supabase = createAdminClient();
  const since = sinceISO(days);
  const rows = await fetchAllRows((from, to) =>
    supabase
      .from("order_items")
      .select("id, product_name, quantity, total_price, orders!inner(payment_status, order_status, total_amount)")
      .gte("orders.created_at", since)
      .order("id")
      .range(from, to)
  );

  const map = new Map<string, { quantity: number; revenue: number }>();
  for (const item of rows) {
    const order = item.orders as { payment_status: string; order_status: string; total_amount: number | string | null };
    if (!isSettled(order.payment_status, Number(order.total_amount ?? 0), order.order_status === "cancelled")) continue;
    const name = String(item.product_name);
    const cur = map.get(name) ?? { quantity: 0, revenue: 0 };
    cur.quantity += Number(item.quantity ?? 0);
    cur.revenue += Number(item.total_price ?? 0);
    map.set(name, cur);
  }
  return Array.from(map.entries())
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit);
}

/** مبيعات يومية على مدى الفترة — الطلبات المدفوعة، بأيام إسرائيل، والأيام الخالية صفر */
export async function getDailySales(period: StatsPeriod = 30): Promise<SeriesPoint[]> {
  const supabase = createAdminClient();
  const start = periodQueryStart(period);
  const rows = await fetchAllRows((from, to) => {
    let query = supabase
      .from("orders")
      .select("id, created_at, total_amount")
      .or(SETTLED_ORDER_FILTER)
      .neq("order_status", "cancelled")
      .order("id")
      .range(from, to);
    if (start) query = query.gte("created_at", start);
    return query;
  });

  return buildSeries(
    rows.map((order) => ({ at: String(order.created_at), revenue: Number(order.total_amount ?? 0), count: 1 })),
    period
  );
}

export interface ConversionStat {
  sessions: number;
  purchases: number;
  rate: number;
}

/** معدّل التحويل — طلبات مدفوعة ÷ جلسات */
export async function getConversionRate(days = 30): Promise<ConversionStat> {
  const supabase = createAdminClient();
  const [views, { count }] = await Promise.all([
    fetchPageViewSessions(days),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .or(SETTLED_ORDER_FILTER)
      .neq("order_status", "cancelled")
      .gte("created_at", sinceISO(days)),
  ]);

  const sessions = new Set(views.map((view) => view.sessionId).filter((id): id is string => Boolean(id))).size;
  const purchases = count ?? 0;
  const rate = sessions > 0 ? (purchases / sessions) * 100 : 0;
  return { sessions, purchases, rate };
}
