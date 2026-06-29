import { Resend } from "resend";

/** عميل Resend — يُستخدم في API Routes فقط (server-side) */
export const resend = new Resend(process.env.RESEND_API_KEY);

/** إيميل الإرسال — يظهر للمستلم كمرسِل */
export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "noreply@momzyworld.com";

/** إيميل هبة — وجهة استلام الإشعارات */
export const TO_EMAIL = process.env.RESEND_TO_EMAIL ?? "heba@momzyworld.com";
