/**
 * تجميع إحصائيات الفئات — دوال صافية تستقبل صفوفًا جاهزة وتعيد الأرقام.
 * الجلب من قاعدة البيانات في lib/db/categoryStats.ts؛ الفصل يسمح باختبار
 * الحساب وحده بلا قاعدة بيانات.
 *
 * «البيع» هنا ما تقرّره lib/stats/settlement.ts: مدفوع أو مجاني، وغير ملغى.
 * ما عليه مبلغ ولم يُدفع يُعدّ منفصلًا («بانتظار الدفع») ولا يدخل في الإيرادات.
 */

import {
  buildSeries,
  granularityOf,
  isInPeriod,
  periodFirstDay,
  type SeriesGranularity,
  type SeriesPoint,
  type StatsPeriod,
} from "./period";

/** مجموع قيمة عبر قائمة */
function sum<T>(rows: T[], pick: (row: T) => number): number {
  return rows.reduce((total, row) => total + pick(row), 0);
}

/* ── نشاط الزوّار ── */

/** قسم من الموقع تُحصى مشاهدات صفحات عناصره */
export type ViewSection = "shop" | "services";

/** حدث تتبّع مختصر */
export interface TrackedEvent {
  page: string | null;
  productSlug: string | null;
  /** وقت الحدث (ISO) */
  at: string;
}

/** مسار صفحة عنصر بأي لغة — العربية بلا بادئة، والعبرية والإنجليزية ببادئتها */
function itemPagePattern(section: ViewSection): RegExp {
  return new RegExp(`^(?:/(?:he|en))?/${section}/([^/?#]+)`);
}

/** مشاهدات صفحة كل عنصر داخل الفترة — من أحداث page_view */
export function countPageViews(
  events: TrackedEvent[],
  section: ViewSection,
  firstDay: string | null
): Map<string, number> {
  const pattern = itemPagePattern(section);
  const views = new Map<string, number>();
  for (const event of events) {
    if (!event.page || !isInPeriod(event.at, firstDay)) continue;
    const slug = pattern.exec(event.page)?.[1];
    if (slug) views.set(slug, (views.get(slug) ?? 0) + 1);
  }
  return views;
}

/** إضافات كل منتج للسلة داخل الفترة — من أحداث add_to_cart */
export function countAddToCart(events: TrackedEvent[], firstDay: string | null): Map<string, number> {
  const counts = new Map<string, number>();
  for (const event of events) {
    if (!event.productSlug || !isInPeriod(event.at, firstDay)) continue;
    counts.set(event.productSlug, (counts.get(event.productSlug) ?? 0) + 1);
  }
  return counts;
}

/* ── المتجر: المنتجات والكتيبات ── */

/** سطر مبيع من order_items مع حالة طلبه */
export interface SaleLine {
  slug: string;
  name: string;
  quantity: number;
  /** سعر السطر — قبل كوبون الطلب ودون الشحن */
  revenue: number;
  isGift: boolean;
  orderId: string;
  /** يُحسب بيعًا — مدفوع أو مجاني، وغير ملغى (lib/stats/settlement.ts) */
  paid: boolean;
  /** عليه مبلغ ولم يُدفع ولم يُلغَ */
  pending: boolean;
  /** وقت إنشاء الطلب (ISO) */
  at: string;
}

/** عنصر معروض في الفئة — يظهر في القائمة حتى بلا مبيعات */
export interface CatalogItem {
  slug: string;
  name: string;
  /** المخزون المتبقي الآن — null حين لا حدّ له */
  stock: number | null;
}

/** نشاط الزوّار حول عناصر الفئة */
export interface StoreActivity {
  views: Map<string, number>;
  addToCart: Map<string, number>;
}

/** أرقام عنصر واحد في الفترة */
export interface StoreItemStat {
  slug: string;
  name: string;
  units: number;
  revenue: number;
  gifts: number;
  views: number;
  addToCart: number;
  stock: number | null;
}

/** أرقام فئة كاملة في الفترة */
export interface StoreStats {
  revenue: number;
  units: number;
  /** طلبات مدفوعة فيها عنصر واحد على الأقل من الفئة */
  orders: number;
  gifts: number;
  /** طلبات لم يكتمل دفعها فيها عنصر من الفئة */
  unpaidOrders: number;
  series: SeriesPoint[];
  granularity: SeriesGranularity;
  items: StoreItemStat[];
}

/** يرتّب العناصر: الأعلى إيرادًا، ثم الأكثر وحدات، ثم الأكثر مشاهدة */
function byStorePerformance(a: StoreItemStat, b: StoreItemStat): number {
  return b.revenue - a.revenue || b.units - a.units || b.views - a.views;
}

/**
 * يجمع مبيعات فئة من المتجر. العناصر تبدأ من الكتالوج (فتظهر بصفر مبيعات)،
 * ويُضاف إليها ما بيع ثم حُذف من Sanity، باسمه المحفوظ في الطلب.
 */
