"use client";

import Script from "next/script";
import { useSyncExternalStore } from "react";
import { isTrackedHost } from "@/lib/analytics/track";

/** المضيف لا يتغيّر أثناء الجلسة — لا اشتراك يُلغى */
const NO_SUBSCRIBE = () => () => {};

/**
 * سكربتات التتبّع الخارجية — مشروطة بوجود المتغيّرات (env).
 * بلا IDs → لا تُحمّل شيئًا. تُضبط في .env.local عند الإطلاق.
 *
 * ولا تُحمَّل أصلًا على جهاز التطوير ولا على نسخ المعاينة: مفاتيح Meta وGA
 * نفسها موجودة في `.env.local`، فكان كل فحص محلي يرسل زيارة ومشاهدة منتج
 * إلى حسابَي هبة الحقيقيين.
 */
export default function TrackingScripts() {
  const pixel = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const ga = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const gtm = process.env.NEXT_PUBLIC_GTM_ID;

  // على الخادم لا يُعرف المضيف؛ والسكربتات تُحقن بعد الترطيب على كل حال
  const tracked = useSyncExternalStore(
    NO_SUBSCRIBE,
    () => isTrackedHost(window.location.hostname),
    () => true,
  );
  if (!tracked) return null;

  return (
    <>
      {/* Google Analytics 4 */}
      {ga && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga}');`}
          </Script>
        </>
      )}

      {/* Google Tag Manager */}
      {gtm && (
        <Script id="gtm-init" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`}
        </Script>
      )}

      {/* Meta Pixel */}
      {pixel && (
        <Script id="fb-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixel}');fbq('track','PageView');`}
        </Script>
      )}
    </>
  );
}
