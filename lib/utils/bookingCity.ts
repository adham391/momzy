/**
 * بلدة الأم — تكتبها كل مسجِّلة في نموذج التسجيل.
 * الحدود مشتركة بين النموذج (الواجهة) والتحقق في `createBooking` (السيرفر).
 */

/** أقصر اسم بلدة مقبول — «يافا» و«عكا» أربعة أحرف، والأقصر نادر لكنه ممكن */
export const BOOKING_CITY_MIN_LENGTH = 2;

/** أطول اسم — يتّسع لـ«الناصرة — حيّ الصفافرة» دون أن يصير عنوانًا كاملًا */
export const BOOKING_CITY_MAX_LENGTH = 60;

/** ينظّف البلدة: نصّ فقط، بفراغات مفردة، ومقصوص للحدّ الأقصى */
export function normalizeBookingCity(value: unknown): string {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, BOOKING_CITY_MAX_LENGTH) : "";
}

/** هل البلدة (بعد التنظيف) كافية لقبول التسجيل؟ */
export function isBookingCityValid(city: string): boolean {
  return city.length >= BOOKING_CITY_MIN_LENGTH;
}
