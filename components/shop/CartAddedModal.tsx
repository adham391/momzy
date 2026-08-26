"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { useCart } from "@/lib/store/cart";
import { getProducts } from "@/lib/products/getProducts";
import type { Product } from "@/lib/products/types";
import { effectivePrice } from "@/lib/bundles";
import { isDigitalProduct, BOOKLET_COVER_RATIO } from "@/lib/products/helpers";

/** Modal يظهر عند إضافة أي منتج للسلة */
export default function CartAddedModal() {
  const t = useTranslations("cart");
  const locale = useLocale();
  const [mounted, setMounted]         = useState(false);
  const [visible, setVisible]         = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  const lastAdded  = useCart((s) => s.lastAdded);
  const cartItems  = useCart((s) => s.items);
  const addItem    = useCart((s) => s.addItem);
  const openCart   = useCart((s) => s.openCart);
  const getCount   = useCart((s) => s.getCount);

  useEffect(() => setMounted(true), []);

  /** جلب كل المنتجات مرة واحدة لاقتراحات أسفل الـ modal */
  useEffect(() => {
    getProducts({ inStockOnly: true }, locale).then(setAllProducts);
  }, [locale]);

  /* أظهر الـ modal عند كل إضافة جديدة */
  useEffect(() => {
    if (!lastAdded) return;
    setVisible(true);
  }, [lastAdded?.timestamp]);

  function handleClose() {
    setVisible(false);
  }

  function handleViewCart() {
    setVisible(false);
    openCart();
  }

  if (!mounted || !visible || !lastAdded) return null;

  const count = getCount();

  /** المنتجات المقترحة — غير الموجودة في السلة، بحد أقصى 3 */
  const suggestions = allProducts
    .filter((p) => !cartItems.some((c) => c.slug === p.slug))
    .slice(0, 3);

  /** slugs السلة — لحساب سعر الباقة على الاقتراحات (مثل: الكتيب بسعر خاص مع الصندوق) */
  const cartSlugs = cartItems.map((c) => c.slug);

  return createPortal(
    <div
      className="fixed inset-0 z-[900] flex items-center justify-center p-4"
      style={{
        background: "rgba(37,34,32,0.45)",
        backdropFilter: "blur(4px)",
        animation: "fadeIn 0.2s ease-out both",
      }}
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-[24px] w-full"
        style={{
          maxWidth: 460,
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
          overflow: "hidden",
          animation: "card-in 0.3s cubic-bezier(0.23, 1, 0.32, 1) both",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── هيدر ── */}
        <div
          className="flex items-center justify-between"
          style={{
            padding: "16px 20px",
            background: "var(--tealpale)",
            borderBottom: "1.5px solid var(--bord)",
          }}
        >
          <div className="flex items-center gap-2">
            <Image src="/icons/correct-icon.png" alt={t("successIconAlt")} width={20} height={20} className="object-contain" />
            <span className="font-heading font-bold text-dark text-[16px]">
              {t("addedToCart")}
            </span>
          </div>
          <div className="font-label text-[13px] text-mid">
            {t("itemsInCart", { count })}
          </div>
        </div>

        {/* ── المنتج ── */}
        <div className="flex items-center gap-4" style={{ padding: "20px" }}>
          <div
            className="rounded-[14px] shrink-0 flex items-center justify-center overflow-hidden"
            style={{
              // الكتيب بحاوية طولية بنسبة الغلاف — ملء تام بلا قص ولا هوامش
              ...(lastAdded.isDigital && lastAdded.mainImage
                ? { height: 72, aspectRatio: BOOKLET_COVER_RATIO }
                : { width: 72, height: 72 }),
              background: "linear-gradient(140deg, var(--rosepale), var(--tealpale))",
              border: "1px solid var(--bord)",
            }}
          >
            {lastAdded.mainImage ? (
              <Image
                src={lastAdded.mainImage}
                alt={lastAdded.title}
                width={72}
                height={72}
                className="w-full h-full rounded-[14px] object-cover"
                unoptimized
              />
            ) : (
              <span aria-hidden style={{ color: "var(--rose)", opacity: 0.4, fontSize: 20 }}>✦</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-heading font-bold text-dark text-[15px] leading-snug mb-1">
              {lastAdded.title}
            </div>
            <div className="font-label font-extrabold text-teal text-[18px]">
              ₪{lastAdded.price}
            </div>
          </div>
        </div>

        {/* ── الأزرار ── */}
        <div className="flex gap-3" style={{ padding: "0 20px 20px" }}>
          <button
            onClick={handleClose}
            className="flex-1 font-label font-bold text-[14px] text-dark [transition:transform_200ms_cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-[2px]"
            style={{
              background: "var(--yellow)",
              border: "none",
              borderRadius: 50,
              padding: "12px",
              cursor: "pointer",
            }}
          >
            {t("continueShopping")}
          </button>

          <button
            onClick={handleViewCart}
            className="flex-1 font-label font-bold text-[14px] [transition:transform_200ms_cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-[2px]"
            style={{
              background: "transparent",
              color: "var(--teal)",
              border: "2px solid var(--teal)",
              borderRadius: 50,
              padding: "12px",
              cursor: "pointer",
            }}
          >
            {t("goToCart")}
          </button>
        </div>

        {/* ── منتجات قد تعجبكِ ── */}
        {suggestions.length > 0 && (
          <div style={{ borderTop: "1.5px solid var(--bord)", padding: "16px 20px 20px" }}>
            <div className="font-label font-bold text-[11px] text-mid mb-3" style={{ letterSpacing: "1.5px", textTransform: "uppercase" }}>
              {t("youMayAlsoLike")}
            </div>
            <div className="flex flex-col gap-2">
              {suggestions.map((product) => {
                const eff = effectivePrice(product.slug, product.price, cartSlugs);
                const discounted = eff < product.price;
                return (
                <div
                  key={product.slug}
                  className="flex items-center gap-3 rounded-[12px] p-2"
                  style={{ border: discounted ? "1.5px solid var(--rose)" : "1px solid var(--bord)", background: "var(--offwh)" }}
                >
                  <div
                    className="rounded-[10px] shrink-0 flex items-center justify-center overflow-hidden"
                    style={{
                      ...(isDigitalProduct(product) && product.mainImage
                        ? { height: 44, aspectRatio: BOOKLET_COVER_RATIO }
                        : { width: 44, height: 44 }),
                      background: "linear-gradient(140deg, var(--rosepale), var(--tealpale))",
                    }}
                  >
                    <Image
                      src={product.mainImage}
                      alt={product.title}
                      width={44}
                      height={44}
                      className="w-full h-full rounded-[10px] object-cover"
                      unoptimized
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-label font-semibold text-dark text-[12px] truncate">{product.title}</div>
                    {discounted ? (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-label font-extrabold text-teal text-[13px]">₪{eff}</span>
                        <span className="font-label line-through text-light text-[11px]">₪{product.price}</span>
                        <span className="font-bold text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: "var(--rose)", color: "white" }}>{t("bundleOfferBadge")}</span>
                      </div>
                    ) : (
                      <div className="font-label font-extrabold text-teal text-[13px]">₪{product.price}</div>
                    )}
                  </div>

                  <button
                    onClick={() => addItem(product)}
                    className="font-label font-bold text-[12px] shrink-0 [transition:transform_160ms_cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-[1px]"
                    style={{
                      background: "transparent",
                      color: "var(--teal)",
                      border: "1.5px solid var(--teal)",
                      borderRadius: 50,
                      padding: "7px 14px",
                      cursor: "pointer",
                    }}
                  >
                    {t("addSuggestion")}
                  </button>
                </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
