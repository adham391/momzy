import { useTranslations } from "next-intl";
import Container from "@/components/ui/Container";
import type { ProductGiftTarget } from "@/lib/products/types";
import { Baby, HeartHandshake, Gift, Heart } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ProductGiftTargetsProps {
  targets: ProductGiftTarget[];
}

/** أيقونة مختلفة لكل فئة مستهدفة */
const TARGET_ICONS: LucideIcon[] = [
  Baby,           // الأم الحامل
  HeartHandshake, // الأم الجديدة
  Gift,           // كل مُهدية
];

/** ألوان الأيقونات تتناوب بين rose / teal / yellow */
const ICON_STYLES = [
  { bg: "var(--rosepale)",  border: "rgba(242,167,181,0.20)", color: "#F2A7B5" },
  { bg: "var(--tealpale)", border: "rgba(130,201,196,0.20)", color: "#82C9C4" },
  { bg: "#FFF9E8",          border: "rgba(247,223,152,0.40)", color: "#C09420" },
];

/** قسم "لمن هذه الهدية؟" — أهم قسم عاطفي في الصفحة */
export default function ProductGiftTargets({ targets }: ProductGiftTargetsProps) {
  const t = useTranslations("product");
  return (
    <section
      style={{
        background: "var(--rosepale)",
        padding: "20px 0 clamp(68px, 6vw, 88px)",
      }}
    >
      <Container>
        <div className="mb-6 md:mb-12 text-center">
          <h2
            className="text-h2 font-heading font-bold"
            style={{
              color: "var(--dark)",
              lineHeight: 1.2,
            }}
          >
            {t.rich("giftTargetsTitle", { i: (chunks) => <span style={{ color: "var(--rose)", fontStyle: "italic" }}>{chunks}</span> })}
          </h2>
          <p
            className="mt-3 mx-auto"
            style={{
              color: "var(--mid)",
              fontSize: "clamp(14px, 1.4vw, 16px)",
              lineHeight: 1.9,
              maxWidth: 620,
              fontFamily: "'Tajawal', sans-serif",
            }}
          >
            {t("giftTargetsSubtitle")}
          </p>
        </div>

        <div
          className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6"
          style={{ maxWidth: 1100, margin: "0 auto" }}
        >
          {targets.map((target, idx) => (
            <GiftTargetCard key={idx} target={target} idx={idx} />
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
      className="rounded-2xl p-4 sm:p-6 flex flex-col items-center text-center [transition:transform_250ms_cubic-bezier(0.23,1,0.32,1),box-shadow_250ms_ease] hover:-translate-y-[4px]"
      style={{
        background: "white",
        border: "1.5px solid rgba(242,167,181,0.15)",
        boxShadow: "0 6px 24px rgba(242,167,181,0.10)",
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

      {/* الجملة — بلا عنوان منفصل، كل بطاقة جملة واحدة */}
      <p
        className="text-[15.5px] leading-[1.9]"
        style={{
          color: "var(--dark)",
          fontFamily: "'Tajawal', sans-serif",
          fontWeight: 500,
        }}
      >
        {target.text}
      </p>
    </div>
  );
}
