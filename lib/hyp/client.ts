/**
 * تكامل الدفع مع HYP (hyp.co.il) — صفحة الدفع المستضافة.
 * التدفّق: APISign (SIGN) ← رابط دفع موقّع ← تحويل العميل ← HYP يعيده لـ callback ← VERIFY.
 * المرجع: https://developers.hyp.co.il/
 *
 * مُعطّل تلقائيًا حتى تُضبط مفاتيح HYP في .env.local:
 *   HYP_MASOF   = رقم الترمينال (Masof)
 *   HYP_KEY     = مفتاح API (KEY)
 *   HYP_PASSP   = كلمة مرور API (PassP)
 * وبدونها يبقى الطلب pending ويكمل الـ checkout لصفحة التأكيد.
 */

import { toHypText } from "./text";

const HYP_BASE = "https://pay.hyp.co.il/p/";

/** هل ضُبطت مفاتيح HYP؟ */
export function isHypConfigured(): boolean {
  return Boolean(process.env.HYP_MASOF && process.env.HYP_KEY && process.env.HYP_PASSP);
}

/** يحوّل هاتفًا دوليًا (+972…) لصيغة إسرائيلية محلية (0…) التي يتوقّعها HYP */
/**
 * لغة صفحة HYP حسب لغة الموقع.
 *
 * HYP توثّق لغتين فقط: عبري وإنجليزي — ولا عربية. وحتى لو أتيحت اسمًا،
 * الصفحة تُخدَم windows-1255 (فحصنا HEB وENG وARB وRUS فأعادتها كلها)
 * وهو ترميز عبري لا يحوي الحرف العربي إطلاقًا.
 *
 * لذلك تُخدَم زائرة العربية بالعبرية لا بالإنجليزية: جمهور Momzy أمهات في
 * إسرائيل، والعبرية لغة تعاملهنّ التجاري والبنكي اليومي.
 */
function pageLangFor(locale: string | undefined): "HEB" | "ENG" {
  return locale === "en" ? "ENG" : "HEB";
}

function toLocalPhone(phone: string): string {
  return phone.replace(/\s/g, "").replace(/^\+972/, "0");
}

export interface HypPaymentInput {
  /** id الطلب (UUID) — يُعاد كـ Fild1 للتوجيه بعد الدفع */
  orderId: string;
  /** رقم الطلب (MZ-…) — يُرسل كـ Order */
  orderNumber: string;
  /** المبلغ بالشيكل */
  amount: number;
  customerName: string;
  email: string;
  phone: string;
  /** الشارع ورقم البيت — يُعبّئ عنوان صفحة HYP مسبقًا (فلا تُدخله العميلة ثانيةً) */
  street?: string;
  /** المدينة/البلدة */
  city?: string;
  /** الرمز البريدي */
  zip?: string;
  /** وصف مختصر */
  info?: string;
  /** لغة الموقع (ar | he | en) — تحدّد لغة صفحة الدفع */
  locale?: string;
}

/**
 * ينشئ رابط صفحة الدفع (APISign SIGN) ويعيد الـ URL لتحويل العميل إليه.
 * يعيد null إذا لم تُضبط HYP أو فشل التوقيع (فيكمل الطلب pending).
 */
export async function createHypPaymentUrl(input: HypPaymentInput): Promise<string | null> {
  if (!isHypConfigured()) return null;

  // كل نصّ يمرّ بـ toHypText: صفحة HYP تُخدَم بـ windows-1255 فلا تحتمل
  // العربية — وبدونه ترى العميلة اسمها «???» لحظة إدخال البطاقة
  const [firstName, ...rest] = toHypText(input.customerName).split(/\s+/);
  const params = new URLSearchParams({
    action: "APISign",
    What: "SIGN",
    Sign: "True",
    Masof: process.env.HYP_MASOF!,
    KEY: process.env.HYP_KEY!,
    PassP: process.env.HYP_PASSP!,
    Amount: String(input.amount),
    Coin: "1", // شيكل ILS
    Order: input.orderNumber,
    Info: toHypText(input.info) || `Momzy Order ${input.orderNumber}`,
    ClientName: firstName ?? "",
    ClientLName: rest.join(" "),
    email: input.email,
    cell: toLocalPhone(input.phone),
    Fild1: input.orderId, // يُعاد كما هو للتوجيه بعد الدفع
    PageLang: pageLangFor(input.locale),
    UTF8: "True",
    UTF8out: "True",
    sendemail: "True",
    MoreData: "True",
  });

  // تعبئة العنوان مسبقًا في صفحة HYP (جُمع في نموذج التوصيل) — فلا تُدخله العميلة مجددًا
  const street = toHypText(input.street);
  const city = toHypText(input.city);
  if (street) params.set("street", street);
  if (city) params.set("city", city);
  if (input.zip) params.set("zip", input.zip);

  try {
    const res = await fetch(`${HYP_BASE}?${params.toString()}`, { cache: "no-store" });
    const body = (await res.text()).trim();
    // نجاح التوقيع: يحوي signature= ؛ الفشل يعيد CCode=رمز خطأ
    if (!body || !body.includes("signature=")) {
      console.error("[HYP] APISign فشل:", body.slice(0, 200));
      return null;
    }
    return `${HYP_BASE}?${body}`;
  } catch (err) {
    console.error("[HYP] تعذّر إنشاء رابط الدفع:", err);
    return null;
  }
}

export interface HypVerifyResult {
  valid: boolean;
  ccode: string;
  orderNumber: string;
  orderId: string;
  transactionId: string;
}

/**
 * يتحقق من نتيجة الدفع (APISign VERIFY) بعد عودة العميل من HYP.
 * صحيح فقط إذا أعاد VERIFY وردّ الـ redirect CCode=0.
 */
export async function verifyHypPayment(returnParams: URLSearchParams): Promise<HypVerifyResult> {
  const orderNumber = returnParams.get("Order") ?? "";
  const orderId = returnParams.get("Fild1") ?? "";
  const transactionId = returnParams.get("Id") ?? "";
  const redirectCCode = returnParams.get("CCode") ?? "999";

  if (!isHypConfigured()) {
    return { valid: false, ccode: redirectCCode, orderNumber, orderId, transactionId };
  }

  const params = new URLSearchParams(returnParams);
  params.set("action", "APISign");
  params.set("What", "VERIFY");
  params.set("Masof", process.env.HYP_MASOF!);
  params.set("KEY", process.env.HYP_KEY!);
  params.set("PassP", process.env.HYP_PASSP!);

  try {
    const res = await fetch(`${HYP_BASE}?${params.toString()}`, { cache: "no-store" });
    const body = (await res.text()).trim();
    const result = new URLSearchParams(body);
    const verifyCCode = result.get("CCode") ?? "999";
    // صحيح: التوقيع سليم (VERIFY=0) والمعاملة ناجحة (redirect CCode=0)
    const valid = verifyCCode === "0" && redirectCCode === "0";
    return { valid, ccode: verifyCCode, orderNumber, orderId, transactionId };
  } catch (err) {
    console.error("[HYP] تعذّر التحقق من الدفع:", err);
    return { valid: false, ccode: "999", orderNumber, orderId, transactionId };
  }
}
