import { Amiri, Tajawal, Nunito } from "next/font/google";
import "../globals.css";

/* ── الخطوط — نفس خطوط الموقع العربي ─────────────────── */
const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  display: "swap",
});

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

/**
 * Root layout للوحة الأدمن — خارج شجرة اللغات [locale].
 * اللوحة عربية RTL دائمًا (واجهة هبة الداخلية، لا تُترجم).
 */
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${amiri.variable} ${tajawal.variable} ${nunito.variable}`}
      suppressHydrationWarning
    >
      <body className="font-body min-h-screen">{children}</body>
    </html>
  );
}
