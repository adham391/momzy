import { createAdminClient } from "@/lib/supabase/admin";
import { getProducts } from "@/lib/products/getProducts";
import { isDigitalProduct } from "@/lib/products/helpers";
import { getServices } from "@/lib/services/getServices";
import { toLatinDigits } from "@/lib/utils/format";
import type { GiftOptions } from "@/lib/store/cart";
import { fetchAllRows } from "./fetchAllRows";
import {
  localDayKey,
  periodFirstDay,
  periodQueryStart,
  type StatsPeriod,
} from "@/lib/stats/period";
import { isAwaitingPayment, isSettled } from "@/lib/stats/settlement";
import {
  aggregateReading,
  aggregateStoreSales,
  aggregateWorkshops,
  countAddToCart,
  countPageViews,
  type BookingLine,
  type BookletStats,
  type ReadingLine,
  type SaleLine,
  type SessionLine,
  type StoreActivity,
  type StoreStats,
  type TrackedEvent,
  type WaitlistLine,
  type WorkshopStats,
} from "@/lib/stats/aggregate";

/**
 * جلب إحصائيات الفئات من Supabase وSanity — ثم تسليمها لدوال التجميع
 * الصافية في lib/stats/aggregate.ts. هنا الاستعلامات فقط، والحساب هناك.
 */

/** أسماء المنتجات والخدمات في اللوحة — اللوحة عربية فقط */
const ADMIN_LOCALE = "ar";

/** هل سطر الطلب هدية؟ — للمستلِمة اسم أو عنوان (فيزيائي) أو بريد (رقمي) */
function isGiftLine(gift: unknown): boolean {
  const options = gift as GiftOptions | null;
  return Boolean(options && (options.recipientName || options.recipientAddress || options.recipientEmail));
}

/** الطلب المضمَّن في سطر order_items أو digital_downloads */
interface EmbeddedOrder {
  id: string;
  payment_status: string;
  order_status: string;
  total_amount: number | string | null;
  created_at: string;
}

/** حالة البيع لطلب — القاعدة في lib/stats/settlement.ts */
function orderSaleState(order: EmbeddedOrder): { paid: boolean; pending: boolean } {
  const amount = Number(order.total_amount ?? 0);
  const cancelled = order.order_status === "cancelled";
  return {
    paid: isSettled(order.payment_status, amount, cancelled),
    pending: isAwaitingPayment(order.payment_status, amount, cancelled),
  };
}

/** أعمدة الطلب المضمَّن التي يحتاجها الحساب */
const EMBEDDED_ORDER = "orders!inner(id, payment_status, order_status, total_amount, created_at)";

/* ── المتجر ── */

/** أسطر مبيعات نوع من المنتجات — مع حالة طلب كل سطر */
async function fetchSaleLines(type: "physical" | "digital", period: StatsPeriod): Promise<SaleLine[]> {
  const supabase = createAdminClient();
  const start = periodQueryStart(period);
  const rows = await fetchAllRows((from, to) => {
    let query = supabase
      .from("order_items")
      .select(`id, product_slug, product_name, quantity, total_price, gift, ${EMBEDDED_ORDER}`)
      .eq("product_type", type)
      .order("id")
      .range(from, to);
    if (start) query = query.gte("orders.created_at", start);
    return query;
  });

  return rows.map((row) => {
    const order = row.orders as EmbeddedOrder;
    return {
      slug: String(row.product_slug),
      name: toLatinDigits(String(row.product_name)),
      quantity: Number(row.quantity ?? 0),
      revenue: Number(row.total_price ?? 0),
      isGift: isGiftLine(row.gift),
      orderId: order.id,
      ...orderSaleState(order),
      at: order.created_at,
    };
  });
}

/** أحداث تتبّع من نوع واحد — مع تضييق اختياري على مسار الصفحة */
async function fetchEvents(
  eventType: "page_view" | "add_to_cart",
  period: StatsPeriod,
  pagePart?: string
): Promise<TrackedEvent[]> {
  const supabase = createAdminClient();
  const start = periodQueryStart(period);
  const rows = await fetchAllRows((from, to) => {
    let query = supabase
      .from("analytics_events")
      .select("id, page, product_slug, created_at")
      .eq("event_type", eventType)
      .order("id")
      .range(from, to);
    if (start) query = query.gte("created_at", start);
    if (pagePart) query = query.ilike("page", `%${pagePart}%`);
    return query;
  });

  return rows.map((row) => ({
    page: (row.page as string | null) ?? null,
    productSlug: (row.product_slug as string | null) ?? null,
    at: String(row.created_at),
  }));
}

/** مشاهدات صفحات المتجر وإضافات السلة في الفترة */
async function fetchStoreActivity(period: StatsPeriod): Promise<StoreActivity> {
  const [pageViews, carts] = await Promise.all([
    fetchEvents("page_view", period, "/shop/"),
    fetchEvents("add_to_cart", period),
  ]);
  const firstDay = periodFirstDay(period);
  return {
    views: countPageViews(pageViews, "shop", firstDay),
    addToCart: countAddToCart(carts, firstDay),
  };
}

