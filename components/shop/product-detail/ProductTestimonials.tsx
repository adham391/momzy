import Container from "@/components/ui/Container";
import SectionLabel from "@/components/ui/SectionLabel";
import ProductImagePlaceholder from "@/components/shop/ProductImagePlaceholder";
import type { ProductTestimonial } from "@/lib/products/types";

interface ProductTestimonialsProps {
  items: ProductTestimonial[];
}

export default function ProductTestimonials({ items }: ProductTestimonialsProps) {
  return (
    <section style={{ background: "#F5F0EA", padding: "20px 0 clamp(68px, 6vw, 88px)" }}>
      <Container>
        <div className="mb-6 md:mb-12 text-center">
          <SectionLabel color="teal" centered>شهادات</SectionLabel>
          <h2
            className="text-h2 font-heading font-bold"
            style={{
              color: "var(--dark)",
              lineHeight: 1.2,
            }}
          >
            كلمات من أمهات عشن <span style={{ color: "var(--rose)", fontStyle: "italic" }}>التجربة</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {items.map((t, idx) => (
            <TestimonialCard key={idx} item={t} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function TestimonialCard({ item }: { item: ProductTestimonial }) {
  return (
    <div
      className="rounded-[20px] p-5 flex flex-col relative overflow-hidden"
      style={{
        background: "var(--rosepale)",
        border: "1.5px solid rgba(242,167,181,0.20)",
        boxShadow: "0 4px 20px rgba(242,167,181,0.10)",
      }}
    >
      {/* علامة تنصيص كبيرة — absolute top-start */}
      <div
        className="absolute"
        style={{
          top: 14,
          insetInlineStart: 20,
          fontSize: 72,
          color: "var(--rose)",
          opacity: 0.6,
          fontFamily: "Georgia, serif",
          lineHeight: 1,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        &ldquo;
      </div>

      {/* النجوم */}
      <div className="flex gap-0.5 mb-4 mt-2" dir="ltr">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            style={{
              fontSize: 15,
              color: i < item.rating ? "var(--yellow)" : "var(--bord)",
            }}
          >
            ★
          </span>
        ))}
      </div>

      {/* النص */}
      <p
        className="text-[14px] leading-[1.9] mb-6 flex-1"
        style={{
          color: "var(--mid)",
          fontFamily: "'Tajawal', sans-serif",
        }}
      >
        {item.text}
      </p>

      {/* الاسم + الموقع + الصورة */}
      <div
        className="flex items-center gap-3 pt-4"
        style={{ borderTop: "1px solid rgba(242,167,181,0.20)" }}
      >
        <div
          className="rounded-full overflow-hidden shrink-0"
          style={{
            width: 42,
            height: 42,
            border: "1.5px solid rgba(242,167,181,0.35)",
            background: "var(--rosepale)",
          }}
        >
          <ProductImagePlaceholder src={item.image} alt={item.name} size="testimonial" />
        </div>
        <div>
          <div
            className="font-heading font-bold text-[14px]"
            style={{ color: "var(--dark)" }}
          >
            {item.name}
          </div>
          <div className="font-label text-[11px]" style={{ color: "var(--light)" }}>
            {item.location}
          </div>
        </div>
      </div>
    </div>
  );
}
