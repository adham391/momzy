import { useTranslations } from "next-intl";
import Container from "@/components/ui/Container";
import SectionWave from "@/components/ui/SectionWave";
import FAQAccordion from "@/components/ui/FAQAccordion";
import type { ServiceFAQ as FAQ } from "@/lib/services/types";

interface ServiceFAQProps {
  items: FAQ[];
  /** لون التمييز — لون الخدمة */
  accent: string;
  /** ترتيب التداخل بين الأقسام */
  zIndex: number;
}

/**
 * أسئلة شائعة عن الورشة — يغلّف الأكورديون المشترك بقسم بألوان الخدمة.
 * لا يُعرض إطلاقًا إن لم تُضف هبة أسئلة (شرطي في الصفحة).
 */
export default function ServiceFAQ({ items, accent, zIndex }: ServiceFAQProps) {
  const t = useTranslations("services");
  return (
    <section className="relative reveal-section" style={{ marginTop: -60, zIndex }}>
      <SectionWave fill="var(--offwh)" />
      <div style={{ background: "var(--offwh)", marginTop: -1, padding: "24px 0 72px" }}>
        <Container>
          <div className="text-center mb-8">
            <p
              className="font-label font-bold mb-2"
              style={{ color: accent, letterSpacing: "2.5px", textTransform: "uppercase", fontSize: 15 }}
            >
              {t("faq.label")}
            </p>
            <h2
              className="font-heading font-bold"
              style={{ fontSize: "clamp(24px, 3vw, 32px)", color: "var(--dark)" }}
            >
              {t("faq.title")}
            </h2>
          </div>

          <div className="mx-auto" style={{ maxWidth: 760 }}>
            <FAQAccordion items={items} accent={accent} openBg="white" />
          </div>
        </Container>
      </div>
    </section>
  );
}
