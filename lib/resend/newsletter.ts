import { resend, sendEmail } from "./client";
import { newsletterUnsubscribeToken, upsertNewsletterContact } from "./newsletterContact";
import { UNSUBSCRIBE_PATH } from "./emails/newsletterEmail";
import { newsletterWelcomeHtml, newsletterWelcomeSubject } from "./emails/newsletterWelcomeEmail";
import { asLocale, localizedUrl } from "@/lib/seo/site";

/** حملة روابط رسالة الترحيب — فتظهر زياراتها في /admin/analytics */
const WELCOME_UTM = "utm_source=newsletter&utm_medium=email&utm_campaign=welcome";

/**
 * قائمة النشرة البريدية في Resend (Segment) — منها تُرسَل النشرات من لوحة Resend (Broadcasts).
 * بلا المعرّف أو بلا مفتاح Resend لا مزامنة، ويبقى الاشتراك محفوظًا في Supabase كما هو.
 */
function newsletterSegmentId(): string | null {
  if (!process.env.RESEND_API_KEY) return null;
  return process.env.RESEND_NEWSLETTER_SEGMENT_ID?.trim() || null;
}

/**
 * يضيف المشتركة إلى قائمة النشرة في Resend، برمز إلغاء اشتراكها — best-effort، لا يرمي.
 * الاشتراك من الموقع موافقة صريحة: من ألغت اشتراكها سابقًا ثم عادت واشتركت يُعاد تفعيلها.
 */
export async function syncNewsletterSubscriber(email: string): Promise<void> {
  const segmentId = newsletterSegmentId();
  if (!segmentId) return;

  try {
    const error = await upsertNewsletterContact(resend, email, segmentId);
    if (error) console.error("[newsletter] Resend رفض إضافة المشتركة:", JSON.stringify(error));
  } catch (e) {
    console.error("[newsletter] استثناء في مزامنة Resend:", e);
  }
}

/** رابط إلغاء الاشتراك الشخصي بلغتها — null إن لم يكن لها رمز بعد */
async function personalUnsubscribeUrl(email: string, locale: string): Promise<string | null> {
  if (!newsletterSegmentId()) return null;
  try {
    const token = await newsletterUnsubscribeToken(resend, email);
    if (!token) return null;
    return `${localizedUrl(UNSUBSCRIBE_PATH, asLocale(locale))}?e=${encodeURIComponent(email)}&t=${token}`;
  } catch (e) {
    console.error("[newsletter] تعذّر جلب رمز إلغاء الاشتراك:", e);
    return null;
  }
}

/**
 * رسالة الترحيب بمشتركة جديدة — بعد مزامنتها مع Resend كي يحمل الرابط رمزها.
 * best-effort: تعذّر الإرسال لا يُلغي الاشتراك.
 */
export async function sendNewsletterWelcome(email: string, locale: string): Promise<void> {
  const lang = asLocale(locale);
  await sendEmail({
    to: email,
    subject: newsletterWelcomeSubject(lang),
    html: newsletterWelcomeHtml({
      locale: lang,
      articlesUrl: `${localizedUrl("/articles", lang)}?${WELCOME_UTM}`,
      unsubscribeUrl: await personalUnsubscribeUrl(email, lang),
    }),
  });
}
