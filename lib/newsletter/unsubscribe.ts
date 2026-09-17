import { resend } from "@/lib/resend/client";
import { unsubscribeLinkState, type UnsubscribeLinkState } from "@/lib/resend/newsletterContact";
import { unsubscribeNewsletter } from "@/lib/db/newsletter";

/**
 * إلغاء الاشتراك من رابط تذييل النشرة — صفحة /newsletter/unsubscribe.
 * الرابط يحمل البريد ورمز جهة الاتصال في Resend؛ لا يُلغى شيء بفتح الرابط وحده
 * (برامج فحص البريد تفتح الروابط آليًا)، بل بزرّ التأكيد في الصفحة.
 */

/**
 * البريد كما وصل في الرابط. Resend يضعه بلا ترميز، فعلامة + في عنوان مثل name+tag@…
 * تُقرأ مسافةً في الاستعلام — والبريد لا يحوي مسافات، فتُعاد +.
 */
export function emailFromLink(value: string | undefined): string {
  return (value ?? "").trim().replace(/ /g, "+").toLowerCase();
}

/** حال الرابط — للعرض فقط، بلا أي تغيير */
export async function checkUnsubscribeLink(email: string, token: string): Promise<UnsubscribeLinkState> {
  try {
    return await unsubscribeLinkState(resend, email, token);
  } catch (e) {
    console.error("[newsletter] تعذّر فحص رابط إلغاء الاشتراك:", e);
    return "invalid";
  }
}

/**
 * يلغي الاشتراك إن صحّ الرابط: في Resend (فلا تصلها نشرة) ثم في Supabase (سجلّ المشتركات).
 * يعيد false إن لم يصحّ الرابط أو رفض Resend.
 */
export async function unsubscribeWithLink(email: string, token: string): Promise<boolean> {
  const state = await checkUnsubscribeLink(email, token);
  if (state === "invalid") return false;

  if (state === "subscribed") {
    const { error } = await resend.contacts.update({ email, unsubscribed: true });
    if (error) {
      console.error("[newsletter] Resend رفض إلغاء الاشتراك:", JSON.stringify(error));
      return false;
    }
  }
  await unsubscribeNewsletter(email);
  return true;
}
