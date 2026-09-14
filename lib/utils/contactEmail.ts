/**
 * عنوان التواصل العام — صندوق hello@ الذي تُفرز رسائله عند هبة.
 *
 * العنوان نفسه في ثلاثة مواضع، فيبقى معرَّفًا في مكان واحد:
 * · يُعرض على الموقع (صفحة التواصل · قائمة الجوال · الفوتر)
 * · يُذكر في نصوص الإيميلات
 * · وجهة الردّ (Reply-To) لإيميلات الموقع — المرسِل noreply@ بلا صندوق
 */
export const SUPPORT_EMAIL = "hello@momzyworld.com";

/**
 * العنوان المعروض للعميلات — ما ضُبط في إعدادات الموقع (Sanity · contact.email)،
 * وإلا SUPPORT_EMAIL. الحقل الفارغ لا يُخفي العنوان: موقع بلا بريد تواصل أسوأ من الافتراضي.
 */
export function publicContactEmail(configured?: string | null): string {
  return configured?.trim() || SUPPORT_EMAIL;
}
