"use client";
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@/lib/i18n/navigation";
import Container from "@/components/ui/Container";
import SectionWave from "@/components/ui/SectionWave";
import { sanityImageAt, sanityImageSrcSet } from "@/lib/sanity/imageUrl";

/** شريحة إعلان واحدة — كل ما تحتاجه الواجهة، محسوبًا على الخادم */
export interface BannerSlide {
  key: string;
  /** لون الشريحة — يحدّد التدرّج ولون الشارة والزرّ */
  tone: "olive" | "teal" | "rose";
  eyebrow: string;
  title: string;
  /** سطر الشرح — `null` لشريحة يكفيها عنوانها (الشحن المجاني) */
  text: string | null;
  badge: string | null;
  price: string | null;
  oldPrice: string | null;
  image: string;
  /** صورة منتج تملأ عمودها، أم أيقونة تُعرض داخل دائرة (شريحة بلا منتج تصوّره) */
  imageKind: "photo" | "icon";
  href: string;
  cta: string;
}

interface Labels {
  previous: string;
  next: string;
  goTo: string;
}

/** المدّة قبل الانتقال للشريحة التالية */
const AUTOPLAY_MS = 6000;

/** عروض صورة الشريحة المطلوبة من Sanity — المتصفح يختار الأنسب لشاشته */
const IMAGE_WIDTHS = [240, 360, 520, 720] as const;

/**
 * ألوان كل نغمة — تدرّج الخلفية ولون الإبراز.
 *
 * لون الإبراز يحمل نصًّا صغيرًا (الـ eyebrow) وخلفيةَ زرٍّ بنصّ أبيض، فكلّ نغمة
 * تأخذ درجةً غامقة بما يكفي للقراءة لا الدرجة الفاتحة من الهوية.
 */
const TONES: Record<BannerSlide["tone"], { background: string; accent: string; badgeBg: string; ring: string }> = {
  // زيتي — مأخوذ من لون صندوق «مشوار أم» نفسه في صورته
  olive: {
    background: "linear-gradient(120deg, #EFF1E8 0%, #FDFAF5 100%)",
    accent: "#4C5A41",
    badgeBg: "rgba(76,90,65,0.13)",
    ring: "rgba(76,90,65,0.22)",
  },
  teal: {
    background: "linear-gradient(120deg, #EFF8F8 0%, #FDFAF5 100%)",
    accent: "var(--teal)",
    badgeBg: "rgba(130,201,196,0.20)",
    ring: "rgba(130,201,196,0.40)",
  },
  rose: {
    background: "linear-gradient(120deg, #FEF5F7 0%, #F8F4EE 100%)",
    accent: "#D9768A",
    badgeBg: "rgba(242,167,181,0.22)",
    ring: "rgba(242,167,181,0.48)",
  },
};

/**
 * بانر الإعلانات — شرائح تتبدّل تلقائيًا، بأسهم ونقاط وسحب بالإصبع.
 *
 * يتوقّف التبديل عند مرور المؤشّر أو التركيز بلوحة المفاتيح (كي لا يهرب
 * الإعلان من القارئة)، ويتوقّف تمامًا لمن تطلب تقليل الحركة في نظامها.
 * شريحة واحدة ⇒ بلا أسهم ولا نقاط ولا تبديل.
 */
