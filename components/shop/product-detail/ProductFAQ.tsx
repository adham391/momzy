import { useTranslations } from "next-intl";
import Container from "@/components/ui/Container";
import SectionLabel from "@/components/ui/SectionLabel";
import FAQAccordion from "@/components/ui/FAQAccordion";
import type { ProductFAQ as FAQ } from "@/lib/products/types";

interface ProductFAQProps {
  items: FAQ[];
}

/** قسم الأسئلة الشائعة في صفحة المنتج — يغلّف الأكورديون المشترك */
export default function ProductFAQ({ items }: ProductFAQProps) {
  const t = useTranslations("product");
  return (
    <section style={{ background: "var(--cream)", padding: "20px 0 clamp(68px, 6vw, 88px)" }}>
      <Container>
        <div className="mx-auto" style={{ maxWidth: 800 }}>
          <div className="mb-6 md:mb-10 text-center">
            <SectionLabel color="teal" centered>{t("faqLabel")}</SectionLabel>
            <h2
              className="text-h2 font-heading font-bold"
              style={{ color: "var(--dark)", lineHeight: 1.2 }}
            >
              {t.rich("faqTitle", { i: (chunks) => <span style={{ color: "var(--rose)", fontStyle: "italic" }}>{chunks}</span> })}
            </h2>
          </div>

          <FAQAccordion
            items={items}
            accent="rgba(242,167,181,0.40)"
            openBg="var(--rosepale)"
          />
        </div>
      </Container>
    </section>
  );
}
