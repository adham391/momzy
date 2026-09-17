"use server";

import { redirect } from "@/lib/i18n/navigation";
import { emailFromLink, unsubscribeWithLink } from "@/lib/newsletter/unsubscribe";

const UNSUBSCRIBE_PATH = "/newsletter/unsubscribe";

/**
 * زرّ «نعم، إلغاء الاشتراك» — الإلغاء يحدث هنا فقط، لا بفتح الرابط.
 * بعده تعود الصفحة بحال النجاح (بلا البريد والرمز في العنوان)، أو برسالة تعذّر.
 */
export async function confirmUnsubscribe(formData: FormData): Promise<void> {
  const email = emailFromLink(String(formData.get("e") ?? ""));
  const token = String(formData.get("t") ?? "");
  const locale = String(formData.get("locale") ?? "ar");

  const done = await unsubscribeWithLink(email, token);
  redirect({
    href: { pathname: UNSUBSCRIBE_PATH, query: done ? { done: "1" } : { e: email, t: token, failed: "1" } },
    locale,
  });
}
