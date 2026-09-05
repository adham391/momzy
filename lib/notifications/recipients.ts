import { getSettingsMap } from "@/lib/db/settings";
import { TO_EMAIL } from "@/lib/resend/client";

/**
 * وجهات إشعارات الأدمن — صندوق بريد لكل نوع كي يبقى الوارد مرتّبًا:
 * طلبات المتجر · تسجيلات الورشات · الكتيبات الرقمية · رسائل التواصل.
 *
 * المصدر: جدول settings (تُضبط من /admin/settings). أي حقل فارغ أو غير
 * صالح شكلًا يعود إلى RESEND_TO_EMAIL — فلا يضيع إشعار لأنّ حقلًا لم
 * يُملأ بعد، ولا يُفقد لخطأ مطبعي في العنوان.
 */

export type NotificationKind = "orders" | "bookings" | "booklets" | "contact";

/** مفتاح كل وجهة في جدول settings */
const SETTING_KEY: Record<NotificationKind, string> = {
  orders: "notify_email_orders",
  bookings: "notify_email_bookings",
  booklets: "notify_email_booklets",
  contact: "notify_email_contact",
};

/** المفاتيح الأربعة — تستعملها صفحة الإعدادات للعرض والحفظ */
export const NOTIFY_EMAIL_SETTING_KEYS = SETTING_KEY;

/** بريد صالح شكلًا — الحقل يُملأ يدويًا فقد يُخطأ فيه */
function isEmailish(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * وجهات الأنواع المطلوبة — بلا تكرار.
 *
 * الطلب المختلط (منتج فيزيائي + كتيب) يخصّ صندوقين معًا فيصل لكليهما؛
 * وإن كان العنوانان واحدًا — أو لم يُضبط أحدهما — وصل إيميل واحد لا اثنان.
 */
export async function getNotifyEmails(kinds: NotificationKind[]): Promise<string[]> {
  if (kinds.length === 0) return [];
  const map = await getSettingsMap(kinds.map((k) => SETTING_KEY[k]));

  const out: string[] = [];
  for (const kind of kinds) {
    const raw = (map[SETTING_KEY[kind]] ?? "").trim();
    const address = isEmailish(raw) ? raw : TO_EMAIL;
    if (!out.includes(address)) out.push(address);
  }
  return out;
}

/**
 * أنواع الإشعار التي يخصّها طلب — تُشتقّ من عناصره لا من حدس.
 * فيزيائي ⇒ صندوق الطلبات · رقمي ⇒ صندوق الكتيبات · المختلط ⇒ كلاهما.
 * طلب بلا عناصر (لا يحدث عمليًا) يذهب لصندوق الطلبات بدل أن يضيع.
 */
export function orderNotificationKinds(
  items: { product_type: string }[]
): NotificationKind[] {
  const kinds: NotificationKind[] = [];
  if (items.some((i) => i.product_type === "physical")) kinds.push("orders");
  if (items.some((i) => i.product_type === "digital")) kinds.push("booklets");
  return kinds.length > 0 ? kinds : ["orders"];
}

/** وجهة نوع واحد */
export async function getNotifyEmail(kind: NotificationKind): Promise<string> {
  const [address] = await getNotifyEmails([kind]);
  return address;
}
