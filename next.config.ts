import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

/** ربط next-intl بإعداد الطلب (تحديد اللغة + تحميل الرسائل) */
const withNextIntl = createNextIntlPlugin("./lib/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        /** صور Sanity CDN */
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },

  /**
   * ترويسات حماية لكل الصفحات — الاتصال مشفّر أصلًا (HSTS من Vercel):
   *  · frame-ancestors + X-Frame-Options — لا يضع أحد الموقع داخل صفحة مزيّفة تخدع الزائرة
   *    («clickjacking»). `'self'` لا يمنع إطار الدفع: نحن من نضع HYP في إطارنا لا العكس،
   *    وصفحة العودة من HYP تُحمَّل داخل إطارنا على أصلنا نفسه.
   *  · nosniff — المتصفح لا يخمّن نوع الملف فيشغّل نصًّا مرفوعًا كأنه سكربت.
   *  · Referrer-Policy — لا يُرسل مسار صفحة الطلب/التسجيل لمواقع أخرى.
   *  · Permissions-Policy — لا كاميرا ولا ميكروفون ولا موقع جغرافي، والدفع لنا ولصفحة HYP
   *    فقط (يلزم Apple Pay داخل الإطار).
   */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: 'camera=(), microphone=(), geolocation=(), payment=(self "https://pay.hyp.co.il")',
          },
        ],
      },
    ];
  },

  /** تحويلات دائمة على مستوى الراوتر — أرخص من صفحات redirect */
  async redirects() {
    return [
      // روابط الإيميلات القديمة: التسليم الرقمي صار قراءة flipbook على /read
      { source: "/download/:token", destination: "/read/:token", permanent: true },
      { source: "/:locale(he|en)/download/:token", destination: "/:locale/read/:token", permanent: true },
    ];
  },
};

export default withNextIntl(nextConfig);
