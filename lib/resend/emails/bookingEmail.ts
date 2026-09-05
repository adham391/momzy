import type { BookingRow } from "@/lib/db/bookings";
import { ageInMonthsAt, monthsLabel } from "@/lib/utils/age";
import { emailHeader, emailFooter } from "./brand";
import { emailLocale, emailTranslator, isRtl, type EmailLocale, type EmailT } from "../i18n";

const SUPPORT_EMAIL = "hello@momzyworld.com";

const ils = (n: number) => `${Number(n).toLocaleString("en-US")} ₪`;

/** لغة الحجز — العربية للحجوزات السابقة لهجرة 0017 */
const localeOf = (b: BookingRow): EmailLocale => emailLocale(b.locale);
const fmtTime = (t: string) => t.slice(0, 5);
function fmtDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

/** الاتجاه يتبع اللغة — فلا يصل الإيميل الإنجليزي بمحاذاة معكوسة */
function shell(locale: EmailLocale, badge: string, title: string, body: string): string {
  const dir = isRtl(locale) ? "rtl" : "ltr";
  return `
<!DOCTYPE html><html lang="${locale}" dir="${dir}"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#FDFAF5;font-family:'Tajawal',Arial,sans-serif;direction:${dir};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FDFAF5;padding:32px 16px;"><tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
      <tr><td style="background:linear-gradient(135deg,#EFF8F8,#FFF5F7);border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;border-bottom:3px solid #82C9C4;">
        ${emailHeader(badge, title, "#82C9C4")}
      </td></tr>
      <tr><td style="background:white;padding:32px 40px;border-right:1.5px solid #EDE9E4;border-left:1.5px solid #EDE9E4;">${body}</td></tr>
      <tr><td style="background:#F8F4EE;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;border:1.5px solid #EDE9E4;border-top:none;">
        ${emailFooter()}
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`.trim();
}

function detailsBox(b: BookingRow, t: EmailT): string {
  const row = (label: string, val: string) =>
    `<tr><td style="padding:6px 0;font-size:13px;color:#9A9490;width:110px;">${label}</td><td style="padding:6px 0;font-size:14px;font-weight:600;color:#252220;">${val}</td></tr>`;
  return `
    <div style="background:#EFF8F8;border-radius:12px;border:1.5px solid #D4EDEB;padding:16px 20px;margin:8px 0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${row(t("booking.service"), b.service_name ?? "—")}
        ${row(t("booking.date"), `<span style="direction:ltr;">${fmtDate(b.date)}</span>`)}
        ${row(t("booking.time"), `<span style="direction:ltr;">${fmtTime(b.start_time)}${b.end_time ? `–${fmtTime(b.end_time)}` : ""}</span>`)}
        ${b.amount > 0 ? row(t("booking.amount"), ils(b.amount)) : ""}
      </table>
    </div>`;
}

/* ── إيميل العميلة ── */

/** تهريب بسيط لمنع كسر الـ HTML بقيم مُدخلة */
const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** كتلة «كيف أحضر؟» — رابط اللقاء (أونلاين) أو المكان (حضوري) */
function accessBlock(b: BookingRow, t: EmailT): string {
  if (b.meeting_link) {
    const link = esc(b.meeting_link);
    return `
    <div style="background:#EFF8F8;border:1.5px solid #D4EDEB;border-radius:12px;padding:18px 20px;margin:16px 0;text-align:center;">
      <div style="font-size:11px;font-weight:700;color:#82C9C4;letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;">${t("booking.onlineLabel")}</div>
      <a href="${link}" style="display:inline-block;background:#82C9C4;color:white;text-decoration:none;border-radius:50px;padding:12px 28px;font-size:15px;font-weight:700;">${t("booking.joinCta")}</a>
      <div style="font-size:12px;color:#9A9490;margin-top:10px;">${t("booking.keepEmail")}</div>
    </div>`;
  }
  if (b.location) {
    return `
    <div style="background:#EFF8F8;border:1.5px solid #D4EDEB;border-radius:12px;padding:18px 20px;margin:16px 0;">
      <div style="font-size:11px;font-weight:700;color:#82C9C4;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">${t("booking.locationLabel")}</div>
      <div style="font-size:15px;font-weight:700;color:#252220;line-height:1.7;">${esc(b.location)}</div>
    </div>`;
  }
  return `
    <p style="font-size:13.5px;color:#55504C;line-height:1.9;margin:16px 0 0;text-align:center;">${t("booking.detailsLater")}</p>`;
}