export default function LaunchBannerCarousel({ slides, labels }: { slides: BannerSlide[]; labels: Labels }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const count = slides.length;

  const goTo = useCallback((next: number) => setIndex(((next % count) + count) % count), [count]);

  /* التبديل التلقائي — يتوقّف عند التوقّف المؤقّت أو مع تفضيل تقليل الحركة */
  useEffect(() => {
    if (count < 2 || paused) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [count, paused]);

  /* السحب بالإصبع — أقصر مسافة تُعدّ سحبًا لا لمسة */
  const SWIPE_MIN = 45;
  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    const start = touchStartX.current;
    touchStartX.current = null;
    if (start === null) return;
    const delta = e.changedTouches[0].clientX - start;
    if (Math.abs(delta) < SWIPE_MIN) return;
    // RTL: السحب لليمين يعني «السابق» بصريًّا، وللشمال «التالي»
    goTo(index + (delta > 0 ? -1 : 1));
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label={labels.goTo}
      className="relative reveal-section"
      /*
       * التوقّف عند المرور بالفأرة وحدها: اللمس يُطلق «دخول المؤشّر» بلا
       * «خروج» يقابله، فكانت أول لمسة على الهاتف توقف التبديل إلى الأبد.
       */
      onPointerEnter={(e) => e.pointerType === "mouse" && setPaused(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{ marginTop: -60, zIndex: 2 }}
    >
      {/* موجة أعلى البانر — تغطّي نهاية الهيرو كبقية الأقسام */}
      <SectionWave fill="#F8F4EE" />

      {/* الخلفية على الـ div لا على الـ section (نمط الأقسام) — وهامش سفلي تنزل عليه موجة القسم التالي */}
      <div style={{ background: "#F8F4EE", marginTop: -1, paddingTop: 14, paddingBottom: 72 }}>
        <Container>
          <div className="relative grid rounded-[22px] overflow-hidden" style={{ border: "1.5px solid var(--bord)" }}>

            {/*
              الشرائح كلّها في خانة الشبكة نفسها: الارتفاع يصير ارتفاع أطولها فلا
              يقفز البانر مع التبديل (شريحة بسطرين وأخرى بسطر، وبكل لغة طول آخر).
              الظاهرة وحدها في شجرة الوصول وتحت المؤشّر (`inert` يخرج الباقي).
            */}
            {slides.map((slide, i) => (
              <div
                key={slide.key}
                className="col-start-1 row-start-1 [transition:opacity_320ms_ease]"
                style={{ opacity: i === index ? 1 : 0, pointerEvents: i === index ? undefined : "none" }}
                aria-hidden={i !== index}
                inert={i !== index}
              >
                <Slide slide={slide} />
              </div>
            ))}

            {/* الأسهم — بلا معنى لشريحة واحدة */}
            {count > 1 && (
              <>
                <Arrow side="start" label={labels.previous} onClick={() => goTo(index - 1)} />
                <Arrow side="end" label={labels.next} onClick={() => goTo(index + 1)} />
              </>
            )}
          </div>

          {/* النقاط */}
          {count > 1 && (
            <div className="flex items-center justify-center gap-2 mt-2.5">
              {slides.map((slide, i) => (
                <button
                  key={slide.key}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`${labels.goTo} ${i + 1}`}
                  aria-current={i === index}
                  className="rounded-full [transition:width_220ms_ease,background-color_220ms_ease]"
                  style={{
                    width: i === index ? 22 : 8,
                    height: 8,
                    background: i === index ? "var(--rose)" : "var(--bord)",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                />
              ))}
            </div>
          )}
        </Container>
      </div>
    </section>
  );
}

/** شريحة واحدة — نصّ على جانب وصورة على الآخر */
function Slide({ slide }: { slide: BannerSlide }) {
  const tone = TONES[slide.tone];

  return (
    <Link
      href={slide.href}
      /* ارتفاع أدنى موحّد — شريحة الشحن بلا سعر، فبدونه يقفز البانر مع كل تبديل */
      className="group flex flex-row-reverse items-stretch min-h-[172px] sm:min-h-[196px] md:min-h-[214px]"
      style={{ background: tone.background }}
    >
      {/*
        الصورة — كاملة بلا قصّ (contain): صور المنتجات مربّعة والشريحة عريضة،
        فالقصّ كان يبتر الصندوق. الخلفية شفّافة كي يظهر تدرّج الشريحة حولها.
        وهي مطلقة داخل عمودها: صورة عادية بـ h-full تفرد ارتفاعها الأصلي فيطول البانر.
      */}
      <div className="relative w-[38%] sm:w-[34%] md:w-[30%] shrink-0 min-h-[150px] md:min-h-[190px]">
        {slide.imageKind === "icon" ? (
          /* أيقونة داخل دائرة — لشريحة لا تصوّر منتجًا (الشحن مثلًا) */
          <span className="absolute inset-0 flex items-center justify-center">
            <span
              className="flex items-center justify-center rounded-full h-[74%] aspect-square max-w-[86%]"
              style={{
                background: "rgba(255,255,255,0.78)",
                border: `1.5px solid ${tone.ring}`,
                boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
              }}
            >
              <img src={slide.image} alt="" className="w-[58%] h-[58%] object-contain" loading="lazy" decoding="async" />
            </span>
          </span>
        ) : (
          <img
            src={sanityImageAt(slide.image, IMAGE_WIDTHS[1])}
            srcSet={sanityImageSrcSet(slide.image, IMAGE_WIDTHS)}
            sizes="(max-width: 768px) 38vw, 320px"
            alt={slide.title}
            className="absolute inset-0 w-full h-full object-contain object-center p-2.5 sm:p-3 md:p-4"
            loading="lazy"
            decoding="async"
          />
        )}
      </div>

      {/* النصّ */}
      <div className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-1.5">
          <span
            className="font-label font-bold text-[10.5px] md:text-[11.5px] uppercase"
            style={{ color: tone.accent, letterSpacing: "2px" }}
          >
            {slide.eyebrow}
          </span>
          {slide.badge && (
            <span
              className="font-label font-extrabold text-[11px] rounded-full px-2.5 py-0.5"
              style={{ background: tone.badgeBg, color: tone.accent }}
            >
              {slide.badge}
            </span>
          )}
        </div>

        <h2 className="font-heading font-bold text-dark leading-tight mb-1.5" style={{ fontSize: "clamp(18px, 2.6vw, 30px)" }}>
          {slide.title}
        </h2>

        {slide.text && (
          <p className="text-mid leading-[1.65] mb-3 line-clamp-2" style={{ fontSize: "clamp(12.5px, 1.4vw, 15px)" }}>
            {slide.text}
          </p>
        )}

        <div className="flex items-center gap-3 flex-wrap">
          {slide.price && (
            <span className="flex items-baseline gap-2">
              <span className="font-label font-extrabold" style={{ color: tone.accent, fontSize: "clamp(20px, 2.4vw, 28px)" }}>
                {slide.price}
              </span>
              {slide.oldPrice && (
                <span className="font-label text-light line-through" style={{ fontSize: "clamp(12px, 1.3vw, 15px)" }}>
                  {slide.oldPrice}
                </span>
              )}
            </span>
          )}

          <span
            className="inline-flex items-center font-label font-bold text-white rounded-full px-4 py-2 text-[13px] md:text-[14px] [transition:transform_200ms_ease] group-hover:scale-[1.03]"
            style={{ background: tone.accent }}
          >
            {slide.cta}
          </span>
        </div>
      </div>
    </Link>
  );
}

/** سهم تنقّل — نصف شفّاف فوق الشريحة */
function Arrow({ side, label, onClick }: { side: "start" | "end"; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`absolute top-1/2 -translate-y-1/2 ${side === "start" ? "start-2" : "end-2"} w-9 h-9 rounded-full hidden sm:flex items-center justify-center [transition:background-color_200ms_ease]`}
      style={{
        background: "rgba(255,255,255,0.86)",
        border: "1px solid var(--bord)",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        cursor: "pointer",
        color: "var(--dark)",
      }}
    >
      {/* المثلث يشير لجهة الحركة — والاتجاه يتبع RTL تلقائيًا عبر start/end */}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: side === "start" ? "rotate(180deg)" : undefined }}>
        <path d="M9 18l6-6-6-6" />
      </svg>
    </button>
  );
}
