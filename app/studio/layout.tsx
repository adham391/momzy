import "../globals.css";

/**
 * Root layout لـ Sanity Studio — خارج شجرة اللغات [locale].
 * واجهة الاستوديو نفسها إنجليزية LTR.
 */
export default function StudioRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