/** إحصائيات المنتجات الفيزيائية */
export async function getProductStats(period: StatsPeriod): Promise<StoreStats> {
  const [lines, products, activity] = await Promise.all([
    fetchSaleLines("physical", period),
    getProducts(undefined, ADMIN_LOCALE),
    fetchStoreActivity(period),
  ]);
  const catalog = products
    .filter((product) => !isDigitalProduct(product))
    .map((product) => ({
      slug: product.slug,
      name: product.title,
      stock: typeof product.stockQuantity === "number" ? product.stockQuantity : null,
    }));
  return aggregateStoreSales(lines, catalog, activity, period);
}

/** روابط قراءة الكتيبات — مع حالة طلب كل رابط */
async function fetchReadingLines(period: StatsPeriod): Promise<ReadingLine[]> {
  const supabase = createAdminClient();
  const start = periodQueryStart(period);
  const rows = await fetchAllRows((from, to) => {
    let query = supabase
      .from("digital_downloads")
      .select(`id, product_slug, download_count, ${EMBEDDED_ORDER}`)
      .order("id")
      .range(from, to);
    if (start) query = query.gte("orders.created_at", start);
    return query;
  });

  return rows.map((row) => {
    const order = row.orders as EmbeddedOrder;
    return {
      slug: String(row.product_slug),
      opens: Number(row.download_count ?? 0),
      paid: orderSaleState(order).paid,
      at: order.created_at,
    };
  });
}

/** إحصائيات الكتيبات: المبيعات، وهل فُتحت روابط القراءة */
export async function getBookletStats(period: StatsPeriod): Promise<BookletStats> {
  const [lines, products, activity, readingLines] = await Promise.all([
    fetchSaleLines("digital", period),
    getProducts(undefined, ADMIN_LOCALE),
    fetchStoreActivity(period),
    fetchReadingLines(period),
  ]);
  const catalog = products
    .filter((product) => isDigitalProduct(product))
    .map((product) => ({ slug: product.slug, name: product.title, stock: null }));
  const reading = aggregateReading(readingLines, period);
  return {
    ...aggregateStoreSales(lines, catalog, activity, period),
    reading: reading.total,
    readingBySlug: reading.bySlug,
  };
}

/* ── الورشات ── */

/** تسجيلات الفترة */
async function fetchBookingLines(period: StatsPeriod): Promise<BookingLine[]> {
  const supabase = createAdminClient();
  const start = periodQueryStart(period);
  const rows = await fetchAllRows((from, to) => {
    let query = supabase
      .from("bookings")
      .select("id, service_slug, service_name, amount, status, payment_status, created_at")
      .order("id")
      .range(from, to);
    if (start) query = query.gte("created_at", start);
    return query;
  });

  return rows.map((row) => {
    const amount = Number(row.amount ?? 0);
    const cancelled = row.status === "cancelled";
    const paymentStatus = String(row.payment_status);
    return {
      slug: (row.service_slug as string | null) ?? null,
      name: row.service_name ? toLatinDigits(String(row.service_name)) : null,
      amount,
      paid: isSettled(paymentStatus, amount, cancelled),
      pending: isAwaitingPayment(paymentStatus, amount, cancelled),
      at: String(row.created_at),
    };
  });
}

/** الجلسات القادمة غير المحجوبة — من اليوم بتوقيت إسرائيل */
async function fetchUpcomingSessions(): Promise<SessionLine[]> {
  const supabase = createAdminClient();
  const rows = await fetchAllRows((from, to) =>
    supabase
      .from("availability")
      .select("id, service_slug, service_name, capacity, booked_count")
      .eq("is_blocked", false)
      .gte("date", localDayKey(new Date()))
      .order("id")
      .range(from, to)
  );

  return rows.map((row) => ({
    slug: (row.service_slug as string | null) ?? null,
    name: row.service_name ? toLatinDigits(String(row.service_name)) : null,
    capacity: Number(row.capacity ?? 0),
    booked: Number(row.booked_count ?? 0),
  }));
}

/** المنتظِرات اللواتي لم يُشعَرن بعد */
async function fetchOpenWaitlist(): Promise<WaitlistLine[]> {
  const supabase = createAdminClient();
  const rows = await fetchAllRows((from, to) =>
    supabase
      .from("waitlist")
      .select("id, service_slug, service_name")
      .eq("is_notified", false)
      .order("id")
      .range(from, to)
  );

  return rows.map((row) => ({
    slug: String(row.service_slug),
    name: row.service_name ? toLatinDigits(String(row.service_name)) : null,
  }));
}

/** إحصائيات الورشات واللقاءات */
export async function getWorkshopStats(period: StatsPeriod): Promise<WorkshopStats> {
  const [bookings, sessions, waitlist, services, pageViews] = await Promise.all([
    fetchBookingLines(period),
    fetchUpcomingSessions(),
    fetchOpenWaitlist(),
    getServices(undefined, ADMIN_LOCALE),
    fetchEvents("page_view", period, "/services/"),
  ]);
  return aggregateWorkshops(
    {
      bookings,
      sessions,
      waitlist,
      // خدمات التسجيل عبر واتساب لا تمرّ بنظام الحجز، فلا أرقام لها هنا
      catalog: services
        .filter((service) => !service.whatsappOnly)
        .map((service) => ({ slug: service.slug, name: service.title })),
      views: countPageViews(pageViews, "services", periodFirstDay(period)),
    },
    period
  );
}
