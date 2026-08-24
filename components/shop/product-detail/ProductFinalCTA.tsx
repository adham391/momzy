"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/navigation";
import { useCart } from "@/lib/store/cart";
import Container from "@/components/ui/Container";
import type { Product } from "@/lib/products/types";

interface ProductFinalCTAProps {
  product: Product;
}

/** قسم CTA النهائي — مُحسَّن للتحويل بهرمية بصرية واضحة */
export default function ProductFinalCTA({ product }: ProductFinalCTAProps) {
  const t = useTranslations("product");
  const addItemSilent = useCart((s) => s.addItemSilent);
  const router = useRouter();

  const savings = product.compareAtPrice ? product.compareAtPrice - product.price : null;

  function handleBuy() {
    addItemSilent(product);
    router.push("/checkout");
  }

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #F2A7B5 0%, #DC8A9E 50%, var(--teal) 100%)",
        padding: "32px 0 96px",
      }}
    >
      {/* دوائر ديكورية */}
      <div style={{ position: "absolute", width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.10)", top: 20, left: "10%", pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.08)", top: 40, right: "20%", pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.07)", bottom: 30, left: -30, pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.06)", bottom: -50, right: "15%", pointerEvents: "none" }} />

      <Container>
        <div className="text-center relative z-10" style={{ maxWidth: 620, margin: "0 auto" }}>

          {/* Status badge صغير فوق العنوان */}
          <div
            className="inline-flex items-center gap-2 mb-5 px-4 py-2 rounded-full"
            style={{
              background: "rgba(255,255,255,0.55)",
              border: "1px solid rgba(255,255,255,0.70)",
              backdropFilter: "blur(8px)",
            }}
          >
            <span className="relative flex items-center justify-center" style={{ width: 8, height: 8 }}>
              <span
                className="absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ background: "#10B981", animation: "pulse-badge 2s infinite" }}
              />
              <span className="relative inline-flex rounded-full" style={{ width: 7, height: 7, background: "#10B981" }} />
            </span>
            <span className="font-label font-bold text-[12px]" style={{ color: "var(--dark)", letterSpacing: "0.5px" }}>
              {t("ctaAvailability")}
            </span>
          </div>

          {/* العنوان */}
          <h2
            className="font-heading font-bold mb-3"
            style={{
              fontSize: "clamp(32px, 4vw, 46px)",
              color: "var(--dark)",
              lineHeight: 1.15,
            }}
          >
            {t.rich("ctaTitle", { i: (chunks) => <span style={{ color: "white", fontStyle: "italic" }}>{chunks}</span> })}
          </h2>

          {/* النص الفرعي */}
          <p
            className="mb-6"
            style={{
              fontSize: "clamp(15px, 1.3vw, 17px)",
              color: "rgba(37,34,32,0.85)",
              fontFamily: "'Tajawal', sans-serif",
              lineHeight: 1.75,
              fontWeight: 500,
            }}
          >
            {t.rich("ctaSubtitle", { br: () => <br className="hidden sm:inline" /> })}
          </p>

          {/* بلوك السعر — مع savings badge */}
          <div className="flex items-center justify-center gap-3 flex-wrap mb-6">
            <span
              className="font-label font-extrabold"
              dir="ltr"
              style={{
                fontSize: "clamp(38px, 4.4vw, 52px)",
                color: "white",
                lineHeight: 1,
                textShadow: "0 2px 8px rgba(0,0,0,0.10)",
              }}
            >
              ₪{product.price}
            </span>
            {product.compareAtPrice && (
              <span
                className="font-label line-through"
                dir="ltr"
                style={{
                  fontSize: "clamp(20px, 2vw, 24px)",
                  color: "rgba(37,34,32,0.55)",
                }}
              >
                ₪{product.compareAtPrice}
              </span>
            )}
            {savings && savings > 0 && (
              <span
                className="font-label font-bold text-[13px] px-3 py-1.5 rounded-full"
                style={{
                  background: "var(--dark)",
                  color: "white",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
              >
                {t("saveAmount", { amount: savings })}
              </span>
            )}
          </div>

          {/* زر CTA رئيسي — أبيض كبير بارز */}
          <button
            onClick={handleBuy}
            className="inline-flex items-center justify-center gap-2 font-label font-extrabold [transition:transform_220ms_cubic-bezier(0.23,1,0.32,1),box-shadow_220ms_ease] hover:-translate-y-[3px] hover:shadow-[0_20px_48px_rgba(0,0,0,0.22)]"
            style={{
              fontSize: "clamp(17px, 1.5vw, 20px)",
              background: "white",
              color: "var(--dark)",
              border: "none",
              borderRadius: 50,
              padding: "20px 48px",
              cursor: "pointer",
              boxShadow: "0 14px 36px rgba(0,0,0,0.18)",
              minWidth: 240,
            }}
          >
            <span>{t("buyNow")}</span>
            <span style={{ fontSize: "1.2em" }}>{t("arrow")}</span>
          </button>

          {/* trust line تحت الزر */}
          <div className="flex items-center justify-center gap-4 mt-5 flex-wrap">
            <TrustLine icon="🔒" text={t("trustSecurePay")} />
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(37,34,32,0.30)" }} />
            <TrustLine icon="🎁" text={t("trustWrapped")} />
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(37,34,32,0.30)" }} />
            <TrustLine icon="✓" text={t("trustQuality")} />
          </div>

        </div>
      </Container>
    </section>
  );
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
