import Container from "@/components/ui/Container";

interface ProductShortDescriptionProps {
  text: string;
}

/** قسم الوصف القصير — نص شاعري وسط الصفحة */
export default function ProductShortDescription({ text }: ProductShortDescriptionProps) {
  return (
    <section style={{ background: "var(--rosepale)", padding: "28px 0 clamp(72px, 8vw, 100px)" }}>
      <Container>
        <div className="mx-auto text-center" style={{ maxWidth: 720 }}>
          {/* رمز مزخرف */}
          <div
            className="mx-auto mb-6 flex items-center justify-center"
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "rgba(242,167,181,0.18)",
              border: "1.5px solid rgba(242,167,181,0.35)",
              fontSize: 22,
              color: "var(--rose)",
            }}
          >
            ✦
          </div>

          <p
            className="text-h4 font-heading"
            style={{
              color: "var(--mid)",
              lineHeight: 1.85,
              fontStyle: "italic",
            }}
          >
            {text}
          </p>
        </div>
      </Container>
    </section>
  );
}
