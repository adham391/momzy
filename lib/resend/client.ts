import { Resend } from "resend";

/** عميل Resend — يُستخدم في API Routes فقط (server-side) */
export const resend = new Resend(process.env.RESEND_API_KEY);

/** إيميل الإرسال — يظهر للمستلم كمرسِل */
export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "noreply@momzyworld.com";

/** إيميل هبة — وجهة استلام الإشعارات */
export const TO_EMAIL = process.env.RESEND_TO_EMAIL ?? "heba@momzyworld.com";

/** هل ضُبط Resend؟ (بدونه لا تُرسل الإيميلات) */
export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

/** يرسل إيميلاً ويسجّل أخطاء Resend (best-effort — لا يرمي) */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<boolean> {
  if (!isEmailConfigured() || !opts.to) return false;
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      replyTo: opts.replyTo,
    });
    if (error) {
      console.error("[email] Resend رفض:", opts.subject, JSON.stringify(error));
      return false;
    }
    console.log("[email] أُرسل:", opts.subject, "→", opts.to);
    return true;
  } catch (e) {
    console.error("[email] استثناء:", opts.subject, e);
    return false;
  }
}