export const bookingCustomerSubject = (b: BookingRow) =>
  emailTranslator(localeOf(b))("booking.subject", { number: b.booking_number });

export function bookingCustomerEmailHtml(b: BookingRow): string {
  const locale = localeOf(b);
  const t = emailTranslator(locale);
  const body = `
    <p style="font-size:15px;color:#55504C;line-height:1.9;margin:0 0 8px;">${t("common.greeting", { name: b.customer_name })}</p>
    <p style="font-size:15px;color:#55504C;line-height:1.9;margin:0 0 20px;">${t("booking.intro")}</p>
    <div style="text-align:center;margin-bottom:16px;"><span style="display:inline-block;background:#FDFAF5;border:1.5px solid #EDE9E4;border-radius:50px;padding:8px 20px;font-size:15px;font-weight:800;color:#252220;direction:ltr;">${b.booking_number}</span></div>
    ${detailsBox(b, t)}
    ${accessBlock(b, t)}
    <p style="font-size:13px;color:#9A9490;line-height:1.8;margin:20px 0 0;text-align:center;">${t("common.supportLine", { email: SUPPORT_EMAIL })}</p>`;
  return shell(locale, t("booking.badge"), t("booking.title"), body);
}

/* ── إشعار هبة ── */

/** سطر عمر الطفل يوم الورشة — لهبة فقط (الورشات ذات الفئة العمرية) */
function babyAgeLine(b: BookingRow): string {
  if (!b.baby_birth_date) return "";
  const months = ageInMonthsAt(b.baby_birth_date, b.date);
  const age = months === null ? "—" : monthsLabel(months);
  return `<div style="font-size:13px;color:#55504C;line-height:1.8;margin-top:6px;">👶 عمر الطفل يوم الورشة: <strong style="color:#252220;">${age}</strong> <span style="color:#9A9490;">(مواليد <span style="direction:ltr;">${fmtDate(b.baby_birth_date)}</span>)</span></div>`;
}

export const bookingAdminSubject = (b: BookingRow) => `📅 حجز جديد ${b.booking_number}`;

export function bookingAdminEmailHtml(b: BookingRow): string {
  const t = emailTranslator("ar");
  const body = `
    <p style="font-size:15px;color:#55504C;line-height:1.9;margin:0 0 16px;">وصل طلب حجز جديد — أكّديه من اللوحة.</p>
    <div style="text-align:center;margin-bottom:16px;"><span style="display:inline-block;background:#FDFAF5;border:1.5px solid #EDE9E4;border-radius:50px;padding:8px 20px;font-size:15px;font-weight:800;color:#252220;direction:ltr;">${b.booking_number}</span></div>
    ${detailsBox(b, t)}
    <div style="margin-top:16px;padding:16px 20px;background:#FEF5F7;border-radius:10px;border:1.5px solid #F7C4CE;">
      <div style="font-size:11px;font-weight:700;color:#F2A7B5;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">العميلة</div>
      <div style="font-size:14px;color:#252220;line-height:1.8;">${b.customer_name} · <a href="tel:${b.customer_phone}" style="color:#82C9C4;direction:ltr;">${b.customer_phone}</a> · <a href="mailto:${b.customer_email}" style="color:#82C9C4;">${b.customer_email}</a></div>
      ${babyAgeLine(b)}
    </div>`;
  return shell("ar", "حجز جديد", "📅 حجز جديد", body);
}
