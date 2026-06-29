import Container from "@/components/ui/Container";
import SectionLabel from "@/components/ui/SectionLabel";
import type { ProductGiftTarget } from "@/lib/products/types";
import { HeartHandshake, Home, Heart } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ProductGiftTargetsProps {
  targets: ProductGiftTarget[];
}

/** أيقونة مختلفة لكل فئة مستهدفة */
const TARGET_ICONS: LucideIcon[] = [
  HeartHandshake, // للصديقة
  Home,           // للأخت أو البنت
  Heart,          // لكِ أنتِ
];

/** ألوان الأيقونات تتناوب بين rose / teal / yellow */
const ICON_STYLES = [
  { bg: "var(--rosepale)",  border: "rgba(242,167,181,0.20)", color: "#F2A7B5" },
  { bg: "var(--tealpale)", border: "rgba(130,201,196,0.20)", color: "#82C9C4" },
  { bg: "#FFF9E8",          border: "rgba(247,223,152,0.40)", color: "#C09420" },
];

/** قسم "لمين هاي الهدية؟" — أهم قسم عاطفي في الصفحة */
export default function ProductGiftTargets({ targets }: ProductGiftTargetsProps) {
  return (
    <section
      style={{
        background: "var(--rosepale)",
        padding: "28px 0 clamp(80px, 10vw, 120px)",
      }}
    >
      <Container>
        <div className="mb-12 text-center">
          <SectionLabel color="teal" centered>هدية بمعنى</SectionLabel>
          <h2
            className="text-h2 font-heading font-bold"
            style={{
              color: "var(--dark)",
              lineHeight: 1.2,
            }}
          >
            لمين هاي <span style={{ color: "var(--rose)", fontStyle: "italic" }}>الهدية؟</span>
          </h2>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
          style={{ maxWidth: 1100, margin: "0 auto" }}
        >
          {targets.map((target, idx) => (
            <GiftTargetCard key={target.label} target={target} idx={idx} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function GiftTargetCard({ target, idx }: { target: ProductGiftTarget; idx: number }) {
  const Icon  = TARGET_ICONS[idx] ?? Heart;
  const style = ICON_STYLES[idx % ICON_STYLES.length];

  return (
    <div
      className="rounded-2xl p-6 md:p-8 flex flex-col items-center text-center [transition:transform_250ms_cubic-bezier(0.23,1,0.32,1),box-shadow_250ms_ease] hover:-translate-y-[4px]"
      style={{
        background: "white",
        border: "1.5px solid rgba(242,167,181,0.15)",
        boxShadow: "0 6px 24px rgba(242,167,181,0.10)",
        minHeight: 240,
      }}
    >
      {/* أيقونة في دائرة ملونة */}
      <div
        className="flex items-center justify-center mb-5"
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: style.bg,
          border: `1.5px solid ${style.border}`,
          flexShrink: 0,
        }}
      >
        <Icon size={24} color={style.color} strokeWidth={1.5} fill="none" />
      </div>

      {/* label */}
      <h3
        className="font-heading font-bold mb-3"
        style={{
          fontSize: 18,
          color: "var(--dark)",
          lineHeight: 1.3,
        }}
      >
        {target.label}
      </h3>

      {/* النص */}
      <p
        className="text-[14px] leading-[1.85]"
        style={{
          color: "var(--mid)",
          fontFamily: "'Tajawal', sans-serif",
        }}
      >
        {target.text}
      </p>
    </div>
  );
}
