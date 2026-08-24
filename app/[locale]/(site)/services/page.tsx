import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getServices } from "@/lib/services/getServices";
import { getAvailableSeatsBySlug } from "@/lib/db/bookings";
import { getSiteSettings } from "@/lib/sanity/queries/siteSettings";
import Container from "@/components/ui/Container";
import SectionLabel from "@/components/ui/SectionLabel";
import PolkaDots from "@/components/ui/PolkaDots";
import ServicesSection from "@/components/services/ServicesSection";
import ServiceCTASection from "@/components/services/ServiceCTASection";
import SectionsReveal from "@/components/ui/SectionsReveal";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "services" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

/** المقاعد تتغيّر مع كل تسجيل — تحديث كل دقيقة */
export const revalidate = 60;

/** صفحة الخدمات — رأس مدمج + بطاقات + تسجيل إلكتروني مباشر */
export default async function ServicesPage() {
  const t = await getTranslations("services");
  const [allServices, settings, seatsBySlug] = await Promise.all([
    getServices(),
    getSiteSettings(),
    getAvailableSeatsBySlug(),
  ]);
  const whatsappNumber = settings.contact.whatsappNumber;

  const groupServices      = allServices.filter((s) => s.category === "group");
  const individualServices = allServices.filter((s) => s.category === "individual");

  return (
    <div style={{ background: "var(--offwh)" }}>

      {/* ════════ رأس مدمج — بدون هيرو ════════ */}
      <header
        className="relative overflow-hidden text-center pt-10 pb-20 md:pt-16 md:pb-24"
        style={{ background: "linear-gradient(135deg, var(--tealpale) 0%, var(--rosepale) 100%)", zIndex: 1 }}
      >
        <PolkaDots colors={["#F2A7B5", "#82C9C4", "#F7DF98"]} opacity={0.18} count={14} />
        <Container className="relative z-[2]">
          <div className="flex justify-center">
            <SectionLabel color="teal" centered>{t("headerLabel")}</SectionLabel>
          </div>
          <h1
            className="font-heading font-bold text-dark mt-1 mb-3"
            style={{ fontSize: "clamp(28px, 4vw, 46px)", lineHeight: 1.22 }}
          >
            {t.rich("headerTitle", { accent: (chunks) => <span className="text-rose italic">{chunks}</span> })}
          </h1>
          <p
            className="mx-auto text-mid leading-[1.85]"
            style={{ maxWidth: 560, fontSize: "clamp(14px, 1.5vw, 16px)" }}
          >
            {t("headerText")}
          </p>
        </Container>
      </header>

      {/* قسم اللقاءات الفردية (دعم 1:1) — في الأعلى — zIndex 2 */}
      <ServicesSection
        label={t("individualLabel")}
        labelColor="teal"
        title={t.rich("individualTitle", { accent: (chunks) => <span style={{ color: "var(--rose)" }}>{chunks}</span> })}
        description={t("individualText")}
        services={individualServices}
        background="var(--offwh)"
        waveColor="var(--offwh)"
        zIndex={2}
        whatsappNumber={whatsappNumber}
        seatsBySlug={seatsBySlug}
      />

      {/* قسم الورشات الجماعية — تحته — zIndex 3 */}
      <ServicesSection
        label={t("groupLabel")}
        labelColor="teal"
        title={t.rich("groupTitle", { accent: (chunks) => <span style={{ color: "var(--rose)" }}>{chunks}</span> })}
        description={t("groupText")}
        services={groupServices}
        background="var(--cream)"
        waveColor="var(--cream)"
        zIndex={3}
        whatsappNumber={whatsappNumber}
        seatsBySlug={seatsBySlug}
      />

      {/* CTA نهائي — zIndex 4 */}
      <ServiceCTASection
        serviceTitle={t("generalConsultation")}
        heading={t.rich("chooseHeading", { accent: (chunks) => <span style={{ color: "var(--rose)" }}>{chunks}</span> })}
        subheading={t("chooseText")}
        whatsappNumber={whatsappNumber}
      />

      <SectionsReveal />
    </div>
  );
}
