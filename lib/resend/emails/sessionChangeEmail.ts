import type { SlotRow } from "@/lib/db/bookings";
import type { SessionBooking } from "@/lib/db/sessions";
import { SUPPORT_EMAIL } from "@/lib/utils/contactEmail";
import { bookingEmailShell } from "./bookingEmail";
import { siteOrigin } from "./brand";
import { emailLocale, emailTranslator, type EmailLocale, type EmailT } from "../i18n";

/**
 * إيميلات تغيّر الجلسة — للمسجِّلات حين تعدّل هبة موعد جلسة أو تلغيها من لوحة المواعيد.
 * بلغة الأم (booking.locale) كإيميل التأكيد.
 */

const fmtTime = (t: string) => t.slice(0, 5);
function fmtDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

/** «20/1/2027 · 18:00–20:00» في سياق LTR كي لا تنقلب الأرقام في الإيميل العربي */
function when(slot: Pick<SlotRow, "date" | "start_time" | "end_time">): string {
  const time = `${fmtTime(slot.start_time)}${slot.end_time ? `–${fmtTime(slot.end_time)}` : ""}`;
  return `<span style="direction:ltr;unicode-bidi:isolate;white-space:nowrap;">${fmtDate(slot.date)} · ${time}</span>`;
}

const localeOf = (b: SessionBooking): EmailLocale => emailLocale(b.locale);

function whenRow(label: string, value: string, strong = false): string {
  return `<tr>
    <td style="padding:6px 0;font-size:13px;color:#9A9490;width:120px;">${label}</td>
    <td style="padding:6px 0;font-size:${strong ? 16 : 14}px;font-weight:${strong ? 800 : 500};color:${strong ? "#252220" : "#9A9490"};${strong ? "" : "text-decoration:line-through;"}">${value}</td>
  </tr>`;
}

function supportLine(t: EmailT): string {
  return `<p style="font-size:13px;color:#9A9490;line-height:1.8;margin:18px 0 0;">${t("sessionChange.contactUs", { email: SUPPORT_EMAIL })}</p>`;
}

/* ── تغيير الموعد ── */

export function sessionRescheduledSubject(b: SessionBooking): string {
  const t = emailTranslator(localeOf(b));
  return t("sessionChange.rescheduledSubject", { number: b.booking_number });
}

export function sessionRescheduledHtml(b: SessionBooking, before: SlotRow, after: SlotRow): string {
  const locale = localeOf(b);
  const t = emailTranslator(locale);
  const service = after.service_name ?? before.service_name ?? "";
  const body = `
    <p style="font-size:15px;color:#55504C;line-height:1.9;margin:0 0 8px;">${t("common.greeting", { name: b.customer_name })}</p>
    <p style="font-size:15px;color:#55504C;line-height:1.9;margin:0 0 18px;">${t("sessionChange.rescheduledIntro", { service })}</p>
    <div style="background:#EFF8F8;border-radius:12px;border:1.5px solid #D4EDEB;padding:16px 20px;margin:8px 0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${whenRow(t("sessionChange.wasLabel"), when(before))}
        ${whenRow(t("sessionChange.nowLabel"), when(after), true)}
      </table>
    </div>
    <div style="text-align:center;margin:24px 0 0;">
      <a href="${siteOrigin()}/booking/${b.id}" style="display:inline-block;background:#82C9C4;color:#252220;text-decoration:none;font-weight:bold;font-size:15px;padding:12px 30px;border-radius:50px;">${t("sessionChange.viewBooking")}</a>
    </div>
    <p style="font-size:14px;color:#55504C;line-height:1.9;margin:20px 0 0;">${t("sessionChange.cannotAttend", { email: SUPPORT_EMAIL })}</p>
    ${supportLine(t)}`;
  return bookingEmailShell(locale, t("sessionChange.rescheduledBadge"), t("sessionChange.rescheduledTitle"), body);
}

/* ── إلغاء الجلسة ── */

export function sessionCancelledSubject(b: SessionBooking, slot: SlotRow): string {
  const t = emailTranslator(localeOf(b));
  return t("sessionChange.cancelledSubject", { service: slot.service_name ?? "" });
}

export function sessionCancelledHtml(b: SessionBooking, slot: SlotRow): string {
  const locale = localeOf(b);
  const t = emailTranslator(locale);
  const paid = b.payment_status === "paid" && b.amount > 0;
  const body = `
    <p style="font-size:15px;color:#55504C;line-height:1.9;margin:0 0 8px;">${t("common.greeting", { name: b.customer_name })}</p>
    <p style="font-size:15px;color:#55504C;line-height:1.9;margin:0 0 18px;">${t("sessionChange.cancelledIntro", { service: slot.service_name ?? "" })}</p>
    <div style="background:#FFF5F7;border-radius:12px;border:1.5px solid #F7C4CE;padding:16px 20px;margin:8px 0;">
      <p style="margin:0;font-size:16px;font-weight:800;color:#252220;">${when(slot)}</p>
    </div>
    ${paid ? `<p style="font-size:15px;color:#55504C;line-height:1.9;margin:18px 0 0;">${t("sessionChange.refundNote")}</p>` : ""}
    ${supportLine(t)}`;
  return bookingEmailShell(locale, t("sessionChange.cancelledBadge"), t("sessionChange.cancelledTitle"), body);
}
