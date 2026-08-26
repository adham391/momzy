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