export function aggregateStoreSales(
  lines: SaleLine[],
  catalog: CatalogItem[],
  activity: StoreActivity,
  period: StatsPeriod,
  now: Date = new Date()
): StoreStats {
  const firstDay = periodFirstDay(period, now);
  const inPeriod = lines.filter((line) => isInPeriod(line.at, firstDay));
  const paid = inPeriod.filter((line) => line.paid);

  const items = new Map<string, StoreItemStat>();
  const itemFor = (slug: string, name: string, stock: number | null): StoreItemStat => {
    const existing = items.get(slug);
    if (existing) return existing;
    const created: StoreItemStat = {
      slug,
      name,
      units: 0,
      revenue: 0,
      gifts: 0,
      views: activity.views.get(slug) ?? 0,
      addToCart: activity.addToCart.get(slug) ?? 0,
      stock,
    };
    items.set(slug, created);
    return created;
  };

  for (const entry of catalog) itemFor(entry.slug, entry.name, entry.stock);
  for (const line of paid) {
    const item = itemFor(line.slug, line.name, null);
    item.units += line.quantity;
    item.revenue += line.revenue;
    if (line.isGift) item.gifts += line.quantity;
  }

  const list = [...items.values()];
  return {
    revenue: sum(list, (item) => item.revenue),
    units: sum(list, (item) => item.units),
    orders: new Set(paid.map((line) => line.orderId)).size,
    gifts: sum(list, (item) => item.gifts),
    unpaidOrders: new Set(inPeriod.filter((line) => line.pending).map((line) => line.orderId)).size,
    series: buildSeries(
      paid.map((line) => ({ at: line.at, revenue: line.revenue, count: line.quantity })),
      period,
      now
    ),
    granularity: granularityOf(period),
    items: list.sort(byStorePerformance),
  };
}

/* ── قراءة الكتيبات ── */

/** رابط قراءة واحد (digital_downloads) مع حالة طلبه */
export interface ReadingLine {
  slug: string;
  /** مرات فتح الرابط */
  opens: number;
  paid: boolean;
  /** وقت إنشاء الطلب (ISO) */
  at: string;
}

/** قراءة كتيب واحد، أو كل الكتيبات */
export interface ReadingStat {
  /** روابط قراءة لطلبات مدفوعة */
  links: number;
  /** روابط فُتحت مرة على الأقل */
  opened: number;
  /** مجموع مرات الفتح */
  opens: number;
}

/** أرقام الكتيبات: المبيعات وقراءة الروابط */
export interface BookletStats extends StoreStats {
  reading: ReadingStat;
  readingBySlug: Record<string, ReadingStat>;
}

/** قراءة فارغة — لكتيب لم يُبع بعد */
export const EMPTY_READING: ReadingStat = { links: 0, opened: 0, opens: 0 };

/** يجمع قراءة روابط الطلبات المدفوعة في الفترة: لكل كتيب، ولكلها معًا */
export function aggregateReading(
  lines: ReadingLine[],
  period: StatsPeriod,
  now: Date = new Date()
): { total: ReadingStat; bySlug: Record<string, ReadingStat> } {
  const firstDay = periodFirstDay(period, now);
  const total: ReadingStat = { ...EMPTY_READING };
  const bySlug: Record<string, ReadingStat> = {};

  for (const line of lines) {
    if (!line.paid || !isInPeriod(line.at, firstDay)) continue;
    const stat = (bySlug[line.slug] ??= { ...EMPTY_READING });
    for (const target of [stat, total]) {
      target.links += 1;
      target.opens += line.opens;
      if (line.opens > 0) target.opened += 1;
    }
  }
  return { total, bySlug };
}

/* ── الورشات واللقاءات ── */

/** تسجيل واحد في ورشة أو لقاء */
export interface BookingLine {
  slug: string | null;
  name: string | null;
  /** سعر الجلسة كاملًا */
  amount: number;
  /** ما قُبض لحظة الحجز — العربون إن وُجد، وإلا المبلغ كاملًا */
  received: number;
  paid: boolean;
  pending: boolean;
  /** وقت التسجيل (ISO) */
  at: string;
}

/** باقي مبلغٍ حُصّل بعد العربون — إيراد بتاريخ تحصيله */
export interface CollectionLine {
  slug: string | null;
  name: string | null;
  amount: number;
  /** لحظة التحصيل (ISO) */
  at: string;
}

/** جلسة قادمة بمقاعدها */
export interface SessionLine {
  slug: string | null;
  name: string | null;
  capacity: number;
  booked: number;
}

/** منتظِرة لم تُشعَر بعد بمكان متاح */
export interface WaitlistLine {
  slug: string;
  name: string | null;
}

