import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import {
  Amiri,
  Tajawal,
  Nunito,
  Heebo,
  Frank_Ruhl_Libre,
  Lora,
} from "next/font/google";
import "../globals.css";
import { routing, LOCALE_DIR, type Locale } from "@/lib/i18n/routing";
import PageTracker from "@/components/analytics/PageTracker";
import TrackingScripts from "@/components/analytics/TrackingScripts";
import { preconnect } from "react-dom";
import JsonLd from "@/components/seo/JsonLd";
import { siteJsonLd } from "@/lib/seo/jsonld";
import { DEFAULT_OG_IMAGE, HOME_META, SITE_NAME } from "@/lib/seo/site";
import { siteOrigin } from "@/lib/resend/emails/brand";

/* ── الخطوط ──────────────────────────────────────────────
   العربية:    Amiri (عناوين) + Tajawal (نصوص) + Nunito (أرقام)
   العبرية:    Frank Ruhl Libre (عناوين) + Heebo (نصوص/تسميات)
   الإنجليزية: Lora (عناوين) + Nunito (نصوص/تسميات)
   التبديل يتم في globals.css عبر html[lang="…"]           */
const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  display: "swap",
});

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "700", "800"],
  display: "swap",
});

const frankRuhl = Frank_Ruhl_Libre({
  variable: "--font-frank",
  subsets: ["hebrew", "latin"],
  weight: ["400", "700"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

/** توليد المسارات الثابتة لكل اللغات */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const home = HOME_META[(hasLocale(routing.locales, locale) ? locale : "ar") as Locale];
  // الافتراضي لكل صفحة: أساس الروابط وصورة المعاينة — وكل صفحة عامة تضع رابطها الأساسي ولغاتها عبر pageSeo
  return {
    metadataBase: new URL(siteOrigin()),
    applicationName: SITE_NAME,
    title: home.title,
    description: home.description,
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: home.title,
      description: home.description,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: { card: "summary_large_image", images: [DEFAULT_OG_IMAGE.url] },
  };
}

/* ── التخطيط الجذري متعدد اللغات ─────────────────────── */
export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  // صور المنتجات والمقالات من Sanity CDN — الاتصال يُفتح مبكرًا فتظهر أسرع
  preconnect("https://cdn.sanity.io");

  // رسائل الترجمة — تُمرَّر للمكونات العميلة عبر الـ Provider
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      dir={LOCALE_DIR[locale]}
      className={`${amiri.variable} ${tajawal.variable} ${nunito.variable} ${heebo.variable} ${frankRuhl.variable} ${lora.variable}`}
      suppressHydrationWarning
    >
      <body className="font-body min-h-screen">
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
        <PageTracker />
        <TrackingScripts />
        <JsonLd data={siteJsonLd(locale)} />
      </body>
    </html>
  );
}
