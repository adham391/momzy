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
      whatsapp
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

  // دمج القيم الافتراضية مع البيانات الفعلية (حماية من الحقول الفارغة)
  return {
    topBar:      { ...D.topBar,      ...(data.topBar      ?? {}) },
    socialLinks: { ...D.socialLinks, ...(data.socialLinks ?? {}) },
    contact:     { ...D.contact,     ...(data.contact     ?? {}) },
    footer:      { ...D.footer,      ...(data.footer      ?? {}) },
  };
}
