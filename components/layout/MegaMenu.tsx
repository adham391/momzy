"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import ProductImagePlaceholder from "@/components/shop/ProductImagePlaceholder";
import { isDigitalProduct, BOOKLET_COVER_RATIO } from "@/lib/products/helpers";
import type { Product } from "@/lib/products/types";

/** خصائص الميقا منيو */
interface MegaMenuProps {
  products?: Product[];
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

/** الميقا منيو — dropdown المتجر بمنتجات حقيقية وصورها */
export default function MegaMenu({ products = [], onMouseEnter, onMouseLeave }: MegaMenuProps) {
  const t = useTranslations("megaMenu");
  const items = products.slice(0, 4);

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="mega-menu-enter absolute top-[calc(100%+10px)] end-0 bg-white rounded-[22px] border-[1.5px] border-bord shadow-[0_16px_48px_rgba(0,0,0,0.12)] w-[560px] z-[600] overflow-hidden"
    >
      {/* ── الرأس ── */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-bord">
        <div>
          <span
            className="font-label font-extrabold uppercase text-[10px] tracking-[2px]"
            style={{ color: "var(--teal)" }}
          >
            {t("label")}
          </span>
          <div className="font-heading font-bold text-dark text-[15px] leading-tight mt-0.5">
            {t("tagline")}
          </div>
        </div>
        <Link
          href="/shop"
          className="font-label font-bold text-[13px] text-teal flex items-center gap-1.5 [transition:gap_200ms_cubic-bezier(0.23,1,0.32,1)] hover:gap-2.5"
        >
          {t("allProducts")}
        </Link>
      </div>

      {/* ── شبكة المنتجات الحقيقية ── */}
      {items.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 p-3.5">
          {items.map((p) => (
            <Link
              key={p.slug}
              href={`/shop/${p.slug}`}
              className="group flex items-center gap-3 p-2.5 rounded-[14px] border border-transparent [transition:background-color_160ms_ease,border-color_160ms_ease,transform_200ms_cubic-bezier(0.23,1,0.32,1)] hover:bg-rosepale hover:border-[rgba(242,167,181,0.28)] hover:-translate-y-[2px]"
            >
              {/* صورة المنتج — الكتيبات بحاوية طولية بنسبة الغلاف (ملء تام بلا قص) */}
              <span
                className="relative rounded-[11px] overflow-hidden shrink-0"
                style={
                  isDigitalProduct(p)
                    ? { height: 62, aspectRatio: BOOKLET_COVER_RATIO, background: "var(--offwh)" }
                    : { width: 62, height: 62, background: "var(--offwh)" }
                }
              >
                <ProductImagePlaceholder src={p.mainImage} alt={p.title} size="thumb" objectFit="cover" />
                {p.badge && (
                  <span
                    className="absolute top-1 start-1 font-label font-extrabold text-[7px] tracking-[0.5px] uppercase px-1.5 py-[2px] rounded-full"
                    style={{
                      background:
                        p.badgeColor === "teal" ? "var(--teal)" :
                        p.badgeColor === "yellow" ? "#F7DF98" : "var(--rose)",
                      color: p.badgeColor === "yellow" ? "var(--dark)" : "white",
                    }}
                  >
                    {p.badge}
                  </span>
                )}
              </span>

              {/* الاسم + السعر */}
              <div className="min-w-0">
                <div className="font-label uppercase text-[9px] tracking-[1px] text-light mb-0.5 truncate">
                  {p.category}
                </div>
                <div className="font-heading font-bold text-dark text-[13px] leading-snug line-clamp-2">
                  {p.title}
                </div>
                <div className="font-label font-extrabold text-[14px] mt-0.5" style={{ color: "var(--rose)" }}>
                  ₪{p.price}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-mid text-[13px] font-body">
          {t("comingSoon")}
        </div>
      )}
    </div>
  );
}
