import type { ReactNode } from "react";
import Container from "@/components/ui/Container";
import SectionLabel from "@/components/ui/SectionLabel";
import SectionWave from "@/components/ui/SectionWave";
import ServiceCard from "./ServiceCard";
import type { Service } from "@/lib/services/types";

interface ServicesSectionProps {
  /** عنوان قصير فوق العنوان الرئيسي */
  label: string;
  /** اللون من SectionLabel: rose/teal/yellow */
  labelColor: "rose" | "teal" | "yellow";
  /** العنوان الرئيسي — يقبل نص أو JSX (لتلوين كلمات معينة) */
  title: ReactNode;
  /** وصف اختياري تحت العنوان */
  description?: string;
  /** قائمة الخدمات للعرض */
  services: Service[];
  /** لون خلفية القسم */
  background?: string;
  /** لون موجة الـ wave أعلى القسم */
  waveColor?: string;
  /** z-index للتداخل مع القسم السابق */
  zIndex?: number;
  /** رقم واتساب هبة — يُمرَّر لكل كارد للاستفسار */
  whatsappNumber?: string;
  /** المقاعد المتبقية لكل خدمة (slug → عدد) — لعرض «بقي N مقاعد» */
  seatsBySlug?: Record<string, number>;
}

/**
 * قسم خدمات — يُستخدم مرتين في صفحة /services:
 *   1. الورشات الجماعية
 *   2. اللقاءات الفردية
 */
export default function ServicesSection({
  label,
  labelColor,
  title,
  description,
  services,
  background = "var(--offwh)",
  waveColor = "var(--offwh)",
  zIndex = 2,
  whatsappNumber,
  seatsBySlug,
}: ServicesSectionProps) {
  if (services.length === 0) return null;

  return (
    <section
      id="services"
      className="relative reveal-section"
      style={{ marginTop: -60, zIndex }}
    >
      {/* ── موجة أعلى القسم ── */}
      <SectionWave fill={waveColor} />

      {/* ── محتوى القسم ── */}
      <div className="pt-6 pb-12 md:pt-10 md:pb-20" style={{ background, marginTop: -1 }}>
        <Container>
          {/* رأس القسم */}
          <div className="text-center mb-7 md:mb-10 max-w-[640px] mx-auto">
            <div className="flex justify-center">
              <SectionLabel color={labelColor} centered className="text-xl">{label}</SectionLabel>
            </div>
            <h2
              className="font-heading font-bold text-h2 mt-2 mb-4"
              style={{ color: "#3D2C24", lineHeight: 1.25 }}
            >
              {title}
            </h2>
            {description && (
              <p
                className="text-body leading-[1.85]"
                style={{ color: "var(--dark)", fontFamily: "'Tajawal', sans-serif" }}
              >
                {description}
              </p>
            )}
          </div>

          {/* شبكة الكاردات — stagger: كل كارد يتأخر 80ms عن السابق */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5 items-stretch">
            {services.map((service, index) => (
              <div
                key={service.slug}
                className="h-full"
                style={{
                  animation: `card-in 0.45s cubic-bezier(0.23, 1, 0.32, 1) ${index * 80}ms both`,
                }}
              >
                <ServiceCard
                  service={service}
                  whatsappNumber={whatsappNumber}
                  seatsLeft={seatsBySlug?.[service.slug]}
                />
              </div>
            ))}
          </div>
        </Container>
      </div>
    </section>
  );
}
