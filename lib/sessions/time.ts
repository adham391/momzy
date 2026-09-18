/**
 * حساب أوقات الجلسات — نصوص "HH:MM[:SS]" وتواريخ "YYYY-MM-DD" كما تخزّنها القاعدة.
 * بلا كائنات Date للأوقات: تحويلها يدخل التوقيت المحلي فيزحف الوقت ساعة.
 */

const MINUTES_PER_DAY = 24 * 60;

/** "18:30:00" → 1110 */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
}

/** 1110 → "18:30" — خارج اليوم يُعاد null (لا نلفّ حول منتصف الليل) */
export function minutesToTime(total: number): string | null {
  if (total < 0 || total >= MINUTES_PER_DAY) return null;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

/** "18:00" + 90 → "19:30" — null إن خرج عن اليوم */
export function addMinutesToTime(time: string, delta: number): string | null {
  return minutesToTime(timeToMinutes(time) + delta);
}

/** "2027-01-20" + 7 → "2027-01-27" (بتوقيت UTC كي لا يتغيّر اليوم) */
export function addDaysToDate(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** هل النهاية بعد البداية؟ */
export function isValidRange(start: string, end: string): boolean {
  return timeToMinutes(end) > timeToMinutes(start);
}

/**
 * مواعيد متتالية في يوم واحد: من `from` حتى `to`، كل جلسة `durationMin` دقيقة
 * وبينها `gapMin` استراحة. آخر جلسة تنتهي في `to` أو قبله.
 */
export function consecutiveTimes(
  from: string,
  to: string,
  durationMin: number,
  gapMin = 0
): { start: string; end: string }[] {
  const out: { start: string; end: string }[] = [];
  if (durationMin <= 0) return out;
  const limit = timeToMinutes(to);
  for (let s = timeToMinutes(from); s + durationMin <= limit; s += durationMin + gapMin) {
    const start = minutesToTime(s);
    const end = minutesToTime(s + durationMin);
    if (!start || !end) break;
    out.push({ start, end });
  }
  return out;
}

/** "10:00:00" → "10:00" */
export const shortTime = (time: string) => time.slice(0, 5);

/**
 * تاريخ اليوم بتوقيت إسرائيل "YYYY-MM-DD" — يُحسب على السيرفر ويُمرَّر للمكوّنات،
 * فلا يختلف «اليوم» بين سيرفر Vercel (UTC) ومتصفح الأم بعد منتصف الليل.
 */
export function israelTodayISO(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem" }).format(new Date());
}

const ISRAEL_WALL_CLOCK = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Jerusalem",
  hour12: false,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

/**
 * لحظة بداية جلسة (تاريخ ووقت بجدار ساعة إسرائيل) كوقت عالمي — للتذكيرات ولكشف رابط اللقاء.
 * الفارق عن UTC يُقاس في اللحظة نفسها فيحترم التوقيت الصيفي.
 */
export function israelDateTimeToUtc(date: string, time: string): Date {
  const [y, mo, d] = date.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  // تمريرتان: الأولى تقيس الفارق عند التخمين، والثانية عند الناتج — فتصحّ الساعات المجاورة لتبديل التوقيت
  const first = guess - israelOffsetMs(guess);
  return new Date(guess - israelOffsetMs(first));
}

/** فارق توقيت إسرائيل عن UTC (بالملّي ثانية) في لحظة بعينها */
function israelOffsetMs(instant: number): number {
  const parts = ISRAEL_WALL_CLOCK.formatToParts(new Date(instant));
  const part = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const wall = Date.UTC(part("year"), part("month") - 1, part("day"), part("hour") % 24, part("minute"));
  return wall - instant;
}

/** قبل الجلسة بكم ساعة يظهر رابط اللقاء/المكان للمسجِّلة في صفحتها — نفس مهلة تذكير اليوم السابق */
export const REVEAL_HOURS_BEFORE = 24;

/** هل الجلسة خلال `hours` ساعة من الآن (أو بدأت)؟ */
export function startsWithinHours(date: string, time: string, hours: number, now = new Date()): boolean {
  return israelDateTimeToUtc(date, time).getTime() - now.getTime() <= hours * 60 * 60 * 1000;
}

const WEEKDAYS_AR = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

/** اسم اليوم بالعربية — لعناوين الأيام في اللوحة */
export function weekdayAr(date: string): string {
  return WEEKDAYS_AR[new Date(`${date}T00:00:00`).getDay()];
}
