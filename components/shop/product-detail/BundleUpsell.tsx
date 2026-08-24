"use client";

import { useTranslations } from "next-intl";
import { useCart } from "@/lib/store/cart";
import Container from "@/components/ui/Container";
import ProductImagePlaceholder from "@/components/shop/ProductImagePlaceholder";
import type { Product } from "@/lib/products/types";
import type { BundleRule } from "@/lib/bundles";

interface BundleUpsellProps {
  /** المنتج الحالي الذي يقدّم الباقة (الصندوق) */
  box: Product;
  /** المنتج المُضاف بسعر خاص (الكتيب) */
  booklet: Product;
  rule: BundleRule;
}

/**
 * بطاقة عرض باقة على صفحة المنتج الأساسي —
 * «أضيفي الكتيب إلى صندوقك بسعرٍ خاص». عند الإضافة نضمن وجود الصندوق
 * في السلة أيضًا كي يُفعَّل سعر الباقة فورًا.
 */
export default function BundleUpsell({ box, booklet, rule }: BundleUpsellProps) {
  const t = useTranslations("product");
  const items = useCart((s) => s.items);
  const addItemSilent = useCart((s) => s.addItemSilent);
  const openCart = useCart((s) => s.openCart);

  const bookletInCart = items.some((i) => i.slug === booklet.slug);
  const savings = booklet.price - rule.bundlePrice;

  function handleAdd() {
    // نضمن الصندوق في السلة كي تنطبق شروط الباقة
    if (!items.some((i) => i.slug === box.slug)) addItemSilent(box);
    if (!bookletInCart) addItemSilent(booklet);
    openCart();
  }

  return (
    <section style={{ background: "var(--cream)", padding: "16px 0 clamp(56px, 6vw, 76px)" }}>
      <Container>
        <div
          className="mx-auto rounded-[22px] overflow-hidden"
          style={{ maxWidth: 720, border: "2px dashed var(--teal)", background: "white" }}
        >
          {/* شريط علوي */}
          <div className="flex items-center gap-2 px-5 py-2.5" style={{ background: "var(--tealpale)" }}>
            <span>🎁</span>
            <span className="font-label font-bold text-[13px]" style={{ color: "var(--teal)", letterSpacing: "0.5px" }}>
              {t("bundle.header")}
            </span>
          </div>

          <div className="flex items-center gap-4 p-4 sm:p-5">
            {/* غلاف الكتيب */}
            <div
              className="relative rounded-[14px] overflow-hidden shrink-0"
              style={{ width: 84, height: 108, border: "1.5px solid var(--bord)" }}
            >
              <ProductImagePlaceholder src={booklet.mainImage ?? ""} alt={booklet.title} size="card" objectFit="cover" />
            </div>

            {/* التفاصيل */}
            <div className="flex-1 min-w-0">
              <div className="font-heading font-bold text-[16px] mb-1" style={{ color: "var(--dark)" }}>
                {booklet.title}
              </div>
              <p className="text-[13px] leading-[1.6] mb-2" style={{ color: "var(--mid)", fontFamily: "'Tajawal', sans-serif" }}>
                {t("bundle.description")}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-label font-extrabold text-[20px]" dir="ltr" style={{ color: "var(--teal)" }}>
                  ₪{rule.bundlePrice}
                </span>
                <span className="font-label line-through text-[14px]" dir="ltr" style={{ color: "var(--light)" }}>
                  ₪{booklet.price}
                </span>
                <span
                  className="font-label font-bold text-[11px] px-2 py-0.5 rounded-full"
                  style={{ background: "var(--rose)", color: "white" }}
                >
                  {t("saveAmount", { amount: savings })}
                </span>
              </div>
            </div>
          </div>

          {/* الزر */}
          <div className="px-4 pb-4 sm:px-5 sm:pb-5">
            {bookletInCart ? (
              <div
                className="w-full text-center font-label font-bold text-[14px] py-3 rounded-[12px]"
                style={{ background: "var(--tealpale)", color: "var(--teal)" }}
              >
                {t("bundle.inCart")}
              </div>
            ) : (
              <button
                onClick={handleAdd}
                className="w-full font-label font-bold text-[15px] btn-wobble [transition:transform_200ms_cubic-bezier(0.23,1,0.32,1),box-shadow_200ms_ease] hover:-translate-y-[2px]"
                style={{ background: "var(--teal)", color: "white", border: "none", borderRadius: 12, padding: "13px", cursor: "pointer", boxShadow: "0 8px 22px rgba(130,201,196,0.40)" }}
              >
                {t("bundle.addButton", { price: rule.bundlePrice })}
              </button>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
