import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import Container from "@/components/ui/Container";
import PageHeaderWave from "@/components/ui/PageHeaderWave";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "terms" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

/** قسم فرعي */
function Section({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <div className="py-7" style={{ borderBottom: "1px solid var(--bord)" }}>
      <div className="flex items-baseline gap-3 mb-3">
        <span
          className="font-label font-extrabold text-[13px] shrink-0"
          style={{ color: "var(--teal)", letterSpacing: "1px" }}
        >
          {num}
        </span>
        <h2 className="font-heading font-bold text-h4" style={{ color: "var(--dark)" }}>
          {title}
        </h2>
      </div>
      <div
        className="font-body text-body leading-[2.1] flex flex-col gap-2"
        style={{ color: "var(--mid)", fontFamily: "'Tajawal', sans-serif" }}
      >
        {children}
      </div>
    </div>
  );
}

/** نقطة قائمة */
function Li({ warn, children }: { warn?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span
        className="shrink-0 mt-2"
        style={{
          width: 6, height: 6, borderRadius: "50%",
          background: warn ? "var(--rose)" : "var(--teal)",
          display: "inline-block",
        }}
      />
      <span>{children}</span>
    </div>
  );
}

export default function TermsPage() {
  const t = useTranslations("terms");

  // تنسيق النص الغامق داخل رسائل rich text
  const b = (chunks: React.ReactNode) => (
    <strong style={{ color: "var(--dark)" }}>{chunks}</strong>
  );

  return (
    <div style={{ background: "var(--offwh)", minHeight: "100vh" }}>

      {/* ── هيدر ── */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #FFF5F7 0%, #FEF0F5 50%, #EFF8F8 100%)",
          paddingTop: 56,
          paddingBottom: 80,
        }}
      >
        <Container>
          <p
            className="font-label font-bold text-[11px] mb-3"
            style={{ color: "var(--rose)", letterSpacing: "2.5px", textTransform: "uppercase" }}
          >
            {t("label")}
          </p>
          <h1
            className="font-heading font-bold text-h1 mb-2"
            style={{ color: "var(--dark)" }}
          >
            {t("title")}
          </h1>
          <p className="font-label text-[14px]" style={{ color: "var(--mid)" }}>
            {t("lastUpdated")}
          </p>
        </Container>
        <PageHeaderWave fillColor="var(--offwh)" />
      </div>

      {/* ── المحتوى ── */}
      <Container>
        <div className="mx-auto pb-20" style={{ maxWidth: 860, marginTop: -20 }}>

          {/* مقدمة */}
          <p
            className="font-body text-[15px] leading-[2.1] mt-10 mb-2 py-5"
            style={{
              color: "var(--mid)",
              fontFamily: "'Tajawal', sans-serif",
              borderBottom: "1px solid var(--bord)",
            }}
          >
            {t.rich("intro", { b })}
          </p>

          <Section num="01" title={t("sections.0.title")}>
            <p>{t.rich("sections.0.body", { b })}</p>
          </Section>

          <Section num="02" title={t("sections.1.title")}>
            <div className="flex flex-col gap-1">
              <Li>{t("sections.1.items.0")}</Li>
              <Li>{t("sections.1.items.1")}</Li>
              <Li>{t("sections.1.items.2")}</Li>
              <Li>{t("sections.1.items.3")}</Li>
              <Li>{t("sections.1.items.4")}</Li>
            </div>
          </Section>

          <Section num="03" title={t("sections.2.title")}>
            <div className="flex flex-col gap-1">
              <Li>{t("sections.2.items.0")}</Li>
              <Li>{t("sections.2.items.1")}</Li>
              <Li>{t("sections.2.items.2")}</Li>
              <Li>{t("sections.2.items.3")}</Li>
              <Li>{t("sections.2.items.4")}</Li>
            </div>
          </Section>

          <Section num="04" title={t("sections.3.title")}>
            <p style={{ color: "var(--teal)", fontWeight: 700 }}>{t("sections.3.physicalTitle")}</p>
            <div className="flex flex-col gap-1 mb-4">
              <Li>{t("sections.3.physicalItems.0")}</Li>
              <Li>{t("sections.3.physicalItems.1")}</Li>
              <Li>{t("sections.3.physicalItems.2")}</Li>
            </div>
            <p style={{ color: "var(--teal)", fontWeight: 700 }}>{t("sections.3.digitalTitle")}</p>
            <div className="flex flex-col gap-1">
              <Li>{t("sections.3.digitalItems.0")}</Li>
              <Li>{t("sections.3.digitalItems.1")}</Li>
            </div>
          </Section>

          <Section num="05" title={t("sections.4.title")}>
            <p>{t.rich("sections.4.intro", { b })}</p>
            <div className="flex flex-col gap-1 mt-2">
              <Li warn>{t("sections.4.items.0")}</Li>
              <Li warn>{t("sections.4.items.1")}</Li>
              <Li warn>{t("sections.4.items.2")}</Li>
              <Li warn>{t("sections.4.items.3")}</Li>
            </div>
            <p className="mt-3 font-bold" style={{ color: "var(--dark)" }}>
              {t("sections.4.note")}
            </p>
          </Section>

          <Section num="06" title={t("sections.5.title")}>
            <p>{t("sections.5.body")}</p>
          </Section>

          <Section num="07" title={t("sections.6.title")}>
            <p>{t("sections.6.body")}</p>
          </Section>

          <Section num="08" title={t("sections.7.title")}>
            <p>{t("sections.7.body")}</p>
          </Section>

          <Section num="09" title={t("sections.8.title")}>
            <p>
              {t.rich("sections.8.body", {
                link: (chunks) => (
                  <Link href="/contact" style={{ color: "var(--teal)", fontWeight: 600 }}>
                    {chunks}
                  </Link>
                ),
              })}
            </p>
          </Section>

          {/* تذييل */}
          <p
            className="font-label text-[13px] text-center pt-8 mt-2"
            style={{ color: "var(--light)" }}
          >
            {t("copyright")}
          </p>
        </div>
      </Container>
    </div>
  );
}
