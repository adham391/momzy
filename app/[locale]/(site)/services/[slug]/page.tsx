import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/Container";
import { getService } from "@/lib/services/getService";
import { getServices } from "@/lib/services/getServices";
import { getAllServiceSlugs } from "@/lib/sanity/queries/services";
import { getSiteSettings } from "@/lib/sanity/queries/siteSettings";
import { SEED_SERVICES } from "@/lib/services/seed";
import ServiceDetailHero from "@/components/services/ServiceDetailHero";
import ServiceDetailContent from "@/components/services/ServiceDetailContent";
import ServiceAboutHeba from "@/components/services/ServiceAboutHeba";
import ServiceFAQ from "@/components/services/ServiceFAQ";
import ServiceStickyCTA from "@/components/services/ServiceStickyCTA";
import { getUpcomingSlotsForService } from "@/lib/db/bookings";
import ServiceCTASection from "@/components/services/ServiceCTASection";
import ServiceCard from "@/components/services/ServiceCard";
import SectionWave from "@/components/ui/SectionWave";
import SectionsReveal from "@/components/ui/SectionsReveal";

/** ISR — يُعاد بناء الصفحة كل 60 ثانية بعد تحديث Sanity */
export const revalidate = 60;

interface ServicePageProps {
  params: Promise<{ locale: string; slug: string }>;
}

/** توليد static params — من Sanity أو seed كـ fallback */
export async function generateStaticParams() {
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    return SEED_SERVICES.map((s) => ({ slug: s.slug }));
  }
  const slugs = await getAllServiceSlugs();
  return slugs.map((slug) => ({ slug }));
}

/** metadata ديناميكي حسب الخدمة */
export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "services" });
  const service = await getService(slug);
  if (!service) return { title: t("metaTitleNotFound") };
  return {
    title: t("metaTitleWithName", { title: service.title }),
    description: service.shortDescription,
    openGraph: {
      title: service.title,
      description: service.shortDescription,
      images: service.coverImage ? [service.coverImage] : undefined,
    },
  };
}

/** صفحة تفاصيل الخدمة */
export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { slug } = await params;
  const t = await getTranslations("services");
  const service = await getService(slug);

  if (!service) notFound();

  // جلب خدمات مقترحة من نفس الفئة (3 كحد أقصى، باستثناء الحالية)
  const allInCategory = await getServices({ category: service.category });
  const related       = allInCategory.filter((s) => s.slug !== service.slug).slice(0, 3);

  // الجلسات القادمة — للشريط الثابت فقط (السعر الأدنى + مجموع المقاعد).
  // اختيار الموعد نفسه يتم داخل نموذج التسجيل — مدخل تسجيل واحد للموقع كله.
  const slots = await getUpcomingSlotsForService(service.slug);
  const minPrice = slots.length > 0 ? Math.min(...slots.map((s) => s.price)) : service.price ?? 0;
  const seatsLeft =
    slots.length > 0
      ? slots.reduce((n, s) => n + Math.max(0, s.capacity - s.booked_count), 0)
      : undefined;

  /** لون التمييز حسب لون الخدمة */
  const accent =
    service.color === "teal" ? "var(--teal)"
    : service.color === "yellow" ? "#C09420"
    : service.color === "mint" ? "#6BB5B0"
    : "var(--rose)";

  // رقم واتساب من إعدادات الموقع — نفس مصدر صفحة القائمة والفوتر، وهو ما
  // يحرّره الأدمن. كان يُقرأ من env فبقي placeholder وأُرسلت العميلات إلى
  // رابط واتساب فارغ.
  const whatsapp = (await getSiteSettings()).contact.whatsappNumber;

  return (
    <div style={{ background: "var(--offwh)" }}>

      {/* 1. Hero — صورة + meta + CTAs */}
      <ServiceDetailHero service={service} whatsappNumber={whatsapp} />

      {/* 2. المحتوى التفصيلي — وصف + مواضيع + فوائد */}
      <ServiceDetailContent service={service} />

      {/* 3. من ترافقكِ؟ — تعريف بهبة قبل التسجيل */}
      <ServiceAboutHeba accent={accent} zIndex={4} />

      {/* 4. أسئلة شائعة (شرطي — يظهر فقط إن أضافت هبة أسئلة) */}
      {service.faqs && service.faqs.length > 0 && (
        <ServiceFAQ items={service.faqs} accent={accent} zIndex={5} />
      )}

      {/* 5. CTA نهائي */}
      <ServiceCTASection
        serviceTitle={service.title}
        serviceSlug={service.slug}
        color={service.color}
        whatsappNumber={whatsapp}
        whatsappOnly={service.whatsappOnly}
        ageGate={service}
        zIndex={6}
      />

      {/* 6. خدمات مقترحة (شرطي) */}
      {related.length > 0 && (
        <section className="relative reveal-section" style={{ marginTop: -60, zIndex: 7 }}>
          <SectionWave fill="var(--cream)" />
          <div style={{ background: "var(--cream)", marginTop: -1, padding: "40px 0 80px" }}>
            <Container>
              <div className="text-center mb-10">
                <p
                  className="font-label font-bold mb-3"
                  style={{
                    color: service.color === "teal" ? "var(--teal)"
                         : service.color === "yellow" ? "#C09420"
                         : service.color === "mint" ? "#6BB5B0"
                         : "var(--rose)",
                    letterSpacing: "2.5px",
                    textTransform: "uppercase",
                    fontSize: 17,
                  }}
                >
                  {t("related.label")}
                </p>
                <h2
                  className="font-heading font-bold"
                  style={{ fontSize: "clamp(24px, 3vw, 32px)", color: "var(--dark)" }}
                >
                  {t("related.title")}
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {related.map((s) => (
                  <ServiceCard key={s.slug} service={s} />
                ))}
              </div>
            </Container>
          </div>
        </section>
      )}

      {/* شريط تسجيل ثابت — جوال فقط */}
      <ServiceStickyCTA
        serviceTitle={service.title}
        serviceSlug={service.slug}
        price={minPrice}
        seatsLeft={seatsLeft}
        ageGate={service}
        whatsappOnly={service.whatsappOnly}
        whatsappNumber={whatsapp}
      />

      <SectionsReveal />
    </div>
  );
}
