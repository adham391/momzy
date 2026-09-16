import { SUPPORT_EMAIL } from "@/lib/utils/contactEmail";
import { logoUrl, siteOrigin } from "./brand";

/**
 * قالب النشرة البريدية — عدد يُكتب ملفًا في newsletters/ ويُرسَل عبر Resend (Broadcasts).
 *
 * متطلبات قانون الرسائل الدعائية مبنية في القالب نفسه، فلا تُنسى في أي عدد:
 * كلمة «פרסומת» في بداية العنوان، واسم المرسِل ووسيلة التواصل، ورابط إلغاء
 * الاشتراك (يستبدله Resend برابط شخصي لكل مستلِمة).
 */

/** بطاقة في النشرة — مقال أو منتج أو ورشة */
export interface NewsletterItem {
  /** تسمية صغيرة فوق العنوان — «مقال جديد» · «من المتجر» */
  label?: string;
  title: string;
  text: string;
  /** مسار داخل الموقع (/articles/…) أو رابط كامل */
  href: string;
  /** نص الزر */
  cta: string;
  /** صورة البطاقة — صور Sanity تُصغَّر وتُحوَّل JPEG تلقائيًا */
  image?: string;
}

/** عدد من النشرة */
export interface NewsletterIssue {
  /** معرّف العدد — اسم النشرة في Resend و utm_campaign في كل رابط */
  slug: string;
  /** العنوان بلا «פרסומת» — تُضاف تلقائيًا */
  subject: string;
  /** سطر المعاينة الذي يظهر بجانب العنوان في صندوق الوارد */
  previewText: string;
  /** العنوان الكبير في رأس النشرة */
  heading: string;
  /** فقرات الافتتاحية */
  intro: string[];
  items: NewsletterItem[];
  /** نصيحة قصيرة من هبة (اختياري) */
  tip?: string;
  /** الختام — كل سطر في سطر */
  signOff: string[];
}

/** بادئة إلزامية لعنوان الرسائل الدعائية في إسرائيل */
const AD_SUBJECT_PREFIX = "פרסומת";
/** Resend يستبدلها برابط إلغاء اشتراك شخصي لكل مستلِمة — تعمل في Broadcasts فقط */
const UNSUBSCRIBE_PLACEHOLDER = "{{{RESEND_UNSUBSCRIBE_URL}}}";
/** عرض الصورة المعروض (600 − هوامش البطاقة) — والملف بضعفه لشاشات الجوال الحادّة */
const CARD_IMAGE_WIDTH = 536;

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** عنوان النشرة كما يصل — مسبوقًا بـ«פרסומת» */
export function newsletterSubject(issue: NewsletterIssue): string {
  return `${AD_SUBJECT_PREFIX} | ${issue.subject}`;
}

/** رابط مطلق مع UTM — فتظهر زيارات النشرة ومبيعاتها في /admin/analytics */
function trackedUrl(href: string, issueSlug: string): string {
  const url = new URL(href, `${siteOrigin()}/`);
  if (url.origin === siteOrigin()) {
    url.searchParams.set("utm_source", "newsletter");
    url.searchParams.set("utm_medium", "email");
    url.searchParams.set("utm_campaign", issueSlug);
  }
  return url.toString();
}

/** صور Sanity: JPEG بعرض ضعف المعروض — WebP لا يظهر في بعض برامج البريد */
function emailImageUrl(src: string): string {
  const url = new URL(src);
  if (url.hostname === "cdn.sanity.io") {
    url.searchParams.set("w", String(CARD_IMAGE_WIDTH * 2));
    url.searchParams.set("fm", "jpg");
    url.searchParams.set("q", "80");
    url.searchParams.set("fit", "max");
  }
  return url.toString();
}

function itemCard(item: NewsletterItem, issueSlug: string): string {
  const href = esc(trackedUrl(item.href, issueSlug));
  const image = item.image
    ? `<tr><td><a href="${href}"><img src="${esc(emailImageUrl(item.image))}" alt="${esc(item.title)}" width="${CARD_IMAGE_WIDTH}" style="display:block;width:100%;height:auto;border:0;border-radius:14px 14px 0 0;" /></a></td></tr>`
    : "";
  const label = item.label
    ? `<div style="font-size:11px;font-weight:700;color:#82C9C4;letter-spacing:1.5px;margin-bottom:6px;">${esc(item.label)}</div>`
    : "";
  return `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 18px;border:1.5px solid #EDE9E4;border-radius:16px;border-collapse:separate;">
      ${image}
      <tr><td style="padding:18px 20px 20px;">
        ${label}
        <h2 style="margin:0 0 8px;font-size:18px;line-height:1.5;font-weight:700;"><a href="${href}" style="color:#252220;text-decoration:none;">${esc(item.title)}</a></h2>
        <p style="margin:0 0 16px;font-size:14px;line-height:1.9;color:#55504C;">${esc(item.text)}</p>
        <a href="${href}" style="display:inline-block;background:#F2A7B5;color:#252220;text-decoration:none;border-radius:50px;padding:10px 24px;font-size:14px;font-weight:700;">${esc(item.cta)} ←</a>
      </td></tr>
    </table>`;
}

