import { whatsappLink } from "@/lib/utils/whatsapp";

/**
 * وجهة زرّ التسجيل في الخدمات التي تُتّفق مباشرة (whatsappOnly).
 *
 * بعض الخدمات لا يستقيم لها حجز آلي: الزيارة البيتية سعرها بحسب البلدة،
 * فالاتفاق يسبق الدفع. زرّها يذهب إلى واتساب لا إلى نموذج التسجيل.
 *
 * وحين لا يكون رقم هبة مضبوطًا بعد، `href` تكون null فيظهر الزرّ معطّلًا
 * بنصّه كما هو. لا نحوّل إلى صفحة التواصل: الصفحة مُعدّة للواتساب، ويكفي
 * إضافة الرقم في `/admin/settings` ليعمل الزرّ من تلقائه بلا تعديل كود.
 */

export interface ContactTarget {
  /** null = لا رقم بعد — الزرّ معطّل حتى يُضاف */
  href: string | null;
}

/**
 * @param whatsappNumber رقم هبة من siteSettings.contact.whatsappNumber
 * @param prefillText نصّ الرسالة المُعبَّأة — غير مُرمَّز (تُرمَّز هنا)
 */
export function serviceContactTarget(
  whatsappNumber: string | undefined,
  prefillText: string
): ContactTarget {
  return { href: whatsappLink(whatsappNumber, prefillText) };
}
