"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { useRouter } from "@/lib/i18n/navigation";
import { useCart } from "@/lib/store/cart";
import Container from "@/components/ui/Container";
import ProductImagePlaceholder from "@/components/shop/ProductImagePlaceholder";
import { categoryLabel } from "@/lib/products/categoryLabels";
import type { Product } from "@/lib/products/types";

interface BookletHeroProps {
  product: Product;
}

/**
 * Hero صفحة الكتيب الرقمي.
 * نسخة مخصّصة للكتيبات (PDF): بلا خيارات هدية أو شحن،
 * وبشارات ثقة رقمية بدل شارات الشحن الفيزيائي.
 */
export default function BookletHero({ product }: BookletHeroProps) {
  const locale = useLocale();
  const t = useTranslations("booklet");
  const tNav = useTranslations("nav");
  const addItem = useCart((s) => s.addItem);
  const addItemSilent = useCart((s) => s.addItemSilent);
  const router = useRouter();

  function handleBuyNow() {
    addItemSilent(product);
    router.push("/checkout");
  }
  function handleAddToCart() {
    addItem(product);
  }

  const savings = product.compareAtPrice ? product.compareAtPrice - product.price : null;

  return (
    <section
      className="relative overflow-hidden pt-4 pb-[72px] md:pt-6 md:pb-24"
      style={{ background: "linear-gradient(160deg, white 0%, var(--tealpale) 55%, var(--cream) 100%)" }}
    >
      {/* توهّج خلف الغلاف */}
      <div
        aria-hidden
        className="absolute pointer-events-none hidden md:block"
        style={{ width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle, rgba(130,201,196,0.28), transparent 70%)", top: 40, insetInlineEnd: "8%", filter: "blur(30px)" }}
      />

      <Container>
        {/* Breadcrumb */}
        <nav className="font-label text-[13px] md:text-[14px] flex items-center gap-1.5 mb-5" style={{ color: "var(--light)" }}>
          <Link href="/" className="hover:text-dark transition-colors">{tNav("home")}</Link>
          <span>›</span>
          <Link href="/shop" className="hover:text-dark transition-colors">{tNav("shop")}</Link>
          <span>›</span>
          <span style={{ color: "var(--mid)" }}>{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 md:gap-10 items-start">

          {/* ── الغلاف ── */}
          <div className="md:sticky md:top-[88px] md:self-start w-full md:w-auto">
            <div
              className="relative rounded-[20px] overflow-hidden mx-auto aspect-[3/4] w-full max-w-[340px] md:w-[340px]"
              style={{ border: "1.5px solid var(--bord)", boxShadow: "0 16px 48px rgba(0,0,0,0.10)", background: "white" }}
            >
              <ProductImagePlaceholder src={product.mainImage ?? ""} alt={product.title} size="hero" objectFit="contain" />
              <span
                className="absolute top-3 font-label font-bold text-[12px] px-3 py-1.5 rounded-full"
                style={{ insetInlineStart: 12, background: "var(--teal)", color: "white", boxShadow: "0 4px 12px rgba(130,201,196,0.45)" }}
              >
                {t("badgeFormat")}
              </span>
            </div>
          </div>

          {/* ── المعلومات ── */}
          <div>
            <p className="font-label font-bold text-[16px] md:text-[18px] mb-3" style={{ color: "var(--teal)", letterSpacing: "1px" }}>
              {t("tagline")}
            </p>

            <div className="flex items-center gap-2 mb-3">
              <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: "var(--rose)" }} />
              <span className="font-label font-bold text-[12px] uppercase" style={{ color: "var(--rose)", letterSpacing: "2px" }}>
                {categoryLabel(product.category, locale)}
              </span>
            </div>

            <h1 className="font-heading font-bold mb-3" style={{ fontSize: "clamp(28px, 3.4vw, 42px)", color: "var(--dark)", lineHeight: 1.15 }}>
              {product.title}
            </h1>

            <p className="leading-[1.8] mb-4" style={{ fontSize: "clamp(15px, 1.2vw, 17px)", color: "var(--mid)", fontFamily: "'Tajawal', sans-serif" }}>
              {product.description}
            </p>

            {/* السعر */}
            <div
              className="rounded-[18px] p-4 mb-4 flex items-center justify-between flex-wrap gap-3"
              style={{ background: "white", border: "1.5px solid var(--bord)", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}
            >
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="font-label font-extrabold" dir="ltr" style={{ fontSize: "clamp(32px, 3.6vw, 44px)", color: "var(--teal)", lineHeight: 1 }}>
                  ₪{product.price}
                </span>
                {product.compareAtPrice && (
                  <span className="font-label line-through" dir="ltr" style={{ fontSize: "clamp(18px, 1.6vw, 22px)", color: "var(--light)" }}>
                    ₪{product.compareAtPrice}
                  </span>
                )}
              </div>
              {savings && savings > 0 && (
                <div className="font-label font-bold text-[13px] px-3.5 py-2 rounded-full" style={{ background: "var(--rose)", color: "white", boxShadow: "0 4px 12px rgba(242,167,181,0.45)" }}>
                  {t("savings", { amount: savings })}
                </div>
              )}
            </div>

            {/* CTA أساسي */}
            <button
              data-hero-cta
              onClick={handleBuyNow}
              className="w-full font-label font-bold mb-3 btn-wobble [transition:transform_200ms_cubic-bezier(0.23,1,0.32,1),box-shadow_200ms_ease] hover:-translate-y-[2px]"
              style={{ fontSize: "clamp(17px, 1.4vw, 19px)", background: "var(--rose)", color: "var(--dark)", border: "none", borderRadius: 50, padding: "16px 26px", cursor: "pointer", boxShadow: "0 10px 28px rgba(242,167,181,0.55)" }}
            >
              {t("buyNow")}
            </button>

            <button
              onClick={handleAddToCart}
              className="w-full font-label font-semibold text-[14px] mb-4 [transition:color_180ms_ease] hover:underline"
              style={{ background: "transparent", color: "var(--mid)", border: "none", padding: "8px", cursor: "pointer" }}
            >
              {t("addToCart")}
            </button>

            {/* شارات ثقة رقمية */}
            <div
              className="rounded-[16px] overflow-hidden flex flex-col md:flex-row md:items-center md:justify-around md:py-4 md:px-3 md:gap-2"
              style={{ background: "rgba(255,255,255,0.6)", border: "1px solid var(--bord)" }}
            >
              <TrustSignal emoji="📖" label={t("trustFormat")} />
              <Divider />
              <TrustSignal emoji="✉️" label={t("trustDelivery")} />
              <Divider />
              <TrustSignal emoji="🔒" label={t("trustSecure")} />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/** CTA النهائي للكتيب — نظير ProductFinalCTA لكن بصياغة الكتيب الرقمي */
export function BookletFinalCTA({ product }: BookletHeroProps) {
  const t = useTranslations("booklet");
  const addItemSilent = useCart((s) => s.addItemSilent);
  const router = useRouter();

  function handleBuy() {
    addItemSilent(product);
    router.push("/checkout");
  }

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #82C9C4 0%, #6FB8B3 50%, var(--rose) 100%)", padding: "32px 0 96px" }}
    >
      <div style={{ position: "absolute", width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.10)", top: 20, left: "10%", pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.07)", bottom: 30, left: -30, pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.06)", bottom: -50, right: "15%", pointerEvents: "none" }} />

      <Container>
        <div className="text-center relative z-10" style={{ maxWidth: 620, margin: "0 auto" }}>
          <h2 className="font-heading font-bold mb-3" style={{ fontSize: "clamp(30px, 4vw, 44px)", color: "var(--dark)", lineHeight: 1.15 }}>
            {t.rich("ctaTitle", { i: (chunks) => <span style={{ color: "white", fontStyle: "italic" }}>{chunks}</span> })}
          </h2>
          <p className="mb-6" style={{ fontSize: "clamp(15px, 1.3vw, 17px)", color: "rgba(37,34,32,0.85)", fontFamily: "'Tajawal', sans-serif", lineHeight: 1.75, fontWeight: 500 }}>
            {t("ctaSubtitle")}
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap mb-6">
            <span className="font-label font-extrabold" dir="ltr" style={{ fontSize: "clamp(38px, 4.4vw, 52px)", color: "white", lineHeight: 1, textShadow: "0 2px 8px rgba(0,0,0,0.10)" }}>
              ₪{product.price}
            </span>
            {product.compareAtPrice && (
              <span className="font-label line-through" dir="ltr" style={{ fontSize: "clamp(20px, 2vw, 24px)", color: "rgba(37,34,32,0.55)" }}>
                ₪{product.compareAtPrice}
              </span>
            )}
          </div>

          <button
            onClick={handleBuy}
            className="inline-flex items-center justify-center gap-2 font-label font-extrabold [transition:transform_220ms_cubic-bezier(0.23,1,0.32,1),box-shadow_220ms_ease] hover:-translate-y-[3px] hover:shadow-[0_20px_48px_rgba(0,0,0,0.22)]"
            style={{ fontSize: "clamp(17px, 1.5vw, 20px)", background: "white", color: "var(--dark)", border: "none", borderRadius: 50, padding: "20px 48px", cursor: "pointer", boxShadow: "0 14px 36px rgba(0,0,0,0.18)", minWidth: 240 }}
          >
            <span>{t("ctaButton")}</span>
            <span style={{ fontSize: "1.2em" }}>{t("ctaArrow")}</span>
          </button>

          <div className="flex items-center justify-center gap-4 mt-5 flex-wrap">
            <TrustLine icon="📖" text={t("ctaTrustFormat")} />
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(37,34,32,0.30)" }} />
            <TrustLine icon="✉️" text={t("ctaTrustDelivery")} />
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(37,34,32,0.30)" }} />
            <TrustLine icon="🔒" text={t("ctaTrustSecure")} />
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ── مكونات فرعية ── */

function TrustSignal({ emoji, label }: { emoji: string; label: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 md:px-1 md:py-0">
      <span className="flex items-center justify-center shrink-0" style={{ width: 36, height: 36, borderRadius: 10, background: "var(--tealpale)", fontSize: 18 }}>
        {emoji}
      </span>
      <span className="font-label text-[13px] md:text-[12px] leading-[1.35]" style={{ color: "var(--dark)" }}>
        {label}
      </span>
    </div>
  );
}

function Divider() {
  return <span className="block w-full h-px md:w-px md:h-6" style={{ background: "var(--bord)" }} />;
}

function TrustLine({ icon, text }: { icon: string; text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span style={{ fontSize: 14 }}>{icon}</span>
      <span className="font-label font-semibold text-[12px]" style={{ color: "rgba(37,34,32,0.85)" }}>
        {text}
      </span>
    </span>
  );
}
