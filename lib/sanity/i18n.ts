/**
 * أدوات تدويل محتوى Sanity (نهج internationalized-array).
 * كل حقل نصّي مُدوّل يُخزَّن كمصفوفة: [{ _key: "ar"|"he"|"en", value }].
 * نحلّه في GROQ إلى نص اللغة الفعّالة مع سقوط للعربية.
 */

export type AppLocale = "ar" | "he" | "en";
export const LOCALES: AppLocale[] = ["ar", "he", "en"];
export const DEFAULT_LOCALE: AppLocale = "ar";

/**
 * اللغة الفعّالة — إن مُرِّرت صراحةً تُستخدم (مطلوب في Client Components عبر useLocale()).
 * وإلا تُقرأ من next-intl على السيرفر. `getLocale` يرمي في الـ client، لذا نلتقط الخطأ
 * ونسقط للعربية — فلا ينهار أي مستدعٍ نسي تمرير اللغة (يعرض العربية بأمان).
 */
export async function activeLocale(explicit?: string): Promise<AppLocale> {
  let l = explicit;
  if (!l) {
    // استيراد ديناميكي: next-intl/server خاص بالسيرفر — لا يُحزَم في الـ client
    // (المستدعون في الـ client يمرّرون اللغة صراحةً فلا يصلون هنا).
    try {
      const { getLocale } = await import("next-intl/server");
      l = await getLocale();
    } catch {
      l = DEFAULT_LOCALE;
    }
  }
  return (LOCALES.includes(l as AppLocale) ? l : DEFAULT_LOCALE) as AppLocale;
}

/**
 * GROQ: يحلّ حقلاً نصّياً مُدوّلاً إلى نص اللغة الفعّالة ($loc).
 * plugin v5 يخزّن اللغة في حقل `language` (لا `_key`).
 * سلسلة السقوط: لغة الطلب ← العربية ← القيمة الخام (حماية انتقالية قبل الترحيل).
 * الاستعمال داخل projection: بدّل `title,` بـ `${tf("title")}`.
 * ملاحظة: كل استعلام يستخدم tf/tl يجب أن يمرّر البارامتر { loc }.
 */
export const tf = (field: string): string =>
  `"${field}": coalesce(${field}[language==$loc][0].value, ${field}[language=="ar"][0].value, ${field})`;

/**
 * GROQ: يحلّ قائمة نصية مُدوّلة (مخزّنة كـ text مُدوّل مفصول بأسطر) إلى مصفوفة strings.
 * يُبقي السقوط للقيمة الخام إن كانت لا تزال string[] قبل الترحيل.
 */
export const tl = (field: string): string =>
  `"${field}": coalesce(string::split(coalesce(${field}[language==$loc][0].value, ${field}[language=="ar"][0].value), "\\n")[@ != ""], ${field})`;

/** نفس tf لكن باسم إخراج مختلف عن اسم الحقل المصدر */
export const tfAs = (out: string, field: string): string =>
  `"${out}": coalesce(${field}[language==$loc][0].value, ${field}[language=="ar"][0].value, ${field})`;

/** _type لعنصر مصفوفة مُدوّلة — يُستخدم في سكربتات الترحيل */
export const intlValueType = (base: "string" | "text"): string =>
  base === "text" ? "internationalizedArrayTextValue" : "internationalizedArrayStringValue";
