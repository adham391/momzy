import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "notAvailable" });
  return { title: t("metaTitle"), robots: { index: false } };
}

/** صفحة الحجب الجغرافي — تظهر للزوار من المناطق المحظورة */
export default function NotAvailablePage() {
  const t = useTranslations("notAvailable");
  return (
    <div
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
        <Image src="/icons/lock-icon.png" alt={t("lockAlt")} width={38} height={38} />
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
        {t("title")}
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
        {t.rich("description", {
          b: (chunks) => <strong style={{ color: "var(--dark)" }}>{chunks}</strong>,
        })}
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
        {t("copyright")}
      </p>
    </div>
  );
}
