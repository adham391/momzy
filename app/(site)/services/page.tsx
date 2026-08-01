import type { Metadata } from "next";
import { getServices } from "@/lib/services/getServices";
import { getAvailableSeatsBySlug } from "@/lib/db/bookings";
import { getSiteSettings } from "@/lib/sanity/queries/siteSettings";
import Container from "@/components/ui/Container";
import SectionLabel from "@/components/ui/SectionLabel";
import PolkaDots from "@/components/ui/PolkaDots";
import ServicesSection from "@/components/services/ServicesSection";
import ServiceCTASection from "@/components/services/ServiceCTASection";
import SectionsReveal from "@/components/ui/SectionsReveal";

export const metadata: Metadata = {
  title: "الخدمات | Momzy",
  description: "ورشات ولقاءات فردية مع هبة حسن — ممرضة معتمدة ومرشدة رضاعة. سجّلي إلكترونيًا واحجزي مقعدكِ فورًا.",
};

/** المقاعد تتغيّر مع كل تسجيل — تحديث كل دقيقة */
export const revalidate = 60;

/** صفحة الخدمات — رأس مدمج + بطاقات + تسجيل إلكتروني مباشر */
export default async function ServicesPage() {
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
            <SectionLabel color="teal" centered>خدمات هبة</SectionLabel>
          </div>
          <h1
            className="font-heading font-bold text-dark mt-1 mb-3"
            style={{ fontSize: "clamp(28px, 4vw, 46px)", lineHeight: 1.22 }}
          >
            خدمات ترافقك في <span className="text-rose italic">كل خطوة</span>
          </h1>
          <p
            className="mx-auto text-mid leading-[1.85]"
            style={{ maxWidth: 560, fontSize: "clamp(14px, 1.5vw, 16px)" }}
          >
            ورشات جماعية ولقاءات فردية مع هبة حسن — اختاري الخدمة المناسبة وسجّلي مقعدكِ إلكترونيًا في دقيقة.
          </p>
        </Container>
      </header>

      {/* قسم الورشات الجماعية — zIndex 2 */}
      <ServicesSection
        label="ورشات جماعية"
        labelColor="teal"
        title={<>ورشات للأمهات وأطفالهن في <span style={{ color: "var(--rose)" }}>الناصرة</span></>}
        description="مساحة آمنة تجمع الأمهات في مرحلة عمرية متشابهة — نتعلم، نتشارك، ونطبّق معاً تحت توجيه مهني."
        services={groupServices}
        background="var(--offwh)"
        waveColor="var(--offwh)"
        zIndex={2}
        whatsappNumber={whatsappNumber}
        seatsBySlug={seatsBySlug}
      />

      {/* قسم اللقاءات الفردية — zIndex 3 */}
      <ServicesSection
        label="لقاءات فردية"
        labelColor="teal"
        title={<>دعم 1:1 مخصّص <span style={{ color: "var(--rose)" }}>لاحتياجاتك</span></>}
        description="لقاءات فردية في الناصرة، أو زيارات بيتية، أو عبر زوم — تجربة شخصية مرنة تحترم وقتك وراحتك."
        services={individualServices}
        background="var(--cream)"
        waveColor="var(--cream)"
        zIndex={3}
        whatsappNumber={whatsappNumber}
        seatsBySlug={seatsBySlug}
      />

      {/* CTA نهائي — zIndex 4 */}
      <ServiceCTASection
        serviceTitle="استشارة عامة"
        heading={<>محتارة أيّ خدمة <span style={{ color: "var(--rose)" }}>تناسبك؟</span></>}
        subheading="تواصلي معنا وسنساعدك في اختيار الأنسب لك ولطفلك."
        whatsappNumber={whatsappNumber}
      />

      <SectionsReveal />
    </div>
  );
}
