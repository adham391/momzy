/**
 * فترات الإحصائيات وتقسيمها الزمني — دوال صافية بلا قاعدة بيانات،
 * تتشاركها تبويبات التحليلات وتُختبر وحدها.
 *
 * الأيام تُحسب بتوقيت إسرائيل لا UTC: طلبٌ في الحادية عشرة ليلًا
 * يُحسب في يومه، لا في اليوم التالي كما يوحي تاريخه بتوقيت UTC.
 */

/** فترة الإحصائيات — عدد أيام، أو «الكل» منذ أول بيع */
export type StatsPeriod = 7 | 30 | 90 | "all";

/** دقّة المخطط — أيام للفترات المحدودة، وأشهر لـ«الكل» */
export type SeriesGranularity = "day" | "month";

/** نقطة في مخطط الإيرادات */
export interface SeriesPoint {
  /** بداية النقطة: YYYY-MM-DD لليوم، و YYYY-MM-01 للشهر */
  date: string;
  revenue: number;
  /** عدد الوحدات أو التسجيلات في النقطة */
  count: number;
}

/** حدث مالي يدخل المخطط — بيع أو تسجيل */
export interface RevenueEntry {
  /** وقت الحدث (ISO) */
  at: string;
  revenue: number;
  count: number;
}

/** الفترة حين لا يحدّد الرابط غيرها */
export const DEFAULT_PERIOD: StatsPeriod = 30;

/** خيارات مفتاح الفترة بترتيب العرض */
export const PERIOD_OPTIONS: readonly { value: StatsPeriod; label: string }[] = [
  { value: 7, label: "7 أيام" },
  { value: 30, label: "30 يومًا" },
  { value: 90, label: "90 يومًا" },
  { value: "all", label: "الكل" },
];

const STATS_TIME_ZONE = "Asia/Jerusalem";
const DAY_MS = 86_400_000;
const MONTHS_PER_YEAR = 12;
/** سقف أمان لعدد أشهر مخطط «الكل» — عشرون سنة */
const MAX_SERIES_MONTHS = 240;

/** يقرأ الفترة من الرابط — أي قيمة غير معروفة تعود للافتراضي */
export function parsePeriod(value: string | undefined): StatsPeriod {
  if (value === "all") return "all";
  const days = Number(value);
  return days === 7 || days === 30 || days === 90 ? days : DEFAULT_PERIOD;
}

/** وصف الفترة للعناوين: «آخر 30 يومًا» أو «منذ البداية» */
export function periodLabel(period: StatsPeriod): string {
  if (period === "all") return "منذ البداية";
  return `آخر ${PERIOD_OPTIONS.find((option) => option.value === period)?.label ?? ""}`;
}

/** يوم الحدث بتوقيت إسرائيل: YYYY-MM-DD */
export function localDayKey(at: string | Date): string {
  return new Date(at).toLocaleDateString("en-CA", { timeZone: STATS_TIME_ZONE });
}

/** يزيح مفتاح يوم بعدد أيام — حسابيًا على التقويم، فلا يتأثّر بالتوقيت الصيفي */
function shiftDayKey(dayKey: string, days: number): string {
  const [year, month, day] = dayKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

/** فترة محدودة بعدد أيام — كل الفترات عدا «الكل» */
export type DayPeriod = Exclude<StatsPeriod, "all">;

/** أول يوم داخل الفترة (شاملًا) — null لـ«الكل» */
export function periodFirstDay(period: DayPeriod, now?: Date): string;
export function periodFirstDay(period: StatsPeriod, now?: Date): string | null;
export function periodFirstDay(period: StatsPeriod, now: Date = new Date()): string | null {
  return period === "all" ? null : shiftDayKey(localDayKey(now), 1 - period);
}

/**
 * حدّ الاستعلام في قاعدة البيانات — يزيد يومًا احتياطًا لفارق التوقيت،
 * والتصفية الدقيقة بيوم إسرائيل تتمّ بعد الجلب (isInPeriod).
 */
export function periodQueryStart(period: DayPeriod, now?: Date): string;
export function periodQueryStart(period: StatsPeriod, now?: Date): string | null;
export function periodQueryStart(period: StatsPeriod, now: Date = new Date()): string | null {
  return period === "all" ? null : new Date(now.getTime() - (period + 1) * DAY_MS).toISOString();
}

/** هل وقع الحدث داخل الفترة؟ */
export function isInPeriod(at: string, firstDay: string | null): boolean {
  return firstDay === null || localDayKey(at) >= firstDay;
}

/** دقّة المخطط المناسبة للفترة */
export function granularityOf(period: StatsPeriod): SeriesGranularity {
  return period === "all" ? "month" : "day";
}

/** بداية شهر الحدث: YYYY-MM-01 */
function monthKey(at: string | Date): string {
  return `${localDayKey(at).slice(0, 7)}-01`;
}

/** أيام الفترة كاملة — من أولها حتى اليوم */
function dayKeys(days: number, now: Date): string[] {
  const today = localDayKey(now);
  return Array.from({ length: days }, (_, i) => shiftDayKey(today, i + 1 - days));
}

/** الأشهر من أقدم حدث حتى الشهر الحالي — الشهر الحالي وحده إن لم توجد أحداث */
function monthKeys(entries: RevenueEntry[], now: Date): string[] {
  const current = monthKey(now);
  const oldest = entries.reduce((min, entry) => {
    const key = monthKey(entry.at);
    return key < min ? key : min;
  }, current);

  let [year, month] = oldest.split("-").map(Number);
  const keys: string[] = [];
  for (let i = 0; i < MAX_SERIES_MONTHS; i++) {
    const key = `${year}-${String(month).padStart(2, "0")}-01`;
    keys.push(key);
    if (key >= current) break;
    month += 1;
    if (month > MONTHS_PER_YEAR) {
      month = 1;
      year += 1;
    }
  }
  return keys;
}

/**
 * يجمع الأحداث في نقاط متّصلة: الأيام أو الأشهر الخالية تظهر صفرًا،
 * كي لا يوحي المخطط ببيعٍ مستمرٍّ لم يحدث.
 */
export function buildSeries(
  entries: RevenueEntry[],
  period: StatsPeriod,
  now: Date = new Date()
): SeriesPoint[] {
  const bucketOf = period === "all" ? monthKey : localDayKey;
  const sums = new Map<string, { revenue: number; count: number }>();
  for (const entry of entries) {
    const key = bucketOf(entry.at);
    const sum = sums.get(key) ?? { revenue: 0, count: 0 };
    sum.revenue += entry.revenue;
    sum.count += entry.count;
    sums.set(key, sum);
  }

  const keys = period === "all" ? monthKeys(entries, now) : dayKeys(period, now);
  return keys.map((date) => ({ date, ...(sums.get(date) ?? { revenue: 0, count: 0 }) }));
}
