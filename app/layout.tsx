import type { Metadata } from "next";
import { Amiri, Tajawal, Nunito } from "next/font/google";
import "./globals.css";

/* ── الخطوط ──────────────────────────────────────────── */
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

/* ── البيانات الوصفية ────────────────────────────────── */
export const metadata: Metadata = {
  title: "Momzy — منصة الأمومة",
  description:
    "مؤسسة متخصصة ترافق الأمهات منذ الحمل وحتى السنوات الأولى — خدمات، منتجات، ومحتوى لكل أم",
};

/* ── التخطيط الجذري ──────────────────────────────────── */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