function tipBox(tip: string): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:4px 0 22px;background:#FEFBF0;border:1.5px solid #F7DF98;border-radius:14px;border-collapse:separate;">
      <tr><td style="padding:16px 20px;">
        <div style="font-size:12px;font-weight:700;color:#C09420;letter-spacing:1px;margin-bottom:6px;">💡 نصيحة هبة</div>
        <p style="margin:0;font-size:14px;line-height:1.9;color:#252220;">${esc(tip)}</p>
      </td></tr>
    </table>`;
}

/** التذييل القانوني: لماذا وصلت، من المرسِل وكيف يُتواصل معه، وإلغاء الاشتراك */
function legalFooter(): string {
  const site = siteOrigin();
  return `
    <p style="margin:0 0 6px;font-size:12px;line-height:1.8;color:#9A9490;">وصلتكِ هذه الرسالة لأنكِ اشتركتِ في نشرة Momzy.</p>
    <p style="margin:0 0 6px;font-size:12px;line-height:1.8;color:#9A9490;">Momzy · هبة حسن · <a href="mailto:${SUPPORT_EMAIL}" style="color:#82C9C4;text-decoration:none;">${SUPPORT_EMAIL}</a> · <a href="${site}" style="color:#82C9C4;text-decoration:none;">momzyworld.com</a></p>
    <p style="margin:0;font-size:12px;line-height:1.8;"><a href="${UNSUBSCRIBE_PLACEHOLDER}" style="color:#55504C;text-decoration:underline;">إلغاء الاشتراك في النشرة</a></p>`;
}

/** HTML عدد النشرة — RTL، جداول وأنماط مضمَّنة كما تحتاج برامج البريد */
export function newsletterEmailHtml(issue: NewsletterIssue): string {
  const paragraphs = issue.intro
    .map((p) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.95;color:#55504C;">${esc(p)}</p>`)
    .join("");
  const items = issue.items.map((item) => itemCard(item, issue.slug)).join("");
  const signOff = issue.signOff.map(esc).join("<br>");

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><title>${esc(newsletterSubject(issue))}</title></head>
<body style="margin:0;padding:0;background:#FDFAF5;font-family:'Tajawal',Arial,sans-serif;direction:rtl;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(issue.previewText)}</div>
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#FDFAF5;padding:24px 12px;"><tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;">
      <tr><td style="background:linear-gradient(135deg,#FFF5F7,#EFF8F8);background-color:#FFF5F7;border-radius:20px 20px 0 0;padding:30px 32px 26px;text-align:center;border-bottom:3px solid #F2A7B5;">
        <img src="${logoUrl()}" alt="Momzy" width="150" height="83" style="display:block;margin:0 auto 14px;width:150px;height:auto;border:0;" />
        <div style="font-size:12px;font-weight:700;color:#F2A7B5;letter-spacing:2px;margin-bottom:8px;">نشرة Momzy</div>
        <h1 style="margin:0;font-size:24px;line-height:1.5;font-weight:700;color:#252220;">${esc(issue.heading)}</h1>
      </td></tr>
      <tr><td style="background:#FFFFFF;padding:28px 32px 6px;border-right:1.5px solid #EDE9E4;border-left:1.5px solid #EDE9E4;">${paragraphs}</td></tr>
      <tr><td style="background:#FFFFFF;padding:8px 32px 4px;border-right:1.5px solid #EDE9E4;border-left:1.5px solid #EDE9E4;">
        ${items}
        ${issue.tip ? tipBox(issue.tip) : ""}
        <p style="margin:6px 0 24px;font-size:15px;line-height:1.9;color:#252220;font-weight:700;">${signOff}</p>
      </td></tr>
      <tr><td style="background:#F8F4EE;border-radius:0 0 20px 20px;padding:20px 32px;text-align:center;border:1.5px solid #EDE9E4;border-top:none;">${legalFooter()}</td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}
