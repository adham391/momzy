/**
 * عمر الطفل والفئة العمرية للورشة.
 *
 * قاعدة أساسية: العمر يُحسب **يوم الجلسة** لا يوم التسجيل —
 * فالطفل الذي عمره شهران اليوم يصبح ثلاثة أشهر في ورشة بعد شهر،
 * والأم الحامل قد تسجّل مسبقًا لورشة يكون طفلها قد وُلد قبلها.
 */

/**
 * الفئة العمرية للورشة — بأسماء حقول Sanity نفسها،
 * فيُمرَّر كائن `Service` مباشرةً بلا تحويل.
 * الحقول الرقمية فارغة ⇒ لا تحقّق (ورشات الحوامل مثلًا).
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

/** نص الفئة المعروض — كلمات هبة أولًا، وإلا صياغة تلقائية من الأشهر */
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
 * يعيد سالبًا إذا لم يكن الطفل قد وُلد بعد يومها، و`null` لتاريخ غير صالح.
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

/* ═══ الخداج والعمر المصحَّح ═══ */

/**
 * الطفل الخديج يُقاس بعمره **المصحَّح**: عمره من يوم ولادته ناقصًا ما سبق به موعده.
 * مولود في الأسبوع 32 يسبق موعده بثمانية أسابيع، فابن الستّة أشهر منهم عمره
 * المصحَّح أربعة — وهو ما يحدّد ما يقدر عليه في الورشة، لا رقم مواليده.
 *
 * التطبيق: نؤخّر **تاريخ الميلاد** بمقدار التصحيح ونمرّره لدوال العمر كما هي،
 * فلا تعرف الدوالّ الأخرى شيئًا عن الخداج.
 */

/** أسابيع الحمل الكاملة — الولادة في موعدها */
export const FULL_TERM_WEEKS = 40;

/** أصغر أسبوع ولادة مقبول */
export const MIN_GESTATIONAL_WEEKS = 22;

/** أكبر أسبوع يُعدّ خداجًا — الطبّ: ما قبل الأسبوع 37 */
export const MAX_PRETERM_WEEKS = 36;

/** أسبوع ولادة مقبول؟ (عدد صحيح داخل المدى) */
export function isGestationalWeeksValid(weeks: unknown): weeks is number {
  return (
    typeof weeks === "number" &&
    Number.isInteger(weeks) &&
    weeks >= MIN_GESTATIONAL_WEEKS &&
    weeks <= MAX_PRETERM_WEEKS
  );
}

/** هل يُصحَّح عمر هذا الطفل؟ — بلا أسبوع ولادة أو بولادة في موعدها: لا */
export function hasCorrectedAge(gestationalWeeks?: number | null): boolean {
  return isGestationalWeeksValid(gestationalWeeks);
}

/** تاريخ الميلاد المصحَّح — يُؤخَّر بمقدار ما سبق الطفلُ موعده، فيُقاس منه عمره */
export function correctedBirthDate(birthISO: string, gestationalWeeks?: number | null): string {
  if (!hasCorrectedAge(gestationalWeeks)) return birthISO;
  const birth = parseISO(birthISO);
  if (!birth) return birthISO;
  const corrected = new Date(birth);
  corrected.setDate(corrected.getDate() + (FULL_TERM_WEEKS - (gestationalWeeks as number)) * 7);
  return toISODate(corrected);
}

/** هل وُلد الطفل بحلول هذا التاريخ؟ */
function bornBy(birthISO: string, atISO: string): boolean {
  const days = daysBetween(birthISO, atISO);
  return days !== null && days >= 0;
}

/**
 * العمر المقيس: بالأشهر وبنصّ للعرض، مصحَّحًا للخديج.
 *
 * **المولود لا يصير غير مولود**: الخديج في أسبوعه الثالث عمره المصحَّح سالب
 * (لم يبلغ بعد موعد ولادته)، فنثبّته عند الصفر — وإلا رفضته ورشة تبدأ من يوم
 * الولادة، وهي أحوج ما تكون إليها.
 */
function measuredAge(
  birthISO: string,
  atISO: string,
  gestationalWeeks?: number | null
): { months: number | null; label: string } {
  const measured = correctedBirthDate(birthISO, gestationalWeeks);
  const months = ageInMonthsAt(measured, atISO);
  if (hasCorrectedAge(gestationalWeeks) && bornBy(birthISO, atISO) && months !== null && months < 0) {
    return { months: 0, label: monthsLabel(0) };
  }
  return { months, label: babyAgeDetailedLabel(measured, atISO) };
}

