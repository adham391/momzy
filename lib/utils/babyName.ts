/**
 * اسم الطفل الكامل — تكتبه الأم عند التسجيل في الخدمات ذات الفئة العمرية (مع تاريخ ميلاده).
 * الحدود مشتركة بين نموذج التسجيل (الواجهة) والتحقق في `createBooking` (السيرفر).
 */

/** أقصر اسم مقبول */
export const BABY_NAME_MIN_LENGTH = 2;

/** أطول اسم — اسم أول واسم عائلة بسعة */
export const BABY_NAME_MAX_LENGTH = 100;

/** ينظّف الاسم: نصّ فقط، بفراغات مفردة، ومقصوص للحدّ الأقصى */
export function normalizeBabyName(value: unknown): string {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, BABY_NAME_MAX_LENGTH) : "";
}

/** هل الاسم (بعد التنظيف) كافٍ لقبول التسجيل؟ */
export function isBabyNameValid(name: string): boolean {
  return name.length >= BABY_NAME_MIN_LENGTH;
}

/**
 * هل وُلد الطفل؟ — التاريخ المُدخل حتى اليوم (بتوقيت إسرائيل) تاريخ ميلاد، وما بعده موعد متوقّع.
 * الاسم إلزامي للمولود فقط: الحامل تسجّل بالموعد المتوقّع وقد لا تعرف الاسم بعد.
 */
export function isBabyBorn(birthDate: string, todayISO: string): boolean {
  return birthDate !== "" && birthDate <= todayISO;
}
