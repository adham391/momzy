/**
 * أدوات مشتركة لتدويل مخططات Sanity (internationalized-array).
 * الحقول النصّية المُدوّلة تصير من نوع internationalizedArrayString / internationalizedArrayText.
 */

/** عنصر مصفوفة مُدوّلة كما يخزّنه plugin v5 (اللغة في حقل `language`) */
interface IntlItem {
  language?: string;
  value?: string;
}

/**
 * يستخرج القيمة العربية (أو أول قيمة) من حقل مُدوّل — لعروض Studio (preview).
 * يقبل أيضًا string خام (قبل الترحيل) فيعيده كما هو.
 */
export function arValue(v: unknown): string | undefined {
  if (Array.isArray(v)) {
    const arr = v as IntlItem[];
    return arr.find((x) => x.language === "ar")?.value ?? arr[0]?.value;
  }
  return typeof v === "string" ? v : undefined;
}