/** نصّ العمر المصحَّح — `null` لطفل لا يُصحَّح عمره (فلا يُعرض السطر أصلًا) */
export function correctedAgeLabel(
  birthISO: string,
  atISO: string,
  gestationalWeeks?: number | null
): string | null {
  if (!hasCorrectedAge(gestationalWeeks)) return null;
  return measuredAge(birthISO, atISO, gestationalWeeks).label;
}

/** صياغة عربية لعدد الأيام */
export function daysLabel(n: number): string {
  if (n <= 0) return "يومه الأول";
  if (n === 1) return "يوم واحد";
  if (n === 2) return "يومان";
  if (n <= 10) return `${n} أيام`;
  return `${n} يومًا`;
}

/** مدة اليوم بالملّي ثانية — للفرق بين تاريخين */
const MS_PER_DAY = 86_400_000;

/** عدد الأيام بين تاريخين (YYYY-MM-DD) بالتقويم — عبر UTC فلا يزيحه التوقيت الصيفي يومًا */
export function daysBetween(fromISO: string, toISO: string): number | null {
  if (!parseISO(fromISO) || !parseISO(toISO)) return null;
  const utc = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((utc(toISO) - utc(fromISO)) / MS_PER_DAY);
}

/**
 * عمر الطفل يوم الجلسة كما تراه هبة — بالأيام قبل أن يُكمل شهره الأول، وبالأشهر بعده.
 * في ورشة الأيام الأولى الفرق بين طفل عمره 3 أيام وآخر عمره 25 يومًا يعني لها الكثير.
 */
export function babyAgeAtLabel(birthISO: string, sessionISO: string): string {
  const months = ageInMonthsAt(birthISO, sessionISO);
  if (months === null) return "—";
  if (months < 0) return "لم يُولد بعد يوم الورشة";
  if (months >= 1) return monthsLabel(months);
  const days = daysBetween(birthISO, sessionISO);
  return days === null ? "—" : daysLabel(days);
}

/**
 * مهلة قائمة الانتظار — نصف شهر تحت الحدّ الأدنى.
 *
 * المنتظِرة لا تحجز اليوم بل تنتظر موعدًا يُفتح لاحقًا، فطفلها الذي يقصّر عن
 * السنّ بأسبوعين سيبلغها قبل الجلسة. الحدّ الأقصى يبقى صارمًا: الطفل يكبر ولا يصغر.
 */
export const WAITLIST_GRACE_DAYS = 15;

/** تاريخ (YYYY-MM-DD) من كائن Date بالتقويم المحلي */
function toISODate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * كم يومًا يفصل الطفل عن بلوغه عمرًا معيّنًا بالأشهر — سالب إن بلغه.
 * يُقاس بالتاريخ لا بالأشهر الكاملة، فنصف الشهر يُحسب بدقّة.
 */
