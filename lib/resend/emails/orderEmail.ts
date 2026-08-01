import type { OrderWithItems } from "@/lib/db/types";

const ils = (n: number) => `${Number(n).toLocaleString("en-US")} ₪`;

/** صفوف العناصر */
function itemRows(order: OrderWithItems): string {
  return order.items
    .map(
      (it) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #EDE9E4;font-size:14px;color:#252220;">
          ${it.product_name}${it.gift ? " 🎁" : ""}
          <span style="color:#9A9490;font-size:12px;"> × ${it.quantity}</span>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #EDE9E4;font-size:14px;color:#252220;text-align:left;white-space:nowrap;">${ils(it.total_price)}</td>
      </tr>`
    )
    .join("");
}

/** كتلة الإجماليات */
function totalsBlock(order: OrderWithItems): string {
  const row = (label: string, val: string, bold = false) => `
    <tr>
      <td style="padding:4px 0;font-size:${bold ? 16 : 13}px;color:${bold ? "#252220" : "#55504C"};font-weight:${bold ? 700 : 400};">${label}</td>
      <td style="padding:4px 0;font-size:${bold ? 18 : 13}px;color:${bold ? "#82C9C4" : "#55504C"};font-weight:${bold ? 800 : 400};text-align:left;white-space:nowrap;">${val}</td>
    </tr>`;
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
      ${row("المجموع", ils(order.subtotal))}
      ${order.discount_amount > 0 ? row("الخصم", `− ${ils(order.discount_amount)}`) : ""}
      ${row("الشحن", order.shipping_cost === 0 ? "مجاني" : ils(order.shipping_cost))}
      ${row("الإجمالي", ils(order.total_amount), true)}
    </table>`;
}

/** شِل الإيميل (هيدر + محتوى + تذييل) */
function shell(badge: string, title: string, body: string): string {
  return `
<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#FDFAF5;font-family:'Tajawal',Arial,sans-serif;direction:rtl;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FDFAF5;padding:32px 16px;"><tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
      <tr><td style="background:linear-gradient(135deg,#FFF5F7,#EFF8F8);border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;border-bottom:3px solid #F2A7B5;">
        <div style="font-size:13px;font-weight:700;color:#F2A7B5;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">Momzy — ${badge}</div>
        <h1 style="margin:0;font-size:24px;font-weight:700;color:#252220;">${title}</h1>
      </td></tr>
      <tr><td style="background:white;padding:32px 40px;border-right:1.5px solid #EDE9E4;border-left:1.5px solid #EDE9E4;">${body}</td></tr>
      <tr><td style="background:#F8F4EE;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;border:1.5px solid #EDE9E4;border-top:none;">
        <p style="margin:0;font-size:12px;color:#9A9490;">Momzy — <a href="https://momzyworld.com" style="color:#82C9C4;text-decoration:none;">momzyworld.com</a></p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`.trim();
}

function orderNumberBox(order: OrderWithItems): string {
  return `<div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;background:#FDFAF5;border:1.5px solid #EDE9E4;border-radius:50px;padding:10px 24px;">
        <span style="font-size:13px;color:#9A9490;">رقم الطلب: </span>
        <span style="font-size:16px;font-weight:800;color:#252220;direction:ltr;">${order.order_number}</span>
      </div>
    </div>`;
}

/* ── إيميل العميل ── */

export const orderCustomerSubject = (order: OrderWithItems) => `تأكيد طلبك ${order.order_number} — Momzy`;

export function orderCustomerEmailHtml(order: OrderWithItems): string {
  const body = `
    <p style="font-size:15px;color:#55504C;line-height:1.9;margin:0 0 8px;">مرحباً ${order.customer_name} 🌸</p>
    <p style="font-size:15px;color:#55504C;line-height:1.9;margin:0 0 24px;">شكراً لطلبك من Momzy! استلمنا طلبك وسنبدأ بتجهيزه. إليك التفاصيل:</p>
    ${orderNumberBox(order)}
    <table width="100%" cellpadding="0" cellspacing="0">${itemRows(order)}</table>
    ${totalsBlock(order)}
    <div style="margin-top:24px;padding:16px 20px;background:#FDFAF5;border-radius:10px;border:1.5px solid #EDE9E4;">
      <div style="font-size:11px;font-weight:700;color:#9A9490;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">التوصيل إلى</div>
      <div style="font-size:14px;color:#252220;line-height:1.7;">${order.customer_name} · <span style="direction:ltr;">${order.customer_phone}</span><br/>${order.customer_address}${order.customer_building ? ` · ${order.customer_building}` : ""} · ${order.customer_city}</div>
    </div>
    <p style="font-size:13px;color:#9A9490;line-height:1.8;margin:24px 0 0;text-align:center;">سنتواصل معك عند شحن طلبك. لأي استفسار راسلينا على <a href="mailto:hello@momzyworld.com" style="color:#82C9C4;">hello@momzyworld.com</a></p>`;
  return shell("تأكيد الطلب", "تم استلام طلبك! ✓", body);
}

/* ── إشعار هبة ── */

export const orderAdminSubject = (order: OrderWithItems) => `🛍️ طلب جديد ${order.order_number} — ${ils(order.total_amount)}`;

export function orderAdminEmailHtml(order: OrderWithItems): string {
  const body = `
    <p style="font-size:15px;color:#55504C;line-height:1.9;margin:0 0 20px;">وصل طلب جديد — جهّزيه للشحن.</p>
    ${orderNumberBox(order)}
    <table width="100%" cellpadding="0" cellspacing="0">${itemRows(order)}</table>
    ${totalsBlock(order)}
    <div style="margin-top:24px;padding:16px 20px;background:#EFF8F8;border-radius:10px;border:1.5px solid #D4EDEB;">
      <div style="font-size:11px;font-weight:700;color:#82C9C4;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">العميل والتوصيل</div>
      <div style="font-size:14px;color:#252220;line-height:1.8;">
        ${order.customer_name} · <a href="tel:${order.customer_phone}" style="color:#82C9C4;direction:ltr;">${order.customer_phone}</a> · <a href="mailto:${order.customer_email}" style="color:#82C9C4;">${order.customer_email}</a><br/>
        ${order.customer_address}${order.customer_building ? ` · ${order.customer_building}` : ""}${order.customer_postal_code ? ` · ${order.customer_postal_code}` : ""} · ${order.customer_city}
        ${order.notes ? `<br/><span style="color:#9A9490;">ملاحظات: ${order.notes}</span>` : ""}
      </div>
    </div>`;
  return shell("طلب جديد", "🛍️ طلب جديد", body);
}
