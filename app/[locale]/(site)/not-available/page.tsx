import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "غير متاح | Momzy",
  robots: { index: false },
};

/** صفحة الحجب الجغرافي — تظهر للزوار من المناطق المحظورة */
export default function NotAvailablePage() {
  return (
    <div
      dir="rtl"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #FFF5F7 0%, #FEF0F5 50%, #EFF8F8 100%)",
        textAlign: "center",
        padding: "32px 24px",
      }}
    >
      {/* أيقونة */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "var(--rosepale)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
        }}
      >
        <Image src="/icons/lock-icon.png" alt="محجوب" width={38} height={38} />
      </div>

      {/* العنوان */}
      <h1
        style={{
          fontFamily: "'Amiri', serif",
          fontSize: 30,
          fontWeight: 700,
          color: "var(--dark)",
          marginBottom: 12,
          lineHeight: 1.4,
        }}
      >
        هذا الموقع غير متاح في منطقتك
      </h1>

      {/* الوصف */}
      <p
        style={{
          fontFamily: "'Tajawal', sans-serif",
          fontSize: 15,
          color: "var(--mid)",
          maxWidth: 400,
          lineHeight: 2,
          marginBottom: 32,
        }}
      >
        عذراً، خدمات <strong style={{ color: "var(--dark)" }}>Momzy</strong> غير متاحة
        في دولتك أو منطقتك.
      </p>

      {/* شعار */}
      <p
        style={{
          fontFamily: "'Nunito', sans-serif",
          fontSize: 12,
          color: "var(--light)",
          letterSpacing: "1px",
        }}
      >
        © 2026 Momzy — جميع الحقوق محفوظة
      </p>
    </div>
  );
}
