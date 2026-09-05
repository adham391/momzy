/**
 * إيميلات المكتبة — إنشاء كلمة المرور (الدعوة) واستعادتها.
 * لا تُرسَل كلمة مرور في أي إيميل أبدًا — رابط لمرة واحدة تختار
 * فيه العميلة كلمتها بنفسها.
 */

import { logoUrl } from "./brand";

interface LibraryEmailOptions {
  /** رابط إنشاء/استعادة كلمة المرور — /library/setup/[token] */
  setupUrl: string;
  /** reset = «نسيت كلمة المرور» · setup = دعوة أول مرة */
  purpose: "setup" | "reset";
}

export function libraryEmailSubject(purpose: "setup" | "reset"): string {
  return purpose === "setup"
    ? "مكتبتك في Momzy جاهزة — أنشئي كلمة مرورك"
    : "استعادة كلمة المرور — مكتبة Momzy";
}

/** قالب HTML (RTL) — بنفس هوية باقي إيميلات الموقع */
export function libraryEmailHtml(opts: LibraryEmailOptions): string {
  const isSetup = opts.purpose === "setup";
  const intro = isSetup
    ? "أصبح لكِ مكتبة دائمة في Momzy — كل كتيباتك (وورشاتك المسجّلة لاحقًا) في مكان واحد، تفتحينه متى شئتِ من أي جهاز."
    : "وصلنا طلب استعادة كلمة المرور لمكتبتك في Momzy. إن لم تطلبيها تجاهلي هذه الرسالة ولن يتغيّر شيء.";
  const cta = isSetup ? "🔑 أنشئي كلمة مرورك" : "🔑 اختاري كلمة مرور جديدة";
  const validity = isSetup ? "الرابط صالح 7 أيام ويُستعمل مرة واحدة." : "الرابط صالح ساعتين ويُستعمل مرة واحدة.";

  return `
  <div dir="rtl" style="font-family:Tajawal,Arial,sans-serif;background:#FDFAF5;padding:24px;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #EDE9E4;">
      <div style="background:linear-gradient(135deg,#FFF5F7,#EFF8F8);padding:22px;text-align:center;border-bottom:3px solid #82C9C4;">
        <img src="${logoUrl()}" alt="Momzy" width="150" height="83" style="display:block;margin:0 auto;width:150px;height:auto;border:0;" />
      </div>
      <div style="padding:28px 24px;text-align:center;color:#252220;">
        <p style="font-size:18px;font-weight:bold;margin:0 0 14px;">${isSetup ? "مكتبتك الخاصة 📚" : "استعادة كلمة المرور"}</p>
        <p style="font-size:15px;line-height:1.9;color:#55504C;margin:0 0 22px;">${intro}</p>
        <a href="${opts.setupUrl}" style="display:inline-block;background:#F2A7B5;color:#252220;text-decoration:none;font-weight:bold;font-size:16px;padding:14px 34px;border-radius:50px;">${cta}</a>
        <p style="font-size:12px;color:#9A9490;margin:22px 0 0;line-height:1.8;">
          ${validity}<br/>
          بعدها تدخلين مكتبتك دائمًا ببريدك وكلمة مرورك.
        </p>
      </div>
      <div style="padding:14px;text-align:center;font-size:12px;color:#9A9490;border-top:1px solid #EDE9E4;">
        لأي استفسار راسلينا على <a href="mailto:hello@momzyworld.com" style="color:#82C9C4;">hello@momzyworld.com</a>
      </div>
    </div>
  </div>`;
}
