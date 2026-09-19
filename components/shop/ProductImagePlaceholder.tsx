"use client";
/* eslint-disable @next/next/no-img-element */
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";
import { sanityImageAt, sanityImageSrcSet } from "@/lib/sanity/imageUrl";

type Size = "card" | "hero" | "gallery" | "story" | "testimonial" | "thumb";

interface ProductImagePlaceholderProps {
  src?: string;
  alt: string;
  size?: Size;
  className?: string;
  objectFit?: "cover" | "contain";
}

/**
 * العروض التي تُطلب من Sanity لكل موضع، والعرض الفعلي على الشاشة (sizes).
 * المتصفح يأخذ من srcset ما يناسب sizes × كثافة الشاشة — فلا يُحمَّل الأصل بعدة ميغابايت.
 */
const RESPONSIVE: Record<Size, { widths: readonly number[]; sizes: string }> = {
  card: { widths: [320, 480, 640, 960], sizes: "(max-width: 768px) 50vw, 320px" },
  hero: { widths: [480, 720, 960, 1280, 1600], sizes: "(max-width: 768px) 100vw, 50vw" },
  gallery: { widths: [400, 640, 960, 1280], sizes: "(max-width: 768px) 50vw, 33vw" },
  story: { widths: [320, 480, 640], sizes: "320px" },
  testimonial: { widths: [96, 160, 240], sizes: "96px" },
  thumb: { widths: [96, 160, 240], sizes: "96px" },
};

/** العرض الاحتياطي لـ src (للمتصفحات بلا srcset) — الأوسط في كل موضع */
const fallbackWidth = (widths: readonly number[]) => widths[Math.floor(widths.length / 2)];

export default function ProductImagePlaceholder({
  src,
  alt,
  size = "card",
  className,
  objectFit = "cover",
}: ProductImagePlaceholderProps) {
  const t = useTranslations("shop");
  const { widths, sizes } = RESPONSIVE[size];
  const srcSet = src ? sanityImageSrcSet(src, widths) : undefined;
  // صورة الهيرو أول ما تراه الزائرة — تُحمَّل فورًا وبأولوية (لا lazy) لأنها تحدّد سرعة الصفحة (LCP)
  const isAboveTheFold = size === "hero";

  return (
    <div
      className={cn("relative w-full h-full overflow-hidden flex items-center justify-center", className)}
      style={{
        // مع صورة contain: أبيض نظيف (منتج على خلفية بيضاء) — وإلا التدرّج الناعم كـ placeholder
        background:
          src && objectFit === "contain"
            ? "white"
            : "linear-gradient(135deg, #FEF5F7 0%, #F5F0EA 100%)",
      }}
      data-size={size}
    >
      {/* placeholder خافت — فقط حين لا توجد صورة (وإلا أطلّ على جانبي contain) */}
      {!src && (
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
        <span style={{ fontSize: 28, color: "#F2A7B5", opacity: 0.35, lineHeight: 1 }}>✦</span>
        <span
          style={{
            fontSize: 11,
            color: "#F2A7B5",
            opacity: 0.45,
            marginTop: 5,
            fontFamily: "'Nunito', sans-serif",
            letterSpacing: "0.5px",
          }}
        >
          {t("productImage")}
        </span>
      </div>
      )}

      {/* الصورة الحقيقية — تُغطي الـ placeholder عند نجاح التحميل */}
      {src ? (
        <img
          src={sanityImageAt(src, fallbackWidth(widths))}
          srcSet={srcSet}
          sizes={srcSet ? sizes : undefined}
          alt={alt}
          className="absolute inset-0 w-full h-full"
          style={{ objectFit }}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
          loading={isAboveTheFold ? "eager" : "lazy"}
          fetchPriority={isAboveTheFold ? "high" : undefined}
          decoding="async"
        />
      ) : null}
    </div>
  );
}
