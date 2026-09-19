import { randomBytes, timingSafeEqual } from "node:crypto";
import type { Resend } from "resend";

/**
 * جهة اتصال النشرة في Resend — مشتركة بين الموقع (lib/resend/newsletter.ts) وسكربت
 * scripts/newsletter.ts، لذا تستقبل عميل Resend ولا تنشئه (السكربت يحمّل مفاتيحه بعد الاستيراد).
 *
 * رمز إلغاء الاشتراك خاصية مخصّصة على جهة الاتصال (أُنشئت مرة واحدة في Resend)، يضعها Resend
 * في رابط تذييل النشرة عبر {{{contact.unsubscribe_token}}}، وتطابقها صفحة /newsletter/unsubscribe.
 * رمز عشوائي محفوظ عند Resend لا توقيع — فلا سرّ إضافيًا في البيئة.
 */

export const UNSUBSCRIBE_TOKEN_PROPERTY = "unsubscribe_token";
const TOKEN_BYTES = 24;

type ResendError = { name: string; message: string };

function newUnsubscribeToken(): string {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}

/** الرمز المحفوظ على جهة الاتصال — null إن لم يُضبط */
function storedToken(properties: unknown): string | null {
  const entry = (properties as Record<string, { value?: unknown }> | null | undefined)?.[UNSUBSCRIBE_TOKEN_PROPERTY];
  return typeof entry?.value === "string" && entry.value ? entry.value : null;
}

/**
 * يضيف البريد إلى قائمة (Segment) مشتركًا: ينشئ جهة الاتصال برمزها، أو يعيد تفعيل الموجودة
 * ويمنحها رمزًا إن لم يكن لها. يعيد خطأ Resend أو null.
 */
export async function upsertNewsletterContact(
  resend: Resend,
  email: string,
  segmentId: string
): Promise<ResendError | null> {
  const existing = await resend.contacts.get({ email });

  if (existing.data) {
    const hasToken = Boolean(storedToken(existing.data.properties));
    if (existing.data.unsubscribed || !hasToken) {
      const { error } = await resend.contacts.update({
        email,
        unsubscribed: false,
        ...(hasToken ? {} : { properties: { [UNSUBSCRIBE_TOKEN_PROPERTY]: newUnsubscribeToken() } }),
      });
      if (error) return error;
    }
    const { error } = await resend.contacts.segments.add({ email, segmentId });
    return error;
  }

  if (existing.error?.name !== "not_found") return existing.error;

  const { error } = await resend.contacts.create({
    email,
    unsubscribed: false,
    segments: [{ id: segmentId }],
    properties: { [UNSUBSCRIBE_TOKEN_PROPERTY]: newUnsubscribeToken() },
  });
  return error;
}

/** رمز إلغاء الاشتراك المحفوظ على جهة اتصال البريد — null إن لم تكن جهة اتصال أو لا رمز لها */
export async function newsletterUnsubscribeToken(resend: Resend, email: string): Promise<string | null> {
  const { data } = await resend.contacts.get({ email });
  return data ? storedToken(data.properties) : null;
}

/** حال رابط إلغاء الاشتراك: غير صالح · صالح لمشتركة · صالح واشتراكها ملغى أصلًا */
export type UnsubscribeLinkState = "invalid" | "subscribed" | "unsubscribed";

/** يطابق رمز الرابط برمز جهة الاتصال — مقارنة ثابتة الزمن */
export async function unsubscribeLinkState(
  resend: Resend,
  email: string,
  token: string
): Promise<UnsubscribeLinkState> {
  if (!email || !token) return "invalid";
  const { data } = await resend.contacts.get({ email });
  const expected = data ? storedToken(data.properties) : null;
  if (!data || !expected) return "invalid";

  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return "invalid";
  return data.unsubscribed ? "unsubscribed" : "subscribed";
}
