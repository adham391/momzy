/**
 * رسالة الترحيب بمشتركة النشرة — تصل فور الاشتراك من الموقع، بلغة الصفحة التي اشتركت منها.
 *
 * رسالة تأكيد لا إعلان: بلا عروض ولا منتجات (فلا «פרסומת» في العنوان)، لكنها تحمل
 * ما تحمله النشرة نفسها — لماذا وصلت، ومن المرسِل، ورابط إلغاء الاشتراك.
 */

import { SUPPORT_EMAIL } from "@/lib/utils/contactEmail";
import { logoUrl, siteOrigin } from "./brand";
import { emailLocale, emailTranslator, isRtl } from "../i18n";

interface NewsletterWelcomeOptions {
  /** لغة الصفحة التي اشتركت منها — العربية إن لم تُعرف */
  locale?: string | null;
  /** رابط المقالات بلغتها */
  articlesUrl: string;
  /** رابط إلغاء الاشتراك الشخصي — null حين لا رمز لها (Resend غير مضبوط) فتُدعى للمراسلة */
  unsubscribeUrl: string | null;
}

export function newsletterWelcomeSubject(locale?: string | null): string {
  return emailTranslator(emailLocale(locale))("newsletterWelcome.subject");
}

/** قالب HTML — بهوية باقي إيميلات الموقع، والاتجاه يتبع اللغة */
export function newsletterWelcomeHtml(opts: NewsletterWelcomeOptions): string {
  const locale = emailLocale(opts.locale);
  const t = emailTranslator(locale);
  const dir = isRtl(locale) ? "rtl" : "ltr";
  const site = siteOrigin();

  const unsubscribe = opts.unsubscribeUrl
    ? `<a href="${opts.unsubscribeUrl}" style="color:#55504C;text-decoration:underline;">${t("newsletterWelcome.unsubscribe")}</a>`
    : t("newsletterWelcome.unsubscribeByEmail", { email: SUPPORT_EMAIL });

  return `
  <div dir="${dir}" style="font-family:Tajawal,Arial,sans-serif;background:#FDFAF5;padding:24px;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #EDE9E4;">
      <div style="background:linear-gradient(135deg,#FFF5F7,#EFF8F8);padding:22px;text-align:center;border-bottom:3px solid #F2A7B5;">
        <img src="${logoUrl()}" alt="Momzy" width="150" height="83" style="display:block;margin:0 auto;width:150px;height:auto;border:0;" />
      </div>
      <div style="padding:28px 24px;text-align:center;color:#252220;">
        <p style="font-size:20px;font-weight:bold;margin:0 0 14px;">${t("newsletterWelcome.title")}</p>
        <p style="font-size:15px;line-height:1.9;color:#55504C;margin:0 0 12px;">${t("newsletterWelcome.intro")}</p>
        <p style="font-size:15px;line-height:1.9;color:#55504C;margin:0 0 22px;">${t("newsletterWelcome.body")}</p>
        <a href="${opts.articlesUrl}" style="display:inline-block;background:#F2A7B5;color:#252220;text-decoration:none;font-weight:bold;font-size:16px;padding:14px 34px;border-radius:50px;">${t("newsletterWelcome.cta")}</a>
        <p style="font-size:15px;line-height:1.9;color:#252220;font-weight:bold;margin:24px 0 0;">${t("newsletterWelcome.signOff")}</p>
      </div>
      <div style="padding:16px 20px;text-align:center;font-size:12px;line-height:1.8;color:#9A9490;border-top:1px solid #EDE9E4;background:#F8F4EE;">
        ${t("newsletterWelcome.why")}<br/>
        Momzy · <a href="mailto:${SUPPORT_EMAIL}" style="color:#82C9C4;text-decoration:none;">${SUPPORT_EMAIL}</a> · <a href="${site}" style="color:#82C9C4;text-decoration:none;">momzyworld.com</a><br/>
        ${unsubscribe}
      </div>
    </div>
  </div>`;
}
