"use client";

import { useState, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils/cn";
import { MOBILE_NAV_ITEMS, HEADER_HEIGHT } from "@/lib/utils/constants";
import ProductImagePlaceholder from "@/components/shop/ProductImagePlaceholder";
import { isDigitalProduct, BOOKLET_COVER_RATIO } from "@/lib/products/helpers";
import LanguageSwitcher from "./LanguageSwitcher";
import type { Product } from "@/lib/products/types";

/** خصائص القائمة المتنقلة */
interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  products?: Product[];
}

/** قائمة الموبايل — overlay كامل الشاشة مع CTA + footer */
export default function MobileMenu({ isOpen, onClose, products = [] }: MobileMenuProps) {
  const t = useTranslations();
  const [shopOpen, setShopOpen] = useState(false);

  /** الموقع الفعلي لأسفل الهيدر (TopBar + Header) */
  const [menuTop, setMenuTop] = useState<number>(HEADER_HEIGHT);

  useEffect(() => {
    function measure() {
      const header = document.querySelector("header");
      if (header) {
        setMenuTop(Math.round(header.getBoundingClientRect().bottom));
      }
    }
    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, []);

  useLayoutEffect(() => {
    if (!isOpen) return;
    const header = document.querySelector("header");
    if (header) {
      setMenuTop(Math.round(header.getBoundingClientRect().bottom));
    }
  }, [isOpen]);

  /** علِّم body بأن المينيو مفتوح — لإخفاء التوب بار + قفل scroll */
  useEffect(() => {
    if (isOpen) {
      document.body.dataset.menuOpen = "true";
    } else {
      delete document.body.dataset.menuOpen;
    }
    return () => { delete document.body.dataset.menuOpen; };
  }, [isOpen]);

  if (!isOpen) return null;

  const shopItems = products.slice(0, 4);

  return createPortal(
    <div
      className="fixed inset-0 bg-offwh z-[800] flex flex-col overflow-y-auto mobile-menu-enter"
      style={{ paddingTop: menuTop, paddingBottom: 0 }}
    >
      {/* ─────────────────── عناصر التنقل ─────────────────── */}
      <div className="flex flex-col gap-2 px-6">
        {MOBILE_NAV_ITEMS.map((item, idx) => (
          <div
            key={item.href}
            className="mobile-menu-item"
            style={{ animationDelay: `${60 + idx * 40}ms` }}
          >
            {item.hasDropdown ? (
              <>
                <button
                  onClick={() => setShopOpen((prev) => !prev)}
                  className="btn-wobble-light w-full flex items-center gap-3.5 px-[18px] py-4 rounded-[14px] text-base font-semibold text-dark border-[1.5px] border-bord bg-white cursor-pointer [transition:background-color_150ms_ease,border-color_150ms_ease,color_150ms_ease] hover:border-teal hover:bg-tealpale hover:text-teal"
                >
                  <span className={cn("w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0", item.iconBg)}>
                    <Image src={item.icon} alt={t(`nav.${item.id}`)} width={26} height={26} className="object-contain" />
                  </span>
                  <span className="flex-1 text-start">{t(`nav.${item.id}`)}</span>
                  <svg
                    width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                    className={cn("transition-transform duration-200 shrink-0", shopOpen && "rotate-180")}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                {shopOpen && (
                  <div className="mt-2 rounded-[14px] border-[1.5px] border-bord bg-white overflow-hidden">
                    <div className="p-3 flex flex-col gap-2">
                      {shopItems.length > 0 ? (
                        shopItems.map((p) => (
                          <Link
                            key={p.slug}
                            href={`/shop/${p.slug}`}
                            onClick={onClose}
                            className="flex items-center gap-3 p-2.5 rounded-[12px] border border-transparent [transition:background-color_160ms_ease,border-color_160ms_ease] hover:bg-rosepale hover:border-[rgba(242,167,181,0.28)]"
                          >
                            {/* صورة المنتج — الكتيبات بحاوية طولية بنسبة الغلاف (ملء تام بلا قص) */}
                            <span
                              className="relative rounded-[10px] overflow-hidden shrink-0"
                              style={
                                isDigitalProduct(p)
                                  ? { height: 56, aspectRatio: BOOKLET_COVER_RATIO, background: "var(--offwh)" }
                                  : { width: 56, height: 56, background: "var(--offwh)" }
                              }
                            >
                              <ProductImagePlaceholder src={p.mainImage} alt={p.title} size="thumb" objectFit="cover" />
                            </span>
                            <div className="min-w-0">
                              <div className="font-label uppercase text-[9px] tracking-[1px] text-light mb-0.5 truncate">{p.category}</div>
                              <div className="font-heading font-bold text-dark text-[13px] leading-snug line-clamp-2">{p.title}</div>
                              <div className="font-label font-extrabold text-[14px]" style={{ color: "var(--rose)" }}>₪{p.price}</div>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <div className="p-4 text-center text-mid text-[13px]">{t("megaMenu.comingSoon")}</div>
                      )}

                      <Link
                        href="/shop"
                        onClick={onClose}
                        className="text-xs font-bold text-teal flex items-center gap-1.5 px-3 py-2 rounded-[10px] hover:gap-2.5 [transition:gap_200ms_cubic-bezier(0.23,1,0.32,1)]"
                      >
                        {t("megaMenu.allProducts")}
                      </Link>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Link
                href={item.href}
                onClick={onClose}
                className="btn-wobble-light flex items-center gap-3.5 px-[18px] py-4 rounded-[14px] text-base font-semibold text-dark border-[1.5px] border-bord bg-white cursor-pointer [transition:background-color_150ms_ease,border-color_150ms_ease,color_150ms_ease] hover:border-rose hover:bg-rosepale hover:text-rose"
              >
                <span className={cn("w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0", item.iconBg)}>
                  <Image src={item.icon} alt={t(`nav.${item.id}`)} width={26} height={26} className="object-contain" />
                </span>
                {t(`nav.${item.id}`)}
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* ─────────────────── مبدّل اللغة ─────────────────── */}
      <div className="flex justify-center px-6 pt-6">
        <LanguageSwitcher size="lg" onSelect={onClose} />
      </div>

      {/* ─────────────────── الفوتر — تواصل سريع + سوشال ─────────────────── */}
      <div className="mt-auto px-6 pb-8 pt-10">
        {/* فاصل ناعم */}
        <div style={{ height: 1, background: "var(--bord)", marginBottom: 20 }} />

        <p className="text-center font-label font-bold text-[12px] mb-3" style={{ color: "var(--mid)", letterSpacing: "1.5px" }}>
          {t("menu.contact")}
        </p>

        <div className="flex justify-center gap-3 mb-5">
          {/* واتساب */}
          <a
            href="https://wa.me/972500000000"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("menu.whatsappAria")}
            className="w-12 h-12 rounded-full bg-white border-[1.5px] border-bord flex items-center justify-center hover:border-[#25D366] transition-colors"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#25D366">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
            </svg>
          </a>

          {/* إنستغرام */}
          <a
            href="https://www.instagram.com/hebahasan._"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("menu.instagramAria")}
            className="w-12 h-12 rounded-full bg-white border-[1.5px] border-bord flex items-center justify-center hover:border-[#DD2A7B] transition-colors"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="url(#ig-mobile)">
              <defs>
                <linearGradient id="ig-mobile" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#F58529" />
                  <stop offset="50%" stopColor="#DD2A7B" />
                  <stop offset="100%" stopColor="#8134AF" />
                </linearGradient>
              </defs>
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>

          {/* إيميل */}
          <a
            href="mailto:heba@momzyworld.com"
            aria-label={t("menu.emailAria")}
            className="w-12 h-12 rounded-full bg-white border-[1.5px] border-bord flex items-center justify-center hover:border-rose transition-colors"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#F2A7B5">
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
          </a>
        </div>

        <p className="text-center text-[11px]" style={{ color: "var(--light)", fontFamily: "var(--font-tajawal), sans-serif" }}>
          © Momzy — {t("footer.rights")}
        </p>
      </div>
    </div>,
    document.body
  );
}
