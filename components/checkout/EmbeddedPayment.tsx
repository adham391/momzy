"use client";

import { useState, useSyncExternalStore } from "react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import Script from "next/script";
import { formatMoney, type Currency } from "@/lib/currency";
import { androidChromeIntent, isInAppBrowser } from "@/lib/utils/inAppBrowser";

/**
 * سكربت HYP الرسمي لـ Apple Pay داخل iframe — يلزم كل صفحة تضمّ إطار الدفع.
 * Safari لا يفتح نافذة Apple Pay من إطار بنطاق آخر، فيطلبها الإطار من صفحتنا
 * (postMessage) وهذا السكربت يفتحها. لا يعمل شيئًا قبل تفعيل Apple Pay في حساب HYP
 * وتسجيل النطاق هناك. المرجع: developers.hyp.co.il — Digital wallets › Apple Pay › Iframe
 */
const HYP_APPLE_PAY_SCRIPT = "https://pps.creditguard.co.il/plugins/applePayOnIframe.js";

/** نطاق صفحة الدفع — الإطار يُحوَّل إليه، وصلاحية الدفع تُمنح له بالاسم */
const HYP_ORIGIN = "https://pay.hyp.co.il";

/**
 * ارتفاع إطار الدفع.
 *
 * صفحة HYP عمودٌ واحد ثابت الطول: قِسناها فكانت **1387px** عند كل عرض
 * (320 · 375 · 414 · 680). وبإطار أقصر منها كانت العميلة تُمرّر داخل الإطار
 * وداخل الصفحة معًا — وعلى شاشة صغيرة يبدو نصف النموذج مقصوصًا.
 * لذلك يأخذ الإطار طول الصفحة كاملًا + هامش أمان لرسائل التحقّق، فيصير
 * التمرير واحدًا: تمرير الصفحة.
 */
const HYP_PAGE_HEIGHT = 1480;

/**
 * الخاصية القديمة `allowpaymentrequest` — توصي بها HYP إلى جانب `allow`
 * لمتصفّحات لم تهجرها بعد. ليست ضمن أنواع React، فتُمرَّر هكذا.
 */
const LEGACY_PAYMENT_REQUEST: Record<string, string> = { allowpaymentrequest: "true" };

/** بيئة المتصفّح لا تتغيّر أثناء الجلسة — لا اشتراك يُلغى */
const NO_SUBSCRIBE = () => () => {};

interface EmbeddedPaymentProps {
  /** نوع الدفع — طلب متجر أو تسجيل ورشة/خدمة */
  kind?: "order" | "booking";
  /** UUID الطلب أو الحجز — مصدر رابط الدفع عبر /api/hyp/retry */
  id: string;
  /** رقم الطلب (MZ-…) أو التسجيل (BK-…) — يُعرض في الترويسة إن وُجد */
  reference?: string;
  /** المبلغ — يُعرض في الترويسة إن وُجد */
  total?: number;
  /** عملة المبلغ — الدولار من خارج البلاد */
  currency?: Currency;
  /** رجوع لتعديل البيانات (وضع الصفحة الواحدة السلسة) */
  onEdit?: () => void;
}

/**
 * بطاقة الدفع المدمجة — تعرض صفحة دفع HYP داخل iframe على موقع Momzy.
 * العميلة لا تغادر الموقع؛ بيانات البطاقة تُدخَل داخل إطار HYP وتذهب مباشرة
 * إليه (لا تمسّ سيرفر Momzy) — يبقى الامتثال عند أبسط مستوى (SAQ A).
 */
