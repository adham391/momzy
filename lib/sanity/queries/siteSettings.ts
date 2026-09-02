import { sanityFetch } from "@/lib/sanity/client";
import { tf, activeLocale, type AppLocale } from "@/lib/sanity/i18n";

/** TypeScript types لإعدادات الموقع */
export interface SiteSettingsTopBar {
  enabled: boolean;
  badge?: string;
  message?: string;
  featuredProduct?: { slug: string; title: string };
}

export interface SiteSettingsSocialLinks {
  instagram?: string;
  tiktok?: string;
  whatsapp?: string;
  /** رابط قناة WhatsApp — فارغ = لا تظهر في الفوتر */
  whatsappChannel?: string;
}

export interface SiteSettingsContact {
  email?: string;
  whatsappNumber?: string;
  address?: string;
}

export interface SiteSettingsFooter {
  tagline?: string;
  description?: string;
  copyright?: string;
}

export interface SiteSettings {
  topBar:      SiteSettingsTopBar;
  socialLinks: SiteSettingsSocialLinks;
  contact:     SiteSettingsContact;
  footer:      SiteSettingsFooter;
}

/**
 * روابط السوشيال ومعلومات التواصل — موحّدة عبر كل اللغات (روابط/إيميلات لا نصوص قابلة للترجمة).
 * تُشارَك بين ar/he/en فلا تُكرَّر ولا تتباين.
 */
const SOCIAL_LINKS: SiteSettingsSocialLinks = {
  instagram: "https://www.instagram.com/hebahasan._",
  tiktok:    "https://www.tiktok.com/@heba.the.nurse",
  whatsapp:  "#",
  whatsappChannel: "https://whatsapp.com/channel/0029Vb7W941KWEKrvB5s7B3Q",
};

const CONTACT: SiteSettingsContact = {
  email: "hello@momzyworld.com",
};

/**
 * قيم افتراضية مُدوّلة — تُستخدم إذا لم يُعدّ الـ singleton بعد في Studio.
 * النصوص القابلة للترجمة (badge/message/tagline/description/copyright) مترجمة لكل لغة،
 * والروابط/الإيميلات موحّدة عبر اللغات.
 */
const DEFAULTS: Record<AppLocale, SiteSettings> = {
  ar: {
    topBar: {
      enabled: true,
      badge: "جديد",
      message: "صندوق مشوار أم — اطلبي الآن قبل نفاد الكمية",
    },
    socialLinks: SOCIAL_LINKS,
    contact: CONTACT,
    footer: {
      tagline:     "نحن هنا للمساعدة في كل خطوة من رحلتك",
      description: "مؤسسة متخصصة ترافق الأمهات — خدمات، منتجات، ومحتوى لكل أم.",
      copyright:   "© 2026 Momzy — جميع الحقوق محفوظة",
    },
  },
  he: {
    topBar: {
      enabled: true,
      badge: "חדש",
      message: "מארז מסע של אמא — הזמיני עכשיו לפני שאוזל המלאי",
    },
    socialLinks: SOCIAL_LINKS,
    contact: CONTACT,
    footer: {
      tagline:     "אנחנו כאן לעזור לך בכל צעד במסע שלך",
      description: "מיזם מקצועי שמלווה אמהות — שירותים, מוצרים ותוכן לכל אמא.",
      copyright:   "© 2026 Momzy — כל הזכויות שמורות",
    },
  },
  en: {
    topBar: {
      enabled: true,
      badge: "New",
      message: "Mommy's Journey Box — order now before it sells out",
    },
    socialLinks: SOCIAL_LINKS,
    contact: CONTACT,
    footer: {
      tagline:     "We're here to help at every step of your journey",
      description: "A specialized venture that accompanies mothers — services, products, and content for every mom.",
      copyright:   "© 2026 Momzy — All rights reserved",
    },
  },
};

/**
 * هل القيمة فارغة بمعنى «لم تُملأ»؟
 * false و 0 قيمتان صالحتان لا فارغتان — فلا يُعيدهما الدمج للافتراضي.
 */
function isBlank(value: unknown): boolean {
  return value === null || value === undefined || (typeof value === "string" && value.trim() === "");
}

/**
 * دمج كتلة إعدادات من Studio فوق الافتراضية.
 *
 * **القاعدة:** ما إن تُنشئ هبة الإعدادات، تصبح Studio مصدر الحقيقة —
 * فالحقل الذي تتركه فارغاً يعني «لا تعرض هذا العنصر»، ولا يُعاد ملؤه من الكود.
 * بهذا يعمل فعلاً ما وعدت به الحقول: «أفرغي الرابط ليختفي من الفوتر».
 *
 * **الاستثناء (fallbackKeys):** نصوص لا يصحّ أن تظهر فارغة في الواجهة
 * (رسالة الشريط العلوي، نصوص الفوتر) — هذه وحدها تعود للافتراضي إن تُركت فارغة،
 * كي لا يُصاب الموقع بفراغات لأنّ هبة لم تصل لذلك الحقل بعد.
 *
 * والكتلة الغائبة كلياً (لم تُلمس في Studio) تعود للافتراضي كاملةً.
 */
function mergeBlock<T extends object>(
  defaults: T,
  data: Partial<T> | null | undefined,
  fallbackKeys: readonly (keyof T)[] = []
): T {
  if (!data) return { ...defaults };
  const merged = { ...(data as T) };
  for (const key of fallbackKeys) {
    if (isBlank(merged[key])) merged[key] = defaults[key];
  }
  return merged;
}

/**
 * جلب إعدادات الموقع — Singleton
 * يعود بالـ defaults المُدوّلة (حسب اللغة الفعّالة) إذا لم يُنشأ document بعد في Studio.
 * الحقول النصّية تُحلّ للغة الفعّالة ($loc) مع سقوط للعربية عبر tf().
 */
export async function getSiteSettings(locale?: string): Promise<SiteSettings> {
  const loc = await activeLocale(locale);
  const D = DEFAULTS[loc];

  const query = `*[_type == "siteSettings" && _id == "siteSettings"][0]{
    topBar {
      enabled,
      ${tf("badge")},
      ${tf("message")},
      featuredProduct-> { "slug": slug.current, ${tf("title")} }
    },
    socialLinks {
      instagram,
      tiktok,
      whatsapp,
      whatsappChannel
    },
    contact {
      email,
      whatsappNumber,
      ${tf("address")}
    },
    footer {
      ${tf("tagline")},
      ${tf("description")},
      ${tf("copyright")}
    }
  }`;

  const data = await sanityFetch<SiteSettings>(query, { loc }, 60);

  // إذا فشل الاتصال أو لم يُعدّ الـ singleton بعد → الـ defaults المُدوّلة
  if (!data) return D;

  return {
    // نصوص لا يصحّ أن تظهر فارغة → تعود للافتراضي؛ والباقي (المنتج المميّز) بيد هبة
    topBar:      mergeBlock(D.topBar,      data.topBar,   ["enabled", "badge", "message"]),
    // روابط ومعلومات تواصل → فراغها يعني «لا تعرضها»، فلا افتراضي يعيدها
    socialLinks: mergeBlock(D.socialLinks, data.socialLinks),
    contact:     mergeBlock(D.contact,     data.contact),
    footer:      mergeBlock(D.footer,      data.footer,   ["tagline", "description", "copyright"]),
  };
}
