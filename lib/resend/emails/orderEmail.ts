import type { OrderWithItems } from "@/lib/db/types";
import { emailHeader, emailFooter } from "./brand";
import { emailLocale, emailTranslator, isRtl, type EmailLocale, type EmailT } from "../i18n";

const SUPPORT_EMAIL = "hello@momzyworld.com";

const ils = (n: number) => `${Number(n).toLocaleString("en-US")} ₪`;

/** لغة الطلب — العربية للطلبات السابقة لهجرة 0017 */
const localeOf = (order: OrderWithItems): EmailLocale => emailLocale(order.locale);

/** صفوف العناصر */
function itemRows(order: OrderWithItems, dir: "rtl" | "ltr"): string {
  const end = dir === "rtl" ? "left" : "right";
  return order.items
    .map(
      (it) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #EDE9E4;font-size:14px;color:#252220;">
          ${it.product_name}${it.gift ? " 🎁" : ""}
          <span style="color:#9A9490;font-size:12px;"> × ${it.quantity}</span>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #EDE9E4;font-size:14px;color:#252220;text-align:${end};white-space:nowrap;">${ils(it.total_price)}</td>
      </tr>`
    )
    .join("");
}

/** كتلة الإجماليات */
function totalsBlock(order: OrderWithItems, t: EmailT, dir: "rtl" | "ltr"): string {
  const end = dir === "rtl" ? "left" : "right";
  const row = (label: string, val: string, bold = false) => `
    <tr>
      <td style="padding:4px 0;font-size:${bold ? 16 : 13}px;color:${bold ? "#252220" : "#55504C"};font-weight:${bold ? 700 : 400};">${label}</td>
      <td style="padding:4px 0;font-size:${bold ? 18 : 13}px;color:${bold ? "#82C9C4" : "#55504C"};font-weight:${bold ? 800 : 400};text-align:${end};white-space:nowrap;">${val}</td>
    </tr>`;
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
      ${row(t("totals.subtotal"), ils(order.subtotal))}
      ${order.discount_amount > 0 ? row(t("totals.discount"), `− ${ils(order.discount_amount)}`) : ""}
      ${row(t("totals.shipping"), order.shipping_cost === 0 ? t("common.free") : ils(order.shipping_cost))}
      ${row(t("totals.total"), ils(order.total_amount), true)}
    </table>`;
}

/**
 * شِل الإيميل (هيدر + محتوى + تذييل).
 * الاتجاه يتبع اللغة: الإنجليزية LTR وغيرها RTL — فلا يصل الإيميل
 * الإنجليزي بمحاذاة معكوسة.
 */
function shell(locale: EmailLocale, badge: string, title: string, body: string): string {
  const dir = isRtl(locale) ? "rtl" : "ltr";
  return `
<!DOCTYPE html><html lang="${locale}" dir="${dir}"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#FDFAF5;font-family:'Tajawal',Arial,sans-serif;direction:${dir};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FDFAF5;padding:32px 16px;"><tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
      <tr><td style="background:linear-gradient(135deg,#FFF5F7,#EFF8F8);border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;border-bottom:3px solid #F2A7B5;">
        ${emailHeader(badge, title, "#F2A7B5")}
      </td></tr>
      <tr><td style="background:white;padding:32px 40px;border-right:1.5px solid #EDE9E4;border-left:1.5px solid #EDE9E4;">${body}</td></tr>
      <tr><td style="background:#F8F4EE;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;border:1.5px solid #EDE9E4;border-top:none;">
        ${emailFooter()}
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`.trim();
}

function orderNumberBox(order: OrderWithItems, t: EmailT): string {
  return `<div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;background:#FDFAF5;border:1.5px solid #EDE9E4;border-radius:50px;padding:10px 24px;">
        <span style="font-size:13px;color:#9A9490;">${t("common.orderNumberLabel")} </span>
        <span style="font-size:16px;font-weight:800;color:#252220;direction:ltr;">${order.order_number}</span>
      </div>
    </div>`;
}

/** سطر الدعم — مشترك بين إيميلي العميلة */
const supportLine = (t: EmailT, prefix = "") =>
  `<p style="font-size:13px;color:#9A9490;line-height:1.8;margin:24px 0 0;text-align:center;">${prefix}${t("common.supportLine", { email: SUPPORT_EMAIL })}</p>`;

/* ── إيميل العميل ── */

export const orderCustomerSubject = (order: OrderWithItems) =>
  emailTranslator(localeOf(order))("order.subject", { number: order.order_number });

export function orderCustomerEmailHtml(order: OrderWithItems): string {
  const locale = localeOf(order);
  const t = emailTranslator(locale);
  const dir = isRtl(locale) ? "rtl" : "ltr";

  const body = `
    <p style="font-size:15px;color:#55504C;line-height:1.9;margin:0 0 8px;">${t("common.greeting", { name: order.customer_name })}</p>
    <p style="font-size:15px;color:#55504C;line-height:1.9;margin:0 0 24px;">${t("order.intro")}</p>
    ${orderNumberBox(order, t)}
    <table width="100%" cellpadding="0" cellspacing="0">${itemRows(order, dir)}</table>
    ${totalsBlock(order, t, dir)}
    <div style="margin-top:24px;padding:16px 20px;background:#FDFAF5;border-radius:10px;border:1.5px solid #EDE9E4;">
      <div style="font-size:11px;font-weight:700;color:#9A9490;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">${t("order.shipTo")}</div>
      <div style="font-size:14px;color:#252220;line-height:1.7;">${order.customer_name} · <span style="direction:ltr;">${order.customer_phone}</span><br/>${order.customer_address}${order.customer_building ? ` · ${order.customer_building}` : ""} · ${order.customer_city}</div>
    </div>
    ${supportLine(t, `${t("order.closing")} `)}`;

  return shell(locale, t("order.badge"), t("order.title"), body);
}

/* ── تذكير استرداد — يُرسل بعد مهلة، لمن بقي طلبها غير مدفوع ── */

export const orderPendingSubject = (order: OrderWithItems) =>
  emailTranslator(localeOf(order))("recovery.subject", { number: order.order_number });

/**
 * لا يقول «تأكيد» ولا «شكرًا لطلبك»: الطلب لم يُدفع.
 * لا يُرسَل لحظة الإنشاء بل بعد نصف ساعة وفقط إن بقي معلّقًا — فمن دفعت
 * لا يصلها إلا التأكيد. الصياغة صياغة تذكير لا إشعارًا فوريًا.
 */
export function orderPendingEmailHtml(order: OrderWithItems, payUrl: string): string {
  const locale = localeOf(order);
  const t = emailTranslator(locale);
  const dir = isRtl(locale) ? "rtl" : "ltr";

  const body = `
    <p style="font-size:15px;color:#55504C;line-height:1.9;margin:0 0 8px;">${t("common.greeting", { name: order.customer_name })}</p>
    <p style="font-size:15px;color:#55504C;line-height:1.9;margin:0 0 24px;">${t("recovery.intro")}</p>
    ${orderNumberBox(order, t)}
    <table width="100%" cellpadding="0" cellspacing="0">${itemRows(order, dir)}</table>
    ${totalsBlock(order, t, dir)}
    <div style="text-align:center;margin:28px 0 0;">
      <a href="${payUrl}" style="display:inline-block;background:#F2A7B5;color:#252220;text-decoration:none;font-weight:bold;font-size:16px;padding:14px 34px;border-radius:50px;">${t("recovery.cta", { amount: ils(order.total_amount) })}</a>
    </div>
    <p style="font-size:12px;color:#9A9490;line-height:1.8;margin:18px 0 0;text-align:center;">${t("recovery.ignore")}</p>
    ${supportLine(t)}`;

  return shell(locale, t("recovery.badge"), t("recovery.title"), body);
}

/* ── إشعار هبة — عربي دائمًا: مستلِمه واحد ── */

export const orderAdminSubject = (order: OrderWithItems) => `🛍️ طلب جديد ${order.order_number} — ${ils(order.total_amount)}`;

export function orderAdminEmailHtml(order: OrderWithItems): string {
  const t = emailTranslator("ar");
  const body = `
    <p style="font-size:15px;color:#55504C;line-height:1.9;margin:0 0 20px;">وصل طلب جديد — جهّزيه للشحن.</p>
    ${orderNumberBox(order, t)}
    <table width="100%" cellpadding="0" cellspacing="0">${itemRows(order, "rtl")}</table>
    ${totalsBlock(order, t, "rtl")}
    <div style="margin-top:24px;padding:16px 20px;background:#EFF8F8;border-radius:10px;border:1.5px solid #D4EDEB;">
      <div style="font-size:11px;font-weight:700;color:#82C9C4;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">العميل والتوصيل</div>
      <div style="font-size:14px;color:#252220;line-height:1.8;">
        ${order.customer_name} · <a href="tel:${order.customer_phone}" style="color:#82C9C4;direction:ltr;">${order.customer_phone}</a> · <a href="mailto:${order.customer_email}" style="color:#82C9C4;">${order.customer_email}</a><br/>
        ${order.customer_address}${order.customer_building ? ` · ${order.customer_building}` : ""}${order.customer_postal_code ? ` · ${order.customer_postal_code}` : ""} · ${order.customer_city}
        ${order.notes ? `<br/><span style="color:#9A9490;">ملاحظات: ${order.notes}</span>` : ""}
      </div>
    </div>`;
  return shell("ar", "طلب جديد", "🛍️ طلب جديد", body);
}
