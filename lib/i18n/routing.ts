import { defineRouting } from "next-intl/routing";

/**
 * إعدادات التوجيه اللغوي:
 * - العربية (الافتراضية) على الجذر بلا بادئة: momzyworld.com/
 * - العبرية على /he والإنجليزية على /en
 * - localeDetection معطّل: لا نعيد التوجيه حسب لغة المتصفح —
 *   جمهورنا أمهات عربيات في إسرائيل وقد تكون أجهزتهن بالعبرية.
 */
export const routing = defineRouting({
  locales: ["ar", "he", "en"],
  defaultLocale: "ar",
  localePrefix: "as-needed",
  localeDetection: false,
});

/** نوع اللغة المدعومة */
export type Locale = (typeof routing.locales)[number];

/** اتجاه الكتابة لكل لغة */
export const LOCALE_DIR: Record<Locale, "rtl" | "ltr"> = {
  ar: "rtl",
  he: "rtl",
  en: "ltr",
};

/** اسم كل لغة بلغتها — لمبدّل اللغة */
export const LOCALE_LABELS: Record<Locale, string> = {
  ar: "عربي",
  he: "עברית",
  en: "English",
};
