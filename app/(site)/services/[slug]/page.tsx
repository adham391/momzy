import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import { getService } from "@/lib/services/getService";
import { getServices } from "@/lib/services/getServices";
import { getAllServiceSlugs } from "@/lib/sanity/queries/services";
import { SEED_SERVICES } from "@/lib/services/seed";
import ServiceDetailHero from "@/components/services/ServiceDetailHero";
import ServiceDetailContent from "@/components/services/ServiceDetailContent";
import ServiceCTASection from "@/components/services/ServiceCTASection";
import ServiceCard from "@/components/services/ServiceCard";
import SectionWave from "@/components/ui/SectionWave";
import SectionsReveal from "@/components/ui/SectionsReveal";

/** ISR — يُعاد بناء الصفحة كل 60 ثانية بعد تحديث Sanity */
export const revalidate = 60;

interface ServicePageProps {
  params: Promise<{ slug: string }>;
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
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) return { title: "خدمة غير موجودة | Momzy" };
  return {
    title: `${service.title} | Momzy`,
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
  const service = await getService(slug);

  if (!service) notFound();

  // جلب خدمات مقترحة من نفس الفئة (3 كحد أقصى، باستثناء الحالية)
  const allInCategory = await getServices({ category: service.category });
  const related       = allInCategory.filter((s) => s.slug !== service.slug).slice(0, 3);

  // رقم واتساب من env (اختياري)
  const whatsapp = process.env.HEBA_WHATSAPP_NUMBER;

  return (
    <div style={{ background: "var(--offwh)" }}>

      {/* 1. Hero — صورة + meta + CTAs */}
      <ServiceDetailHero service={service} whatsappNumber={whatsapp} />

      {/* 2. المحتوى التفصيلي — وصف + مواضيع + فوائد */}
      <ServiceDetailContent service={service} />

      {/* 3. CTA نهائي */}
      <ServiceCTASection serviceTitle={service.title} color={service.color} whatsappNumber={whatsapp} />

      {/* 4. خدمات مقترحة (شرطي) */}
      {related.length > 0 && (
        <section className="relative reveal-section" style={{ marginTop: -60, zIndex: 6 }}>
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
                  خدمات أخرى
                </p>
                <h2
                  className="font-heading font-bold"
                  style={{ fontSize: "clamp(24px, 3vw, 32px)", color: "var(--dark)" }}
                >
                  قد يهمّك أيضاً
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

      <SectionsReveal />
    </div>
  );
}
