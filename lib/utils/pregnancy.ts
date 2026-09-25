import { daysBetween } from "./age";

/**
 * أسبوع الحمل — بديل تاريخ ميلاد الطفل في الخدمات التي تسبق الولادة.
 *
 * لقاء التحضير لما بعد الولادة يُسأل فيه عن أسبوع الحمل لا عن عمر طفلٍ لم يُولد.
 * والأسبوع **يتقدّم**: من هي في أسبوعها الرابع عشر اليوم تكون في العشرين بعد ستّة
 * أسابيع، فالشرط يُقاس **يوم اللقاء** لا يوم التسجيل — كما يُقاس عمر الطفل يوم الورشة.
 */

/** أصغر أسبوع حمل يُقبل إدخاله */
export const MIN_PREGNANCY_WEEK = 4;

/** أكبر أسبوع — الحمل الكامل 40، ويُسمح بأسبوعين بعده */
export const MAX_PREGNANCY_WEEK = 42;

/** أسبوع حمل مقبول؟ (عدد صحيح داخل المدى) */
export function isPregnancyWeekValid(week: unknown): week is number {
  return (
    typeof week === "number" &&
    Number.isInteger(week) &&
    week >= MIN_PREGNANCY_WEEK &&
    week <= MAX_PREGNANCY_WEEK
  );
}

/** هل لهذه الخدمة سؤال أسبوع حمل؟ — الحقل فارغ ⇒ لا سؤال ولا تحقّق */
export function hasPregnancyGate(service: { minPregnancyWeek?: number | null } | undefined): boolean {
  return typeof service?.minPregnancyWeek === "number";
}

/** أسبوع الحمل في تاريخ لاحق — أسبوع لكل سبعة أيام مضت منذ الإدخال */
export function pregnancyWeekAt(weekAtEntry: number, entryISO: string, atISO: string): number | null {
  const days = daysBetween(entryISO, atISO);
  if (days === null) return null;
  return weekAtEntry + Math.floor(days / 7);
}

export interface PregnancyCheckResult {
  ok: boolean;
  /** الأسبوع يوم اللقاء — `null` لمُدخَل غير صالح */
  weekAtSession: number | null;
  message?: string;
}

/**
 * التحقق من أسبوع الحمل للتسجيل في لقاء — يُقاس **يوم اللقاء**.
 * قائمة الانتظار لا تستعمله: لا موعد بعد، فكل الأسابيع مقبولة.
 */
export function checkPregnancyWeek(
  weekAtEntry: unknown,
  todayISO: string,
  sessionISO: string,
  minWeek: number
): PregnancyCheckResult {
  if (!isPregnancyWeekValid(weekAtEntry)) {
    return { ok: false, weekAtSession: null, message: "اكتبي أسبوع الحمل" };
  }

  const weekAtSession = pregnancyWeekAt(weekAtEntry, todayISO, sessionISO);
  if (weekAtSession === null) {
    return { ok: false, weekAtSession: null, message: "تاريخ اللقاء غير صحيح" };
  }

  if (weekAtSession < minWeek) {
    return {
      ok: false,
      weekAtSession,
      message: `ستكونين في الأسبوع ${weekAtSession} يوم اللقاء، واللقاء من الأسبوع ${minWeek} فصاعدًا — اختاري موعدًا لاحقًا.`,
    };
  }

  return { ok: true, weekAtSession };
}
