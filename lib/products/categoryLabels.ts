/**
 * تسميات التصنيفات مُدوّلة.
 * قيمة category تبقى عربية (مفتاح المنطق/الفلترة) — تُترجَم التسمية المعروضة فقط.
 */
const CATEGORY_LABELS: Record<string, { ar: string; he: string; en: string }> = {
  "صناديق الأمومة": { ar: "صناديق الأمومة", he: "מארזי אמהוּת", en: "Motherhood Boxes" },
  "إكسسوارات الطفل": { ar: "إكسسوارات الطفل", he: "אביזרי תינוק", en: "Baby Accessories" },
  "كتب ودلائل": { ar: "كتب ودلائل", he: "ספרים ומדריכים", en: "Books & Guides" },
  "عام": { ar: "عام", he: "כללי", en: "General" },
};

/** التسمية المعروضة للتصنيف حسب اللغة — مع سقوط للقيمة الخام إن كان تصنيفًا جديدًا */
export function categoryLabel(value: string, locale: string): string {
  const l = CATEGORY_LABELS[value];
  if (!l) return value;
  return l[locale as "ar" | "he" | "en"] ?? l.ar;
}