export default function EmbeddedPayment({
  kind = "order",
  id,
  reference,
  total,
  currency = "ILS",
  onEdit,
}: EmbeddedPaymentProps) {
  const t = useTranslations("checkout");
  const locale = useLocale();
  const [loaded, setLoaded] = useState(false);
  /**
   * الصفحة داخل متصفّح تطبيق (إنستغرام…) — لا محافظ دفع هناك.
   * تُقرأ من المتصفّح لا من الحالة: على الخادم لا يُعرف، فيبدأ HTML بلا تنبيه
   * ثم يظهر بعد الترطيب — بلا تضارب ترطيب ولا إعادة رسم متتالية.
   */
  const inApp = useSyncExternalStore(
    NO_SUBSCRIBE,
    () => isInAppBrowser(navigator.userAgent),
    () => false,
  );
  const [linkCopied, setLinkCopied] = useState(false);
  const isBooking = kind === "booking";
  const hasSummary = reference && total != null;
  // اللغة تُمرَّر صراحةً: مسارات ‏/api خارج شجرة اللغات فلا تُستنتج منها
  const src = `/api/hyp/retry?${isBooking ? "booking" : "order"}=${id}&locale=${locale}`;

  /** فتح الصفحة نفسها في متصفّح حقيقي — Chrome على أندرويد، وإلا نسخ الرابط */
  function openOutsideApp(): void {
    const url = window.location.href;
    const intent = androidChromeIntent(url, navigator.userAgent);
    if (intent) {
      window.location.href = intent;
      return;
    }
    navigator.clipboard?.writeText(url).then(
      () => setLinkCopied(true),
      () => undefined,
    );
  }

  return (
    <div className="max-w-[680px] mx-auto">
      {/* Apple Pay داخل إطار الدفع — يُحمَّل مرة واحدة للصفحة */}
      <Script src={HYP_APPLE_PAY_SCRIPT} strategy="afterInteractive" />

      {/* ── ترويسة ── */}
      <div className="text-center mb-5">
        <Image
          src="/icons/momzy-logo.png"
          alt="Momzy"
          width={120}
          height={40}
          className="mx-auto mb-3 object-contain"
          style={{ height: 38, width: "auto" }}
        />
        <h2 className="font-heading font-bold text-dark text-[22px] mb-1.5">{t("securePaymentCard")}</h2>
        <p className="font-label text-[13.5px] text-mid">
          {hasSummary ? (
            <>
              {isBooking ? t("registrationLabel") : t("orderLabel")}{" "}
              <span dir="ltr" className="font-bold text-dark">{reference}</span> — {t("total")}{" "}
              <span className="font-bold text-dark">{formatMoney(total, currency)}</span>
            </>
          ) : (
            t("enterCardDetails")
          )}
        </p>
      </div>

      {/* ── تنبيه متصفّح التطبيق — يظهر لمن دخلت من إنستغرام وأمثاله ── */}
      {inApp && (
        <div
          className="rounded-[16px] px-4 py-3 mb-4 flex flex-col gap-2"
          style={{ background: "var(--yellowlt)", border: "1px solid var(--yellow)" }}
        >
          <p className="font-label text-[13px] text-dark leading-relaxed">{t("inAppBrowserNote")}</p>
          <button
            onClick={openOutsideApp}
            className="font-label text-[13px] font-bold text-dark self-start underline active:scale-[0.98]"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            {linkCopied ? t("linkCopied") : t("openInBrowser")}
          </button>
        </div>
      )}

      {/* ── حاوية الـ iframe ── */}
      <div
        className="rounded-[22px] overflow-hidden relative"
        style={{
          background: "white",
          border: "1.5px solid var(--bord)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          minHeight: HYP_PAGE_HEIGHT,
        }}
      >
        {/* غطاء تحميل — يُخفى عند اكتمال تحميل صفحة HYP */}
        {!loaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10" style={{ background: "white" }}>
            <div
              className="rounded-full animate-spin"
              style={{ width: 40, height: 40, border: "3px solid var(--bord)", borderTopColor: "var(--rose)" }}
            />
            <p className="font-label text-[13px] text-light">{t("loadingPayment")}</p>
          </div>
        )}

        <iframe
          src={src}
          title={t("paymentFrameTitle")}
          onLoad={() => setLoaded(true)}
          /*
           * صلاحية الدفع للإطار — شرط ظهور Google Pay داخله (توثيق HYP).
           * `'src'` وحدها لا تكفي: مصدر الإطار صفحتنا `/api/hyp/retry` ثم يحوّل
           * إلى pay.hyp.co.il، فتُقاس الصلاحية على نطاق آخر غير المكتوب في src —
           * لذلك يُسمّى نطاق HYP صراحةً (ويطابقه Permissions-Policy في next.config).
           */
          allow={`payment 'src' ${HYP_ORIGIN}`}
          {...LEGACY_PAYMENT_REQUEST}
          className="w-full block"
          style={{ height: HYP_PAGE_HEIGHT, border: "none" }}
        />
      </div>

      {/* ── تذييل: رجوع + أمان ── */}
      <div className="flex items-center justify-center gap-4 mt-4">
        {onEdit && (
          <button
            onClick={onEdit}
            className="font-label text-[13px] text-mid hover:text-dark transition-colors active:scale-[0.98]"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            {isBooking ? t("editMyDetails") : t("editDelivery")}
          </button>
        )}
        <span className="font-label text-[12px] text-light">{t("encryptedNote")}</span>
      </div>
    </div>
  );
}
