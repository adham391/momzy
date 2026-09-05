import { formatDate } from "@/lib/utils/format";
import { logoUrl } from "./brand";
import { emailLocale, emailTranslator, isRtl, type EmailT } from "../i18n";

const SUPPORT_EMAIL = "hello@momzyworld.com";

/** عنوان إيميل التسليم الرقمي — قراءة على الموقع */
export function downloadEmailSubject(
  productName: string,
  isGift: boolean,
  locale?: string | null
): string {
  const t = emailTranslator(emailLocale(locale));
  return t(isGift ? "booklet.subjectGift" : "booklet.subject", { product: productName });
}

interface DownloadEmailOptions {
  productName: string;
  /** رابط القراءة — /read/[token] */
  readUrl: string;
  isGift: boolean;
  /** اسم المُهدية — للهدايا فقط */
  gifterName?: string;
  /** null = لا تنتهي */
  expiresAt: string | null;
  /** رابط إنشاء كلمة مرور المكتبة — لمن لم تُنشئ حسابها بعد */
  librarySetupUrl?: string;
  /** رابط المكتبة — لمن لديها حساب فعّال */
  libraryUrl?: string;
  /** لغة المستلِمة — العربية إن لم تُعرف */
  locale?: string | null;
}

/**
 * كتلة المكتبة داخل إيميل التسليم — دعوة إنشاء كلمة المرور (أول مرة)
 * أو رابط الدخول (حساب قائم). تُحذف كليًا إن لم يُمرَّر أي رابط.
 */
function libraryBlock(opts: DownloadEmailOptions, t: EmailT): string {
  if (!opts.librarySetupUrl && !opts.libraryUrl) return "";
  const isSetup = !!opts.librarySetupUrl;
  const url = opts.librarySetupUrl ?? opts.libraryUrl;
  const text = t(isSetup ? "booklet.librarySetup" : "booklet.libraryExisting");
  const cta = t(isSetup ? "booklet.librarySetupCta" : "booklet.libraryOpenCta");
  return `
        <div style="margin:26px 0 0;padding:18px 16px;background:#EFF8F8;border:1px solid #A8D8D5;border-radius:14px;">
          <p style="font-size:14px;font-weight:bold;color:#252220;margin:0 0 8px;">${t("booklet.libraryTitle")}</p>
          <p style="font-size:12.5px;color:#55504C;line-height:1.9;margin:0 0 14px;">${text}</p>
          <a href="${url}" style="display:inline-block;background:#82C9C4;color:#ffffff;text-decoration:none;font-weight:bold;font-size:13.5px;padding:11px 26px;border-radius:50px;">${cta}</a>
        </div>`;
}

/** قالب HTML لإيميل تسليم الكتيب الرقمي — قراءة flipbook على الموقع، بلا تحميل */
export function downloadEmailHtml(opts: DownloadEmailOptions): string {
  const locale = emailLocale(opts.locale);
  const t = emailTranslator(locale);
  const dir = isRtl(locale) ? "rtl" : "ltr";
  const { productName, readUrl, isGift, gifterName, expiresAt } = opts;

  // الصلاحية دائمة اليوم؛ يبقى فرع التاريخ لو ضُبط استثناء لصفٍّ ما.
  // formatDate يعزل التاريخ LTR — فلا تختلّ أرقامه داخل نص RTL
  const validityLine =
    expiresAt === null
      ? t("booklet.validity")
      : t("booklet.validityUntil", { date: formatDate(expiresAt) });

  const intro = isGift
    ? gifterName
      ? t("booklet.introGift", { gifter: gifterName })
      : t("booklet.introGiftAnon")
    : t("booklet.intro");

  return `
  <div dir="${dir}" style="font-family:Tajawal,Arial,sans-serif;background:#FDFAF5;padding:24px;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #EDE9E4;">
      <div style="background:linear-gradient(135deg,#FFF5F7,#EFF8F8);padding:22px;text-align:center;border-bottom:3px solid #82C9C4;">
        <img src="${logoUrl()}" alt="Momzy" width="150" height="83" style="display:block;margin:0 auto;width:150px;height:auto;border:0;" />
      </div>
      <div style="padding:28px 24px;text-align:center;color:#252220;">
        <p style="font-size:15px;line-height:1.9;color:#55504C;margin:0 0 18px;">${intro}</p>
        <p style="font-size:18px;font-weight:bold;margin:0 0 22px;color:#252220;">${productName}</p>
        <a href="${readUrl}" style="display:inline-block;background:#F2A7B5;color:#252220;text-decoration:none;font-weight:bold;font-size:16px;padding:14px 34px;border-radius:50px;">${t("booklet.cta")}</a>
        <p style="font-size:12px;color:#9A9490;margin:22px 0 0;line-height:1.8;">
          ${t("booklet.note")}<br/>
          ${validityLine}
        </p>
        ${libraryBlock(opts, t)}
      </div>
      <div style="padding:14px;text-align:center;font-size:12px;color:#9A9490;border-top:1px solid #EDE9E4;">
        ${t("common.supportLine", { email: SUPPORT_EMAIL })}
      </div>
    </div>
  </div>`;
}
