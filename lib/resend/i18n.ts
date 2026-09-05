import ar from "@/messages/ar.json";
import he from "@/messages/he.json";
import en from "@/messages/en.json";

/**
 * ترجمة الإيميلات.
 *
 * لا تستعمل next-intl عمدًا: الإيميلات تُرسَل في الخلفية (`after()`، مسح
 * الطلبات المتروكة، ردّ HYP) حيث لا سياق طلب، و`getTranslations` يعتمد
 * عليه. فنقرأ ملفات الرسائل نفسها مباشرةً — نفس المصدر الذي تُحرَّر فيه
 * ترجمات الموقع، فلا تتفرّع نسختان.
 *
 * الاستيراد ثابت لا ديناميكي: القيم تُحزَم مع الخادم فلا قراءة قرص وقت
 * الإرسال ولا مسارات تنكسر بعد البناء.
 */

export type EmailLocale = "ar" | "he" | "en";

const DICTS = { ar, he, en } as const;

/** اللغة الافتراضية — للطلبات السابقة لهجرة 0017 ولأي قيمة غريبة */
const FALLBACK: EmailLocale = "ar";

/** لغة صالحة أو العربية */
export function emailLocale(value: string | null | undefined): EmailLocale {
  return value === "ar" || value === "he" || value === "en" ? value : FALLBACK;
}

/** هل اللغة تُكتب من اليمين؟ — يحدّد dir والمحاذاة في القالب */
export function isRtl(locale: EmailLocale): boolean {
  return locale !== "en";
}

type Dict = Record<string, unknown>;

/** يقرأ مسارًا منقوطًا من كائن الرسائل */
function lookup(dict: Dict, path: string): string | undefined {
  let node: unknown = dict;
  for (const part of path.split(".")) {
    if (!node || typeof node !== "object") return undefined;
    node = (node as Dict)[part];
  }
  return typeof node === "string" ? node : undefined;
}

/** يستبدل {name} بقيمته — لا ICU: نصوص الإيميل تتجنّب صيغ الجمع عمدًا */
function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (whole, key: string) =>
    key in vars ? String(vars[key]) : whole
  );
}

/**
 * مترجم لمساحة `emails` بلغة واحدة.
 *
 * المفتاح المفقود يسقط إلى العربية ثم إلى المفتاح نفسه — إيميل بنصّ
 * إنجليزي غريب أهون من إيميل فارغ أو استثناء يمنع الإرسال كلّه.
 */
export function emailTranslator(locale: EmailLocale) {
  return function t(key: string, vars?: Record<string, string | number>): string {
    const full = `emails.${key}`;
    const value = lookup(DICTS[locale] as Dict, full) ?? lookup(DICTS[FALLBACK] as Dict, full);
    if (value === undefined) {
      console.warn("[email] مفتاح ترجمة مفقود:", full);
      return key;
    }
    return interpolate(value, vars);
  };
}

export type EmailT = ReturnType<typeof emailTranslator>;
