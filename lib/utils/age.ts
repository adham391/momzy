/**
 * عمر الطفل والفئة العمرية للورشة.
 *
 * قاعدة أساسية: العمر يُحسب **يوم الجلسة** لا يوم التسجيل —
 * فالطفل الذي عمره شهران اليوم يصبح ثلاثة أشهر في ورشة بعد شهر،
 * والأم الحامل قد تسجّل مسبقاً لورشة يكون طفلها قد وُلد قبلها.
 */

/**
 * الفئة العمرية للورشة — بأسماء حقول Sanity نفسها،
 * فيُمرَّر كائن `Service` مباشرةً بلا تحويل.
 * الحقول الرقمية فارغة ⇒ لا تحقّق (ورشات الحوامل مثلاً).
 */
export interface AgeGate {
  ageMinMonths?: number | null;
  ageMaxMonths?: number | null;
  /** نص الفئة للعرض بكلمات هبة — "4 أشهر - سنة" */
  ageRange?: string;
}

/** هل لهذه الورشة تحقّق عمري مُفعَّل؟ */
export function hasAgeGate(gate: AgeGate | undefined): boolean {
  return typeof gate?.ageMinMonths === "number" || typeof gate?.ageMaxMonths === "number";
}

/** صياغة عربية لعدد الأشهر */
export function monthsLabel(n: number): string {
  if (n === 0) return "أقل من شهر";
  if (n === 1) return "شهر واحد";
  if (n === 2) return "شهران";
  if (n <= 10) return `${n} أشهر`;
  return `${n} شهرًا`;
}

/** وحدة الأشهر وحدها — للمدى «0–3 أشهر» */
const monthsUnit = (n: number) => (n <= 10 ? "أشهر" : "شهرًا");

/** وصف تلقائي للمدى — "0–3 أشهر" · "من 3 أشهر فأكثر" · "حتى 6 أشهر" */
export function ageRangeLabel(gate: AgeGate): string {
  const min = gate.ageMinMonths;
  const max = gate.ageMaxMonths;
  if (typeof min === "number" && typeof max === "number") return `${min}–${max} ${monthsUnit(max)}`;
  if (typeof min === "number") return `من ${monthsLabel(min)} فأكثر`;
  if (typeof max === "number") return `حتى ${monthsLabel(max)}`;
  return "";
}

/** نص الفئة المعروض — كلمات هبة أولاً، وإلا صياغة تلقائية من الأشهر */
export function ageRangeText(gate: AgeGate): string {
  return gate.ageRange?.trim() || ageRangeLabel(gate);
}

/** تاريخ ISO صالح؟ (YYYY-MM-DD) */
function parseISO(iso: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const d = new Date(iso + "T00:00:00");
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * عدد الأشهر الكاملة بين تاريخ الميلاد ويوم الجلسة.
 * يعيد سالباً إذا لم يكن الطفل قد وُلد بعد يومها، و`null` لتاريخ غير صالح.
 */
export function ageInMonthsAt(birthISO: string, sessionISO: string): number | null {
  const birth = parseISO(birthISO);
  const session = parseISO(sessionISO);
  if (!birth || !session) return null;

  let months =
    (session.getFullYear() - birth.getFullYear()) * 12 + (session.getMonth() - birth.getMonth());
  // لم يُكمل الشهر الجاري بعد
  if (session.getDate() < birth.getDate()) months--;
  return months;
}

export interface AgeCheckResult {
  ok: boolean;
  /** عمر الطفل بالأشهر يوم الجلسة (null لتاريخ غير صالح) */
  months: number | null;
  /** سبب الرفض — رسالة عربية جاهزة للعرض */
  message?: string;
}

/**
 * التحقق من ملاءمة عمر الطفل لورشة في تاريخ معيّن.
 * الورشة بلا فئة عمرية تمرّ دائماً (لا تُسأل الأم أصلاً).
 */
export function checkBabyAge(
  birthISO: string,
  sessionISO: string,
  gate: AgeGate
): AgeCheckResult {
  if (!hasAgeGate(gate)) return { ok: true, months: null };

  const months = ageInMonthsAt(birthISO, sessionISO);
  if (months === null) {
    return { ok: false, months: null, message: "تاريخ الميلاد غير صحيح" };
  }

  const label = ageRangeText(gate);

  if (months < 0) {
    return {
      ok: false,
      months,
      message: `تاريخ الميلاد بعد موعد الورشة — هذه الورشة مخصّصة لـ${label}.`,
    };
  }

  const tooYoung = typeof gate.ageMinMonths === "number" && months < gate.ageMinMonths;
  const tooOld = typeof gate.ageMaxMonths === "number" && months > gate.ageMaxMonths;

  if (tooYoung || tooOld) {
    return {
      ok: false,
      months,
      message: `عمر طفلكِ يوم الورشة سيكون ${monthsLabel(months)}، وهذه الورشة مخصّصة لـ${label}.`,
    };
  }

  return { ok: true, months };
}
