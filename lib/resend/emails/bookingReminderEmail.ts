import type { BookingRow } from "@/lib/db/bookings";
import { SUPPORT_EMAIL } from "@/lib/utils/contactEmail";
import { bookingDetailsBox, bookingEmailShell } from "./bookingEmail";
import { emailLocale, emailTranslator, type EmailLocale, type EmailT } from "../i18n";

/**
 * تذكير اليوم السابق — يحمل رابط اللقاء (أونلاين) أو المكان (حضوري). المكان قد يكون
 * رابط خريطة (Waze) فيصبح زرًّا، وإلا يُعرض نصًّا.
 */

const localeOf = (b: BookingRow): EmailLocale => emailLocale(b.locale);
const fmtTime = (t: string) => t.slice(0, 5);
function fmtDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}
const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const isUrl = (s: string) => /^https?:\/\//i.test(s.trim());

function button(href: string, label: string): string {
  return `<a href="${esc(href)}" style="display:inline-block;background:#82C9C4;color:white;text-decoration:none;border-radius:50px;padding:12px 28px;font-size:15px;font-weight:700;">${label}</a>`;
}

/** كتلة «كيف أحضر؟» بالتفاصيل الفعلية */
function accessBlock(b: BookingRow, t: EmailT): string {
  const box = (inner: string, center = false) =>
    `<div style="background:#EFF8F8;border:1.5px solid #D4EDEB;border-radius:12px;padding:18px 20px;margin:16px 0;${center ? "text-align:center;" : ""}">${inner}</div>`;
  const label = (text: string) =>
    `<div style="font-size:11px;font-weight:700;color:#82C9C4;letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;">${text}</div>`;

  if (b.meeting_link) {
    return box(
      `${label(t("reminder.onlineLabel"))}${button(b.meeting_link, t("reminder.joinCta"))}
       <div style="font-size:12px;color:#9A9490;margin-top:10px;">${t("reminder.linkNote")}</div>`,
      true
    );
  }
  if (b.location) {
    const inner = isUrl(b.location)
      ? `${label(t("reminder.locationLabel"))}${button(b.location, t("reminder.openMap"))}`
      : `${label(t("reminder.locationLabel"))}<div style="font-size:15px;font-weight:700;color:#252220;line-height:1.7;">${esc(b.location)}</div>`;
    return box(inner, isUrl(b.location));
  }
  return `<p style="font-size:13.5px;color:#55504C;line-height:1.9;margin:16px 0 0;text-align:center;">${t("reminder.noDetails")}</p>`;
}

export function bookingReminderSubject(b: BookingRow): string {
  const t = emailTranslator(localeOf(b));
  return t("reminder.subject", { service: b.service_name ?? "", date: fmtDate(b.date), time: fmtTime(b.start_time) });
}

export function bookingReminderHtml(b: BookingRow): string {
  const locale = localeOf(b);
  const t = emailTranslator(locale);
  const body = `
    <p style="font-size:15px;color:#55504C;line-height:1.9;margin:0 0 8px;">${t("common.greeting", { name: b.customer_name })}</p>
    <p style="font-size:15px;color:#55504C;line-height:1.9;margin:0 0 16px;">${t("reminder.intro", { service: b.service_name ?? "" })}</p>
    ${bookingDetailsBox(b, t)}
    ${accessBlock(b, t)}
    <p style="font-size:15px;color:#252220;font-weight:700;margin:18px 0 0;text-align:center;">${t("reminder.seeYou")}</p>
    <p style="font-size:13px;color:#9A9490;line-height:1.8;margin:16px 0 0;text-align:center;">${t("common.supportLine", { email: SUPPORT_EMAIL })}</p>`;
  return bookingEmailShell(locale, t("reminder.badge"), t("reminder.title"), body);
}
