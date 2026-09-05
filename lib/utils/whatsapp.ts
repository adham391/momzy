/**
 * قاعدة واحدة لـ«هل هذا رقم واتساب صالح؟».
 *
 * الرقم يأتي من مصادر عدّة (إعدادات Sanity، روابط التواصل، متغيّرات البيئة)
 * وكثيرًا ما يكون placeholder: `#` أو `+972XXXXXXXXX`. القيمة صادقة
 * (truthy) فتمرّ فحص `if`، ثم تُجرَّد من غير الأرقام فينتج `wa.me/` فارغ —
 * رابط يقود العميلة إلى لا شيء.
 *
 * فالفحص هنا على الأرقام لا على وجود النص.
 */

/** أقصر رقم دولي معقول — ما دونه placeholder أو نصّ ناقص */
const MIN_DIGITS = 9;

/** أرقام الرقم إن كان صالحًا، وإلا null */
export function whatsappDigits(raw: string | undefined | null): string | null {
  const digits = (raw ?? "").replace(/\D/g, "");
  return digits.length >= MIN_DIGITS ? digits : null;
}

/** رابط wa.me برسالة مُعبّأة اختيارية — null إن لم يكن الرقم صالحًا */
export function whatsappLink(raw: string | undefined | null, prefillText?: string): string | null {
  const digits = whatsappDigits(raw);
  if (!digits) return null;
  return prefillText
    ? `https://wa.me/${digits}?text=${encodeURIComponent(prefillText)}`
    : `https://wa.me/${digits}`;
}
