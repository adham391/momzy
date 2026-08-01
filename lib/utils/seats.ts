/**
 * صياغة عربية سليمة لعدد المقاعد المتبقية.
 * تُستخدم في بطاقة الخدمة وقسم الجلسات القادمة.
 */
export function seatsLabel(n: number): string {
  if (n <= 0) return "اكتمل العدد";
  if (n === 1) return "بقي مقعد واحد";
  if (n === 2) return "بقي مقعدان";
  if (n <= 10) return `بقي ${n} مقاعد`;
  return `بقي ${n} مقعدًا`;
}