/** أرقام ورشة أو لقاء واحد */
export interface WorkshopItemStat {
  /** slug الخدمة، أو اسمها حين لا slug */
  key: string;
  name: string;
  registrations: number;
  revenue: number;
  views: number;
  upcomingSessions: number;
  seatsBooked: number;
  seatsTotal: number;
  waitlist: number;
}

/** أرقام الورشات كلها */
export interface WorkshopStats {
  revenue: number;
  registrations: number;
  /** تسجيلات الفترة التي لم يكتمل دفعها */
  unpaid: number;
  /** الوضع الحالي لا الفترة: الجلسات القادمة ومقاعدها وقائمة الانتظار */
  upcomingSessions: number;
  seatsBooked: number;
  seatsTotal: number;
  waitlist: number;
  series: SeriesPoint[];
  granularity: SeriesGranularity;
  items: WorkshopItemStat[];
}

/** مدخلات تجميع الورشات */
export interface WorkshopInput {
  bookings: BookingLine[];
  /** بواقي عُربونات حُصّلت في الفترة — إيرادها ليوم تحصيلها لا يوم حجزها */
  collections: CollectionLine[];
  sessions: SessionLine[];
  waitlist: WaitlistLine[];
  /** الخدمات القابلة للحجز — تظهر حتى بلا تسجيلات */
  catalog: { slug: string; name: string }[];
  views: Map<string, number>;
}

/** اسم احتياطي لتسجيل بلا خدمة معروفة */
const UNKNOWN_SERVICE = "خدمة غير محدّدة";

/** يرتّب الورشات: الأعلى إيرادًا، ثم الأكثر تسجيلًا، ثم الأكثر مقاعد محجوزة */
function byWorkshopPerformance(a: WorkshopItemStat, b: WorkshopItemStat): number {
  return (
    b.revenue - a.revenue ||
    b.registrations - a.registrations ||
    b.seatsBooked - a.seatsBooked ||
    b.views - a.views
  );
}

/** يجمع أرقام الورشات: تسجيلات الفترة، ومعها الوضع الحالي للجلسات والانتظار */
export function aggregateWorkshops(
  input: WorkshopInput,
  period: StatsPeriod,
  now: Date = new Date()
): WorkshopStats {
  const firstDay = periodFirstDay(period, now);
  const inPeriod = input.bookings.filter((booking) => isInPeriod(booking.at, firstDay));
  const paid = inPeriod.filter((booking) => booking.paid);

  const items = new Map<string, WorkshopItemStat>();
  const itemFor = (slug: string | null, name: string | null): WorkshopItemStat => {
    const key = slug ?? name ?? UNKNOWN_SERVICE;
    const existing = items.get(key);
    if (existing) return existing;
    const created: WorkshopItemStat = {
      key,
      name: name ?? slug ?? UNKNOWN_SERVICE,
      registrations: 0,
      revenue: 0,
      views: slug ? input.views.get(slug) ?? 0 : 0,
      upcomingSessions: 0,
      seatsBooked: 0,
      seatsTotal: 0,
      waitlist: 0,
    };
    items.set(key, created);
    return created;
  };

  for (const service of input.catalog) itemFor(service.slug, service.name);
  for (const booking of paid) {
    const item = itemFor(booking.slug, booking.name);
    item.registrations += 1;
    // المقبوض وقت الحجز — والباقي يأتي في بند التحصيل بتاريخه
    item.revenue += booking.received;
  }
  const collected = input.collections.filter((line) => isInPeriod(line.at, firstDay));
  for (const line of collected) itemFor(line.slug, line.name).revenue += line.amount;
  for (const session of input.sessions) {
    const item = itemFor(session.slug, session.name);
    item.upcomingSessions += 1;
    item.seatsBooked += session.booked;
    item.seatsTotal += session.capacity;
  }
  for (const entry of input.waitlist) itemFor(entry.slug, entry.name).waitlist += 1;

  const list = [...items.values()];
  return {
    revenue: sum(list, (item) => item.revenue),
    registrations: paid.length,
    unpaid: inPeriod.filter((booking) => booking.pending).length,
    upcomingSessions: sum(list, (item) => item.upcomingSessions),
    seatsBooked: sum(list, (item) => item.seatsBooked),
    seatsTotal: sum(list, (item) => item.seatsTotal),
    waitlist: sum(list, (item) => item.waitlist),
    series: buildSeries(
      [
        ...paid.map((booking) => ({ at: booking.at, revenue: booking.received, count: 1 })),
        // التحصيل إيرادٌ بلا تسجيل جديد — فلا يُحتسب في العدّ
        ...collected.map((line) => ({ at: line.at, revenue: line.amount, count: 0 })),
      ],
      period,
      now
    ),
    granularity: granularityOf(period),
    items: list.sort(byWorkshopPerformance),
  };
}
