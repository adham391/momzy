import { sanityFetch } from "@/lib/sanity/client";

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

/** قيم افتراضية — تُستخدم إذا لم يُعدّ الـ singleton بعد */
const DEFAULT_SETTINGS: SiteSettings = {
  topBar: {
    enabled: true,
    badge: "جديد",
    message: "صندوق مشوار أم — اطلبي الآن قبل نفاد الكمية",
  },
  socialLinks: {
    instagram: "https://www.instagram.com/hebahasan._",
    tiktok:    "https://www.tiktok.com/@heba.the.nurse",
    whatsapp:  "#",
  },
  contact: {
    email: "hello@momzyworld.com",
  },
  footer: {
    tagline:     "نحن هنا للمساعدة في كل خطوة من رحلتك",
    description: "مؤسسة متخصصة ترافق الأمهات — خدمات، منتجات، ومحتوى لكل أم.",
    copyright:   "© 2026 Momzy — جميع الحقوق محفوظة",
  },
};

/**
 * جلب إعدادات الموقع — Singleton
 * يعود بـ DEFAULT_SETTINGS إذا لم يُنشأ document بعد في Studio
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  const query = `*[_type == "siteSettings" && _id == "siteSettings"][0]{
    topBar {
      enabled,
      badge,
      message,
      featuredProduct-> { "slug": slug.current, title }
    },
    socialLinks {
      instagram,
      tiktok,
      whatsapp
    },
    contact {
      email,
      whatsappNumber,
      address
    },
    footer {
      tagline,
      description,
      copyright
    }
  }`;

  const data = await sanityFetch<SiteSettings>(query, {}, 60);

  // إذا فشل الاتصال أو لم يُعدّ الـ singleton بعد → الـ defaults
  if (!data) return DEFAULT_SETTINGS;

  // دمج القيم الافتراضية مع البيانات الفعلية (حماية من الحقول الفارغة)
  return {
    topBar:      { ...DEFAULT_SETTINGS.topBar,      ...(data.topBar      ?? {}) },
    socialLinks: { ...DEFAULT_SETTINGS.socialLinks, ...(data.socialLinks ?? {}) },
    contact:     { ...DEFAULT_SETTINGS.contact,     ...(data.contact     ?? {}) },
    footer:      { ...DEFAULT_SETTINGS.footer,      ...(data.footer      ?? {}) },
  };
}
