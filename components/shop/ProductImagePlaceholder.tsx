"use client";
/* eslint-disable @next/next/no-img-element */
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";

type Size = "card" | "hero" | "gallery" | "story" | "testimonial" | "thumb";

interface ProductImagePlaceholderProps {
  src?: string;
  alt: string;
  size?: Size;
  className?: string;
  objectFit?: "cover" | "contain";
}

export default function ProductImagePlaceholder({
  src,
  alt,
  size = "card",
  className,
  objectFit = "cover",
}: ProductImagePlaceholderProps) {
  const t = useTranslations("shop");

  return (
    <div
      className={cn("relative w-full h-full overflow-hidden flex items-center justify-center", className)}
      style={{ background: "linear-gradient(135deg, #FEF5F7 0%, #F5F0EA 100%)" }}
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
          src={src}
          alt={alt}
          className="absolute inset-0 w-full h-full"
          style={{ objectFit }}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
          loading="lazy"
        />
      ) : null}
    </div>
  );
}
