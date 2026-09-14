/**
 * سياسة كلمة مرور الأدمن — مصدر واحد لصفحة «حسابي» ولسكربت
 * `npm run admin:password`، فلا يتباعد الحدّان.
 *
 * ١٢ حرفًا حدًّا أدنى: اللوحة تكشف بيانات العميلات (أسماء وهواتف
 * وعناوين)، فكلمة قصيرة لا تكفي لحمايتها.
 */

export const MIN_ADMIN_PASSWORD_LENGTH = 12;

/**
 * يتحقّق من الكلمة الجديدة قبل إرسالها إلى Supabase.
 * @param current الكلمة الحالية إن عُرفت — لرفض «تغيير» لا يغيّر شيئًا
 * @returns رسالة الخطأ، أو null إن كانت صالحة
 */
export function validateNewAdminPassword(
  next: string,
  confirm: string,
  current?: string
): string | null {
  if (next.length < MIN_ADMIN_PASSWORD_LENGTH) {
    return `كلمة المرور الجديدة قصيرة — ${MIN_ADMIN_PASSWORD_LENGTH} حرفًا على الأقل`;
  }
  if (next !== confirm) {
    return "الكلمتان الجديدتان غير متطابقتين";
  }
  if (current !== undefined && next === current) {
    return "الكلمة الجديدة مطابقة للحالية — اختاري كلمة مختلفة";
  }
  return null;
}
