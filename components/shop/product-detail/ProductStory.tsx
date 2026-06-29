import Link from "next/link";
import Container from "@/components/ui/Container";
import SectionLabel from "@/components/ui/SectionLabel";
import ProductImagePlaceholder from "@/components/shop/ProductImagePlaceholder";
import type { ProductStory as Story } from "@/lib/products/types";

interface ProductStoryProps {
  story: Story;
}

/** قسم القصة — "من قلب هبة" */
export default function ProductStory({ story }: ProductStoryProps) {
  return (
    <section style={{ background: "#FDFAF5", padding: "28px 0 clamp(80px, 10vw, 120px)" }}>
      <Container>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-10 items-center">
            {/* الصورة الدائرية */}
            <div className="mx-auto md:mx-0">
              <div
                className="rounded-full overflow-hidden"
                style={{
                  width: 240,
                  height: 240,
                  border: "2px solid rgba(242,167,181,0.25)",
                  background: "var(--rosepale)",
                  boxShadow: "0 12px 32px rgba(0,0,0,0.08)",
                }}
              >
                <ProductImagePlaceholder src={story.image} alt="هبة حسن" size="story" />
              </div>
            </div>

            {/* النص */}
            <div>
              <SectionLabel color="teal">قصتنا</SectionLabel>
              <h2
                className="text-h2 font-heading font-bold mb-6"
                style={{ color: "var(--dark)", lineHeight: 1.2 }}
              >
                {story.title.replace("هبة", "").trim()}{" "}
                <span style={{ color: "var(--rose)", fontStyle: "italic" }}>هبة</span>
              </h2>

              {story.paragraphs.map((para, idx) => (
                <p
                  key={idx}
                  className="text-[15px] leading-[1.95] mb-4"
                  style={{ color: "var(--mid)", fontFamily: "'Tajawal', sans-serif" }}
                >
                  {para}
                </p>
              ))}

              <Link
                href="/about"
                className="inline-block font-label font-bold text-[14px] mt-3 transition-opacity hover:opacity-80"
                style={{ color: "var(--rose)", borderBottom: "1px solid rgba(242,167,181,0.4)", paddingBottom: 2 }}
              >
                اعرفي أكتر عن Momzy ←
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
