"use client";

import { useState } from "react";
import { Link } from "@/lib/i18n/navigation";
import Image from "next/image";
import { useRouter } from "@/lib/i18n/navigation";
import { useCart, type GiftOptions } from "@/lib/store/cart";
import Container from "@/components/ui/Container";
import QuantityInput from "@/components/shop/QuantityInput";
import ProductImagePlaceholder from "@/components/shop/ProductImagePlaceholder";
import GiftOptionsForm from "./GiftOptionsForm";
import type { Product } from "@/lib/products/types";

interface ProductHeroProps {
  product: Product;
}

/** عناوين شاعرية مخصصة لمنتجات معيّنة */
const HERO_TAGLINES: Record<string, string> = {
  "mommy-journey-box": "ليس مجرّد صندوق، بل حِضن",
};

/* ── helpers للفيديو ─────────────────────────────────────────── */

function toEmbedUrl(url: string): string | null {
  const yt = url.match(/[?&]v=([^&]+)/) ?? url.match(/youtu\.be\/([^?&]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1`;
  const vimeo = url.match(/vimeo\.com\/(?:manage\/videos\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1`;
  const drive = url.match(/drive\.google\.com\/file\/d\/([^/?]+)/);
  if (drive) return `https://drive.google.com/file/d/${drive[1]}/preview`;
  if (/\.(mp4|webm|mov)(\?|$)/i.test(url) || url.includes("cloudinary.com")) return url;
  return null;
}

function isDirectVideo(url: string) {
  return /\.(mp4|webm|mov)(\?|$)/i.test(url) || url.includes("cloudinary.com");
}

function toYtThumbnail(url: string): string | null {
  const m = url.match(/[?&]v=([^&]+)/) ?? url.match(/youtu\.be\/([^?&]+)/);
  if (m) return `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg`;
  return null;
}

type MediaItem = { type: "image"; src: string } | { type: "video"; src: string; thumb: string };

/**
 * Hero صفحة المنتج — تصميم e-commerce كلاسيكي عالي التحويل.
 *   - يمين (RTL): main media + thumbnails strip جانبي
 *   - يسار (RTL): معلومات + سعر + CTAs
 *   - الفيديو يظهر مباشرة في الـ main area بزر play مركزي
 */
export default function ProductHero({ product }: ProductHeroProps) {
  const [quantity, setQuantity] = useState(1);
  const [videoPlaying, setVideoPlaying] = useState(false);

  /** خيارات الهدية */
  const [giftEnabled, setGiftEnabled] = useState(false);
  const [giftOptions, setGiftOptions] = useState<GiftOptions>({});

  const addItem = useCart((s) => s.addItem);
  const addItemSilent = useCart((s) => s.addItemSilent);
  const router = useRouter();

  const embedUrl = product.videoUrl ? toEmbedUrl(product.videoUrl) : null;
  const directVideo = product.videoUrl ? isDirectVideo(product.videoUrl) : false;
  const ytThumb = product.videoUrl ? toYtThumbnail(product.videoUrl) : null;
  const videoThumb = ytThumb ?? product.mainImage ?? "";

  /** بناء قائمة الميديا — فيديو أولاً (إذا موجود) ثم الصور */
  const media: MediaItem[] = [];
  if (embedUrl) media.push({ type: "video", src: embedUrl, thumb: videoThumb });
  if (product.mainImage) media.push({ type: "image", src: product.mainImage });
  (product.gallery ?? []).forEach((src) => media.push({ type: "image", src }));

  const [activeIdx, setActiveIdx] = useState(0);
  const activeMedia = media[activeIdx];

  /** عند تغيير الميديا الفعّالة — أوقف الفيديو */
  function handleSelectMedia(idx: number) {
    setActiveIdx(idx);
    setVideoPlaying(false);
  }

  const effectiveGift = giftEnabled ? giftOptions : undefined;

  function handleBuyNow() {
    for (let i = 0; i < quantity; i++) addItemSilent(product, effectiveGift);
    router.push("/checkout");
  }
  function handleAddToCart() {
    for (let i = 0; i < quantity; i++) addItem(product, effectiveGift);
  }

  const savings = product.compareAtPrice ? product.compareAtPrice - product.price : null;
  const tagline = HERO_TAGLINES[product.slug] ?? null;

  const shippingLabel =
    product.shippingInfo?.notes ??
    (product.shippingInfo?.freeShipping
      ? "شحن مجاني لكل البلاد"
      : product.shippingInfo?.estimatedDays
      ? `التوصيل ${product.shippingInfo.estimatedDays}`
      : "شحن سريع لكل البلاد");

  return (
    <section
      className="relative overflow-hidden pt-4 pb-[72px] md:pt-6 md:pb-24"
      style={{
        background: "linear-gradient(160deg, white 0%, var(--rosepale) 60%, var(--cream) 100%)",
      }}
    >
      {/* توهّج فاخر خلف منطقة الصورة */}
      <div aria-hidden className="absolute pointer-events-none hidden md:block" style={{ width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle, rgba(242,167,181,0.30), transparent 70%)", top: 40, insetInlineEnd: "8%", filter: "blur(30px)" }} />

      <Container>
        {/* Breadcrumb */}
        <nav
          className="font-label text-[13px] md:text-[14px] flex items-center gap-1.5 mb-5"
          style={{ color: "var(--light)" }}
        >
          <Link href="/" className="hover:text-dark transition-colors">الرئيسية</Link>
          <span>›</span>
          <Link href="/shop" className="hover:text-dark transition-colors">المتجر</Link>
          <span>›</span>
          <span style={{ color: "var(--mid)" }}>{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 md:gap-10 items-start">

          {/* ═══════════════════════════════════════════════════════
              يمين (RTL): منطقة الميديا — thumbnails + main
              ═══════════════════════════════════════════════════════ */}
          <div className="md:sticky md:top-[88px] md:self-start">
            <div className="flex flex-col md:flex-row gap-3">

              {/* Thumbnails strip — أفقي تحت الفيديو على الموبايل، عمودي على الجنب على الديسكتوب */}
              {media.length > 1 && (
                <div
                  className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-y-auto order-2 md:order-1"
                  style={{ maxHeight: "min(78vh, 600px)", scrollbarWidth: "thin" }}
                >
                  {media.map((m, idx) => {
                    const isActive = idx === activeIdx;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectMedia(idx)}
                        className="relative shrink-0 rounded-[12px] overflow-hidden [transition:transform_180ms_ease,border-color_180ms_ease] hover:-translate-y-[1px]"
                        style={{
                          width: 72, height: 72,
                          border: isActive ? "2px solid var(--rose)" : "1.5px solid var(--bord)",
                          boxShadow: isActive ? "0 4px 12px rgba(242,167,181,0.30)" : "0 2px 6px rgba(0,0,0,0.04)",
                          background: "white",
                          cursor: "pointer",
                        }}
                      >
                        <ProductImagePlaceholder
                          src={m.type === "video" ? m.thumb : m.src}
                          alt=""
                          size="thumb"
                          objectFit="cover"
                        />
                        {/* play icon overlay على فيديو الـ thumbnail */}
                        {m.type === "video" && (
                          <span
                            className="absolute inset-0 flex items-center justify-center"
                            style={{ background: "rgba(0,0,0,0.30)" }}
                          >
                            <span
                              className="flex items-center justify-center"
                              style={{
                                width: 24, height: 24, borderRadius: "50%",
                                background: "var(--rose)",
                                color: "white",
                              }}
                            >
                              <PlayIcon size={10} />
                            </span>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Main media area — موبايل: عرض كامل / ديسكتوب: ارتفاع مقيّد */}
              <div
                className="relative rounded-[20px] overflow-hidden order-1 md:order-2 w-full md:w-auto aspect-[4/5] md:aspect-auto md:h-[min(72vh,640px)]"
                style={{
                  border: "1.5px solid var(--bord)",
                  boxShadow: "0 16px 48px rgba(0,0,0,0.08)",
                  background: "white",
                }}
              >
                {/* فيديو يشتغل */}
                {activeMedia?.type === "video" && videoPlaying ? (
                  directVideo ? (
                    <video
                      src={activeMedia.src}
                      className="w-full h-full"
                      controls
                      autoPlay
                      playsInline
                      style={{ objectFit: "cover", background: "#000" }}
                    />
                  ) : (
                    <iframe
                      src={activeMedia.src}
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      style={{ border: "none", width: "100%", height: "100%", display: "block" }}
                    />
                  )
                ) : activeMedia?.type === "video" ? (
                  /* فيديو موقوف — صورة + زر play مركزي */
                  <>
                    <ProductImagePlaceholder
                      src={activeMedia.thumb}
                      alt={product.title}
                      size="hero"
                      objectFit="cover"
                    />
                    <button
                      onClick={() => setVideoPlaying(true)}
                      className="absolute inset-0 flex items-center justify-center group"
                      style={{ background: "rgba(0,0,0,0.15)", cursor: "pointer" }}
                      aria-label="تشغيل الفيديو"
                    >
                      <span
                        className="flex items-center justify-center [transition:transform_220ms_cubic-bezier(0.23,1,0.32,1),box-shadow_220ms_ease] group-hover:scale-110"
                        style={{
                          width: 80, height: 80, borderRadius: "50%",
                          background: "var(--rose)",
                          color: "white",
                          boxShadow: "0 12px 32px rgba(0,0,0,0.30)",
                        }}
                      >
                        <PlayIcon size={28} />
                      </span>
                    </button>
                  </>
                ) : (
                  /* صورة عادية */
                  <ProductImagePlaceholder
                    src={activeMedia?.src ?? ""}
                    alt={product.title}
                    size="hero"
                    objectFit="cover"
                  />
                )}

              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════
              يسار (RTL): المعلومات + CTAs
              ═══════════════════════════════════════════════════════ */}
          <div>

            {/* gift tagline — يوجّه الزائر بأن هذا منتج هدية */}
            <p
              className="font-label font-bold text-[16px] md:text-[18px] mb-3"
              style={{
                color: "var(--rose)",
                letterSpacing: "1px",
              }}
            >
              🎁 هدية لا تُنسى لكل أم جديدة
            </p>

            {/* category — chip أنيق */}
            <div className="flex items-center gap-2 mb-3">
              <span
                className="inline-block w-1.5 h-1.5 rounded-full"
                style={{ background: "var(--teal)" }}
              />
              <span
                className="font-label font-bold text-[12px] uppercase"
                style={{ color: "var(--teal)", letterSpacing: "2px" }}
              >
                {product.category}
              </span>
            </div>

            {/* العنوان الرئيسي */}
            <h1
              className="font-heading font-bold mb-2"
              style={{
                fontSize: "clamp(28px, 3.4vw, 42px)",
                color: "var(--dark)",
                lineHeight: 1.15,
              }}
            >
              {tagline ?? product.title}
            </h1>

            {/* TODO: Social proof — يُضاف بعد بدء البيع
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-0.5" style={{ color: "#F5C518" }}>
                    {Array.from({ length: 5 }).map((_, i) => <StarIcon key={i} size={16} />)}
                  </div>
                  <span className="font-label text-[13px] font-semibold" style={{ color: "var(--mid)" }}>
                    127 أم اختارت Momzy
                  </span>
                </div>
            */}

            {/* subtitle */}
            {tagline && (
              <p
                className="font-heading mb-4"
                style={{
                  fontSize: "clamp(16px, 1.6vw, 20px)",
                  color: "var(--mid)",
                  fontStyle: "italic",
                  fontWeight: 500,
                }}
              >
                {product.title}
              </p>
            )}

            {/* الوصف القصير */}
            <p
              className="leading-[1.8] mb-4"
              style={{
                fontSize: "clamp(15px, 1.2vw, 17px)",
                color: "var(--mid)",
                fontFamily: "'Tajawal', sans-serif",
              }}
            >
              {product.description}
            </p>

            {/* بلوك السعر */}
            <div
              className="rounded-[18px] p-4 mb-4 flex items-center justify-between flex-wrap gap-3"
              style={{
                background: "white",
                border: "1.5px solid var(--bord)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
              }}
            >
              <div className="flex items-baseline gap-3 flex-wrap">
                <span
                  className="font-label font-extrabold"
                  dir="ltr"
                  style={{
                    fontSize: "clamp(32px, 3.6vw, 44px)",
                    color: "var(--teal)",
                    lineHeight: 1,
                  }}
                >
                  ₪{product.price}
                </span>
                {product.compareAtPrice && (
                  <span
                    className="font-label line-through"
                    dir="ltr"
                    style={{
                      fontSize: "clamp(18px, 1.6vw, 22px)",
                      color: "var(--light)",
                    }}
                  >
                    ₪{product.compareAtPrice}
                  </span>
                )}
              </div>
              {savings && savings > 0 && (
                <div
                  className="font-label font-bold text-[13px] px-3.5 py-2 rounded-full"
                  style={{
                    background: "var(--rose)",
                    color: "white",
                    boxShadow: "0 4px 12px rgba(242,167,181,0.45)",
                  }}
                >
                  وفّري ₪{savings}
                </div>
              )}
            </div>

            {/* خيارات الهدية */}
            <div className="mb-4">
              <GiftOptionsForm
                enabled={giftEnabled}
                onToggle={setGiftEnabled}
                value={giftOptions}
                onChange={setGiftOptions}
              />
            </div>

            {/* الكمية */}
            <div className="flex items-center gap-3 mb-4">
              <span className="font-label text-[13px] font-semibold" style={{ color: "var(--mid)" }}>
                الكمية:
              </span>
              <QuantityInput value={quantity} onChange={setQuantity} size="md" min={1} />
            </div>

            {/* Status bar — متوفر + توصيل */}
            <div
              className="flex items-center justify-between gap-3 mb-3 px-4 py-3 rounded-[14px]"
              style={{
                background: "white",
                border: "1px solid var(--bord)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
              }}
            >
              {/* متوفر الآن */}
              <div className="flex items-center gap-2">
                <span className="relative flex items-center justify-center" style={{ width: 10, height: 10 }}>
                  <span
                    className="absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ background: "#10B981", animation: "pulse-badge 2s infinite" }}
                  />
                  <span
                    className="relative inline-flex rounded-full"
                    style={{ width: 8, height: 8, background: "#10B981" }}
                  />
                </span>
                <span className="font-label font-bold text-[13px]" style={{ color: "var(--dark)" }}>
                  متوفر الآن
                </span>
              </div>

              {/* فاصل */}
              <span style={{ width: 1, height: 18, background: "var(--bord)" }} />

              {/* توصيل */}
              <div className="flex items-center gap-2">
                <TruckIcon />
                <span className="font-label font-semibold text-[13px]" style={{ color: "var(--mid)" }}>
                  توصيل حتى <span style={{ color: "var(--dark)", fontWeight: 700 }}>7 أيام</span>
                </span>
              </div>
            </div>

            {/* CTA الأساسي */}
            <button
              data-hero-cta
              onClick={handleBuyNow}
              className="w-full font-label font-bold mb-3 btn-wobble [transition:transform_200ms_cubic-bezier(0.23,1,0.32,1),box-shadow_200ms_ease] hover:-translate-y-[2px]"
              style={{
                fontSize: "clamp(17px, 1.4vw, 19px)",
                background: "var(--rose)",
                color: "var(--dark)",
                border: "none",
                borderRadius: 50,
                padding: "16px 26px",
                cursor: "pointer",
                boxShadow: "0 10px 28px rgba(242,167,181,0.55)",
              }}
            >
              اشتري الآن ←
            </button>

            {/* CTA ثانوي — مخفّف */}
            <button
              onClick={handleAddToCart}
              className="w-full font-label font-semibold text-[14px] mb-4 [transition:color_180ms_ease] hover:underline"
              style={{
                background: "transparent",
                color: "var(--mid)",
                border: "none",
                padding: "8px",
                cursor: "pointer",
              }}
            >
              أو أضيفي للسلة
            </button>

            {/* إشارات الثقة — موبايل: stacked عمودياً / ديسكتوب: صف أفقي */}
            <div
              className="rounded-[16px] overflow-hidden flex flex-col md:flex-row md:items-center md:justify-around md:py-4 md:px-3 md:gap-2"
              style={{
                background: "rgba(255,255,255,0.6)",
                border: "1px solid var(--bord)",
              }}
            >
              <TrustSignal icon="/icons/shipping-icon.png" label={shippingLabel} />
              <Divider />
              <TrustSignal icon="/icons/products-icon.png" label="مغلّف وجاهز كهدية" />
              <Divider />
              <TrustSignal icon="/icons/heart-icon.png" label="بطاقة إهداء مجانية" />
            </div>

          </div>
        </div>
      </Container>
    </section>
  );
}

/* ── المكونات الفرعية ────────────────────────────────────────── */

function TrustSignal({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 md:px-1 md:py-0">
      <span
        className="flex items-center justify-center shrink-0 md:bg-transparent md:w-auto md:h-auto md:rounded-none"
        style={{ width: 36, height: 36, borderRadius: 10, background: "var(--rosepale)" }}
      >
        <Image src={icon} alt="" width={20} height={20} className="object-contain" />
      </span>
      <span className="font-label text-[13px] md:text-[12px] leading-[1.35]" style={{ color: "var(--dark)" }}>
        {label}
      </span>
    </div>
  );
}

function Divider() {
  return (
    <span
      className="block w-full h-px md:w-px md:h-6"
      style={{ background: "var(--bord)" }}
    />
  );
}

function PlayIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7L8 5z" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function StarIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function MicroTrust({ icon, text }: { icon: string; text: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span style={{ fontSize: 13 }}>{icon}</span>
      <span className="font-label text-[12px] font-medium" style={{ color: "var(--mid)" }}>
        {text}
      </span>
    </span>
  );
}
