/**
 * إيميل المكتبة — دعوة إنشاء كلمة المرور أو استعادتها.
 * لا نرسل كلمة مرور جاهزة إطلاقًا: نرسل رابطًا لمرة واحدة تختار
 * فيه العميلة كلمتها بنفسها.
 */

import { logoUrl } from "./brand";
import { emailLocale, emailTranslator, isRtl } from "../i18n";

const SUPPORT_EMAIL = "hello@momzyworld.com";

interface LibraryEmailOptions {
  /** رابط إنشاء/استعادة كلمة المرور — /library/setup/[token] */
  setupUrl: string;
  purpose: "setup" | "reset";
  /** لغة العميلة — العربية إن لم تُعرف */
  locale?: string | null;
}

export function libraryEmailSubject(purpose: "setup" | "reset", locale?: string | null): string {
  const t = emailTranslator(emailLocale(locale));
  return t(purpose === "setup" ? "library.subjectSetup" : "library.subjectReset");
}

/** قالب HTML — بنفس هوية باقي إيميلات الموقع، والاتجاه يتبع اللغة */
export function libraryEmailHtml(opts: LibraryEmailOptions): string {
  const locale = emailLocale(opts.locale);
  const t = emailTranslator(locale);
  const dir = isRtl(locale) ? "rtl" : "ltr";
  const isSetup = opts.purpose === "setup";

  const title = t(isSetup ? "library.titleSetup" : "library.titleReset");
  const intro = t(isSetup ? "library.introSetup" : "library.introReset");
  const cta = t(isSetup ? "library.ctaSetup" : "library.ctaReset");
  const validity = t(isSetup ? "library.validitySetup" : "library.validityReset");

  return `
  <div dir="${dir}" style="font-family:Tajawal,Arial,sans-serif;background:#FDFAF5;padding:24px;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #EDE9E4;">
      <div style="background:linear-gradient(135deg,#FFF5F7,#EFF8F8);padding:22px;text-align:center;border-bottom:3px solid #82C9C4;">
        <img src="${logoUrl()}" alt="Momzy" width="150" height="83" style="display:block;margin:0 auto;width:150px;height:auto;border:0;" />
      </div>
      <div style="padding:28px 24px;text-align:center;color:#252220;">
        <p style="font-size:18px;font-weight:bold;margin:0 0 14px;">${title}</p>
        <p style="font-size:15px;line-height:1.9;color:#55504C;margin:0 0 22px;">${intro}</p>
        <a href="${opts.setupUrl}" style="display:inline-block;background:#F2A7B5;color:#252220;text-decoration:none;font-weight:bold;font-size:16px;padding:14px 34px;border-radius:50px;">${cta}</a>
        <p style="font-size:12px;color:#9A9490;margin:22px 0 0;line-height:1.8;">
          ${validity}<br/>
          ${t("library.afterwards")}
        </p>
      </div>
      <div style="padding:14px;text-align:center;font-size:12px;color:#9A9490;border-top:1px solid #EDE9E4;">
        ${t("common.supportLine", { email: SUPPORT_EMAIL })}
      </div>
    </div>
  </div>`;
}
