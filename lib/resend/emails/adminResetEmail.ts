import { logoUrl } from "./brand";

/**
 * إيميل إعادة ضبط كلمة مرور الأدمن.
 *
 * عربي دائمًا: مستلِموه حسابات الإدارة، لا عميلات بلغات مختلفة.
 * لا يحمل كلمة مرور — رابطًا لمرة واحدة تختار فيه الأدمن كلمتها بنفسها.
 * الاسم من جدول admins (بيانات إدارية لا مُدخلات عامة)، فيُدرَج كما هو.
 */

export const adminResetEmailSubject = "إعادة ضبط كلمة المرور — لوحة Momzy";

export function adminResetEmailHtml(opts: { name: string; resetUrl: string }): string {
  return `
  <div dir="rtl" style="font-family:Tajawal,Arial,sans-serif;background:#FDFAF5;padding:24px;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #EDE9E4;">
      <div style="background:linear-gradient(135deg,#FFF5F7,#EFF8F8);padding:22px;text-align:center;border-bottom:3px solid #252220;">
        <img src="${logoUrl()}" alt="Momzy" width="150" height="83" style="display:block;margin:0 auto;width:150px;height:auto;border:0;" />
      </div>
      <div style="padding:28px 24px;text-align:center;color:#252220;">
        <p style="font-size:18px;font-weight:bold;margin:0 0 14px;">إعادة ضبط كلمة المرور</p>
        <p style="font-size:15px;line-height:1.9;color:#55504C;margin:0 0 22px;">مرحباً ${opts.name}، وصلنا طلب لإعادة ضبط كلمة مرور حسابك في لوحة تحكم Momzy.</p>
        <a href="${opts.resetUrl}" style="display:inline-block;background:#252220;color:#ffffff;text-decoration:none;font-weight:bold;font-size:16px;padding:14px 34px;border-radius:50px;">🔑 اختاري كلمة مرور جديدة</a>
        <p style="font-size:12px;color:#9A9490;margin:22px 0 0;line-height:1.8;">
          الرابط يُستعمل مرة واحدة ولمدة قصيرة.<br/>
          إن لم تطلبي ذلك فتجاهلي هذه الرسالة — كلمتك الحالية لم تتغيّر.
        </p>
      </div>
    </div>
  </div>`;
}
