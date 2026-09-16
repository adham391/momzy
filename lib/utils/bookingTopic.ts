/**
 * موضوع اللقاء — تكتبه الأم عند التسجيل في الخدمات التي تسأل عنه (`askTopic` في Sanity).
 * الحدود مشتركة بين نموذج التسجيل (الواجهة) والتحقق في `createBooking` (السيرفر).
 */

/** أقصر موضوع مقبول — كلمة قصيرة مثل «نوم» */
export const BOOKING_TOPIC_MIN_LENGTH = 3;

/** أطول موضوع — يكفي لفقرة تشرح الحالة دون أن يصير رسالة مفتوحة */
export const BOOKING_TOPIC_MAX_LENGTH = 500;

/** ينظّف الموضوع: نصّ فقط، بلا فراغات طرفية، ومقصوص للحدّ الأقصى */
export function normalizeBookingTopic(value: unknown): string {
  return typeof value === "string" ? value.trim().slice(0, BOOKING_TOPIC_MAX_LENGTH) : "";
}

/** هل الموضوع (بعد التنظيف) كافٍ لقبول التسجيل؟ */
export function isBookingTopicValid(topic: string): boolean {
  return topic.length >= BOOKING_TOPIC_MIN_LENGTH;
}
