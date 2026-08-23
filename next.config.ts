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
};

export default withNextIntl(nextConfig);
