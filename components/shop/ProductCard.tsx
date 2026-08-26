"use client";

import { useLocale } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import AddToCartButton from "@/components/shop/AddToCartButton";
import ProductImagePlaceholder from "@/components/shop/ProductImagePlaceholder";
import { categoryLabel } from "@/lib/products/categoryLabels";
import { isDigitalProduct } from "@/lib/products/helpers";
import type { Product } from "@/lib/products/types";

interface ProductCardProps {
  product: Product;
  /** إظهار شارات الـ tags — يُعطّل في الشبكات المدمجة (مثل الأكثر مبيعاً) لتوحيد الطول */
  showTags?: boolean;
}

/** كارد منتج واحد في شبكة المتجر — schema الجديد */
export default function ProductCard({ product, showTags = true }: ProductCardProps) {
  const locale = useLocale();
  /** أول 1-2 tags كـ badges فوق الصورة — فلترة القيم القديمة (strings) */
  const visibleTags = (product.tags ?? [])
    .filter((tag): tag is import("@/lib/products/types").ProductTag =>
      tag !== null && typeof tag === "object" && "label" in tag
    )
    ;

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group flex flex-col h-full bg-white rounded-[22px] overflow-hidden border border-bord [transition:transform_250ms_cubic-bezier(0.23,1,0.32,1),box-shadow_250ms_ease,border-color_200ms_ease] hover:-translate-y-[5px] hover:shadow-[0_14px_40px_rgba(0,0,0,0.10)] hover:border-transparent"
    >
      {/* ── منطقة الصورة ── */}
      <div className="relative shrink-0" style={{ height: 220 }}>
        {/* الكتيبات طولية — contain يعرض الغلاف كاملًا على الخلفية الناعمة */}
        <ProductImagePlaceholder
          src={product.mainImage}
          alt={product.title}
          size="card"
          objectFit={isDigitalProduct(product) ? "contain" : "cover"}
        />

        {/* badge علوي — من Sanity، نفس الصفحة الرئيسية */}
        {product.badge && (
          <span
            className="absolute top-3 start-3 font-label font-extrabold text-[9px] tracking-[1.5px] uppercase px-3 py-[5px] rounded-full z-10"
            style={{
              background:
                product.badgeColor === "rose" ? "var(--rose)" :
                product.badgeColor === "teal" ? "var(--teal)" :
                "#F7DF98",
              color:
                product.badgeColor === "teal" ? "white" :
                product.badgeColor === "rose" ? "white" :
                "var(--dark)",
              animation:
                product.badgeColor === "rose" ? "pulse-badge 2s infinite" :
                product.badgeColor === "teal" ? "none" :
                "pulse-badge-yellow 2s infinite",
            }}
          >
            {product.badge}
          </span>
        )}

      </div>

      {/* ── جسم الكارد ── */}
      <div className="flex flex-col flex-1" style={{ padding: "18px 20px" }}>
        {/* التصنيف */}
        <div
          className="font-label uppercase text-dark mb-1"
          style={{ fontSize: 12, letterSpacing: "1.5px" }}
        >
          {categoryLabel(product.category, locale)}
        </div>

        {/* الاسم */}
        <div className="font-heading text-h4 font-semibold text-dark mb-2 leading-snug">
          {product.title}
        </div>

        {/* tags — نفس أسلوب الصفحة الرئيسية */}
        {showTags && visibleTags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mb-2">
            {visibleTags.map((tag) => (
              <span
                key={tag.label}
                className="text-[10px] font-semibold px-2.5 py-[3px] rounded-xl"
                style={{
                  background: tag.color === "teal" ? "var(--tealpale)" : "var(--rosepale)",
                  color:      tag.color === "teal" ? "var(--teal)"    : "var(--rose)",
                }}
              >
                ✦ {tag.label}
              </span>
            ))}
          </div>
        )}

        {/* السعر + الزر — مثبّتان بالأسفل لتساوي ارتفاع كل البطاقات */}
        <div className="mt-auto">
          {/* السعر */}
          <div className="flex items-center gap-2 mb-3">
            <span className="font-label font-extrabold text-price" style={{ color: "var(--rose)" }}>
              ₪{product.price}
            </span>
            {product.compareAtPrice && (
              <span className="font-label text-body-sm text-dark line-through">
                ₪{product.compareAtPrice}
              </span>
            )}
          </div>

          {/* زر الإضافة */}
          <AddToCartButton product={product} variant="full" />
        </div>
      </div>
    </Link>
  );
}