export function daysUntilAgeMonths(birthISO: string, months: number, fromISO: string): number | null {
  const birth = parseISO(birthISO);
  if (!birth) return null;
  const target = new Date(birth);
  target.setMonth(target.getMonth() + months);
  return daysBetween(fromISO, toISODate(target));
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
 * الورشة بلا فئة عمرية تمرّ دائمًا (لا تُسأل الأم أصلًا).
 *
 * الخديج يُقاس بعمره المصحَّح — فقد يبلغ طفلٌ سنَّ الورشة بتاريخ مواليده
 * ولا يبلغها بعمره المصحَّح. والرسالة تقول «العمر المصحّح» ولا تذكر الخداج:
 * الأم تعرف حال طفلها، وليس من شأن رسالةٍ أن تُذكّرها به.
 */
export function checkBabyAge(
  birthISO: string,
  sessionISO: string,
  gate: AgeGate,
  gestationalWeeks?: number | null
): AgeCheckResult {
  if (!hasAgeGate(gate)) return { ok: true, months: null };

  const corrected = hasCorrectedAge(gestationalWeeks);
  const { months, label: ageLabel } = measuredAge(birthISO, sessionISO, gestationalWeeks);
  if (months === null) {
    return { ok: false, months: null, message: "تاريخ الميلاد غير صحيح" };
  }

  const label = ageRangeText(gate);

  /*
   * لم يُولد بعد يوم الجلسة (موعد متوقّع — أم حامل).
   * يمنعه **الحدّ الأدنى** وحده: ورشة تبدأ من شهر مولودٍ تحتاج مولودًا.
   * أمّا حدٌّ أقصى بلا أدنى فلا يمنعه — الجنين أصغر من أي سقف، وورشة
   * التحضير لما بعد الولادة موجَّهة للحوامل أصلًا.
   */
  if (months < 0) {
    if (typeof gate.ageMinMonths === "number") {
      return {
        ok: false,
        months,
        message: `تاريخ الميلاد بعد موعد الورشة — هذه الورشة مخصّصة لـ${label}.`,
      };
    }
    return { ok: true, months };
  }

  const tooYoung = typeof gate.ageMinMonths === "number" && months < gate.ageMinMonths;
  const tooOld = typeof gate.ageMaxMonths === "number" && months > gate.ageMaxMonths;

  if (tooYoung || tooOld) {
    const who = corrected ? "العمر المصحّح لطفلكِ" : "عمر طفلكِ";
    return {
      ok: false,
      months,
      message: `${who} يوم الورشة سيكون ${ageLabel}، وهذه الورشة مخصّصة لـ${label}.`,
    };
  }

  return { ok: true, months };
}

/**
 * تحقّق العمر لقائمة الانتظار — كالتسجيل، بفارقٍ واحد:
 * من يقصّر طفلها عن الحدّ الأدنى بأقلّ من `WAITLIST_GRACE_DAYS` تُقبل، لأن
 * الجلسة تُفتح بعد أسابيع وطفلها يكون قد بلغ السنّ. والأكبر يُرفض كما هو:
 * انتظارُه انتظارٌ بلا جدوى.
 *
 * يُقاس بعمر الطفل **اليوم** — لا جلسة بعد.
 */
export function checkWaitlistAge(
  birthISO: string,
  todayISO: string,
  gate: AgeGate,
  gestationalWeeks?: number | null
): AgeCheckResult {
  if (!hasAgeGate(gate)) return { ok: true, months: null };

  const corrected = hasCorrectedAge(gestationalWeeks);
  const measured = correctedBirthDate(birthISO, gestationalWeeks);
  const { months, label: ageLabel } = measuredAge(birthISO, todayISO, gestationalWeeks);
  if (months === null) return { ok: false, months: null, message: "تاريخ الميلاد غير صحيح" };

  const label = ageRangeText(gate);

  if (typeof gate.ageMaxMonths === "number" && months > gate.ageMaxMonths) {
    return {
      ok: false,
      months,
      message: `${corrected ? "العمر المصحّح لطفلكِ" : "عمر طفلكِ"} اليوم ${ageLabel}، وهذه الورشة مخصّصة لـ${label}.`,
    };
  }

  if (typeof gate.ageMinMonths === "number") {
    // من التاريخ المقيس — الخديج يبلغ السنّ متأخّرًا بمقدار ما سبق موعده
    const daysToMin = daysUntilAgeMonths(measured, gate.ageMinMonths, todayISO);
    if (daysToMin === null) return { ok: false, months: null, message: "تاريخ الميلاد غير صحيح" };
    if (daysToMin > WAITLIST_GRACE_DAYS) {
      return {
        ok: false,
        months,
        message: `طفلكِ يبلغ سنّ الورشة بعد ${daysLabel(daysToMin)} — هذه الورشة مخصّصة لـ${label}.`,
      };
    }
  }

  return { ok: true, months };
}

/** عمر بالأشهر والأيام — الأيام هي ما بعد آخر «شهرية» ميلاد */
export interface AgeParts {
  months: number;
  days: number;
}

/** يفصل العمر إلى أشهر كاملة + أيام بعدها — null لتاريخ غير صالح أو طفل لم يُولد */
export function ageMonthsAndDays(birthISO: string, atISO: string): AgeParts | null {
  const months = ageInMonthsAt(birthISO, atISO);
  const birth = parseISO(birthISO);
  if (months === null || months < 0 || !birth) return null;

  const anniversary = new Date(birth);
  anniversary.setMonth(anniversary.getMonth() + months);
  const days = daysBetween(toISODate(anniversary), atISO);
  return days === null ? null : { months, days: Math.max(0, days) };
}

/**
 * عمر الطفل بالتفصيل: «3 أشهر و15 يومًا» · «شهر واحد» · «12 يومًا».
 *
 * الأشهر وحدها تخفي فرقًا تراه الأم والمرشدة: طفل أتمّ 3 أشهر أمس وآخر
 * يكاد يبلغ الرابع ليسا سواءً في ورشة تبدأ من 4 أشهر.
 */
export function babyAgeDetailedLabel(birthISO: string, atISO: string): string {
  const parts = ageMonthsAndDays(birthISO, atISO);
  // غير صالح أو لم يُولد بعد — الصياغة الموجزة تتكفّل بالحالتين
  if (!parts) return babyAgeAtLabel(birthISO, atISO);

  if (parts.months === 0) return daysLabel(parts.days);
  if (parts.days === 0) return monthsLabel(parts.months);
  return `${monthsLabel(parts.months)} و${daysLabel(parts.days)}`;
}
