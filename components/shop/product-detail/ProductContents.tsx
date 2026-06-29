import Image from "next/image";
import Container from "@/components/ui/Container";
import SectionLabel from "@/components/ui/SectionLabel";
import type { ProductContent } from "@/lib/products/types";
import {
  Sparkles, MessageCircle, Flame,
  Baby, BookOpen, ClipboardList, Gift,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ProductContentsProps {
  items: ProductContent[];
}

/** أيقونة احتياطية لكل عنصر — تُستخدم إذا لم تُرفع أيقونة من Sanity */
const FALLBACK_ICONS: LucideIcon[] = [
  Sparkles, MessageCircle, Flame,
  Baby, BookOpen, ClipboardList, Gift,
];

/** ألوان الأيقونات تتناوب: rose → teal → yellow */
const ICON_COLORS = [
  { bg: "rgba(242,167,181,0.18)", border: "rgba(242,167,181,0.35)", color: "#F2A7B5" },
  { bg: "var(--tealpale)",        border: "rgba(130,201,196,0.40)", color: "#82C9C4" },
  { bg: "rgba(247,223,152,0.25)", border: "rgba(247,223,152,0.50)", color: "#C09420" },
];

/** قسم محتويات المنتج — "كل قطعة جمعناها إلك" */
export default function ProductContents({ items }: ProductContentsProps) {
  return (
    <section style={{ background: "var(--cream)", padding: "28px 0 clamp(80px, 10vw, 120px)" }}>
      <Container>
        <div className="mb-12 text-center">
          <SectionLabel color="teal" centered>محتويات الصندوق</SectionLabel>
          <h2
            className="text-h2 font-heading font-bold"
            style={{ color: "var(--dark)", lineHeight: 1.2 }}
          >
            كل قطعة جمعناها <span style={{ color: "var(--rose)", fontStyle: "italic" }}>إلك</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
          {items.map((item, idx) => (
            <ContentCard key={item.name} item={item} idx={idx} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function ContentCard({ item, idx }: { item: ProductContent; idx: number }) {
  const FallbackIcon = FALLBACK_ICONS[idx] ?? Sparkles;
  const colorSet     = ICON_COLORS[idx % 3];

  return (
    <div
      className="rounded-[20px] overflow-hidden [transition:transform_250ms_cubic-bezier(0.23,1,0.32,1),box-shadow_250ms_ease] hover:shadow-[0_8px_28px_rgba(242,167,181,0.12)] hover:-translate-y-[3px]"
      style={{ background: "white", border: "1.5px solid rgba(242,167,181,0.15)" }}
    >
      {/* صورة المعاينة من Sanity — تظهر في أعلى البطاقة إذا رُفعت */}
      {item.image && (
        <div className="relative w-full" style={{ height: 180 }}>
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
          />
        </div>
      )}

      <div className="p-6">
        {/* الأيقونة — صورة من Sanity أو Lucide احتياطي */}
        <div
          className="flex items-center justify-center mb-5"
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: colorSet.bg,
            border: `1px solid ${colorSet.border}`,
            overflow: "hidden",
          }}
        >
          {item.icon ? (
            <Image
              src={item.icon}
              alt={item.name}
              width={30}
              height={30}
              className="object-contain"
            />
          ) : (
            <FallbackIcon size={22} color={colorSet.color} strokeWidth={1.5} fill="none" />
          )}
        </div>

        <h3
          className="font-heading font-bold mb-2"
          style={{ fontSize: 17, color: "var(--dark)", lineHeight: 1.3 }}
        >
          {item.name}
        </h3>

        <p
          className="text-[14px] leading-[1.75]"
          style={{ color: "var(--mid)", fontFamily: "'Tajawal', sans-serif" }}
        >
          {item.description}
        </p>
      </div>
    </div>
  );
}
