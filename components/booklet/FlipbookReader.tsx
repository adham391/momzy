"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, Maximize, Minimize, Volume2, VolumeX } from "lucide-react";
import HTMLFlipBook from "react-pageflip";
import NavButton from "@/components/ui/NavButton";

interface FlipbookReaderProps {
  /** توكن الشراء — تُبنى به روابط صفحات الـ API */
  token: string;
  /** عدد صفحات الكتيب */
  pages: number;
  /** نسبة عرض الصفحة لارتفاعها (width/height) */
  ratio: number;
  /** اسم الكتيب — يظهر في شريط القارئ */
  title: string;
}

/** واجهة التقليب التي يكشفها react-pageflip عبر ref */
interface PageFlipApi {
  flipNext: () => void;
  flipPrev: () => void;
}
interface FlipBookRef {
  pageFlip: () => PageFlipApi;
}

/* ── ثوابت القارئ ─────────────────────────────────────────── */
/** عرض الصفحة الأساسي — size="stretch" يكيّفه مع الحاوية */
const BASE_PAGE_WIDTH = 480;
/** حدود عرض الصفحة الواحدة عند التمدد */
const MIN_PAGE_WIDTH = 260;
const MAX_PAGE_WIDTH = 620;
/** هامش حاوية الكتاب حول الصفحتين المفتوحتين */
const BOOK_GUTTER = 40;
/** مدة أنيميشن التقليب (ms) */
const FLIP_DURATION_MS = 650;
/** مسافة السحب الدنيا لبدء تقليبة (px) */
const SWIPE_DISTANCE = 30;
/** شفافية ظل التقليب */
const SHADOW_OPACITY = 0.35;
/** عدد الصفحات المُحمَّلة فورًا عند الفتح */
const EAGER_PAGES = 3;
/** عدد الصفحات التالية المُجهَّزة مسبقًا مع كل تقليبة (فلا تظهر صفحة بيضاء أثناء الأنيميشن) */
const PREFETCH_AHEAD = 3;
/* صوت التقليب — طبقتان تحاكيان كتابًا حقيقيًا:
   ١) حفيف انزلاق الورقة (rustle) طوال الحركة
   ٢) «خبطة» خفيفة عند استقرار الورقة (flap) قرب نهاية القلبة */
/** طبقة الحفيف: المدة والذروة وترددا المرشح */
const RUSTLE_DURATION = 0.32;
const RUSTLE_PEAK = 0.16;
const RUSTLE_HIGHPASS_HZ = 700;
/** طبقة الخبطة: تبدأ قرب نهاية الحفيف — قصيرة وأغلظ وأعلى */
const FLAP_DELAY = 0.22;
const FLAP_DURATION = 0.06;
const FLAP_PEAK = 0.24;
const FLAP_LOWPASS_HZ = 1400;
/** مفتاح حفظ تفضيل الصوت في المتصفح */
const SOUND_PREF_KEY = "momzy-reader-sound";

/** ينشئ buffer ضجيج أبيض بمظروف تلاشٍ أُسّي — أساس صوتَي الورق */
function makeNoiseBuffer(ctx: AudioContext, duration: number, decayPower: number): AudioBuffer {
  const len = Math.floor(ctx.sampleRate * duration);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decayPower);
  }
  return buf;
}

/**
 * يعزف صوت تقليب ورقي مُولَّد (Web Audio) — لا ملفات صوتية ولا حقوق:
 * حفيف انزلاق (ضجيج مُرشَّح highpass بذبذبة سريعة تحاكي ارتجاف الورقة)
 * تعقبه خبطة استقرار غليظة قصيرة — معًا يشبهان قلب صفحة كتاب حقيقي.
 */
function playFlipSound(ctx: AudioContext, bufs: { current: { rustle: AudioBuffer; flap: AudioBuffer } | null }) {
  if (ctx.state === "suspended") void ctx.resume();
  bufs.current ??= {
    rustle: makeNoiseBuffer(ctx, RUSTLE_DURATION, 1.2),
    flap: makeNoiseBuffer(ctx, FLAP_DURATION, 0.8),
  };
  const t0 = ctx.currentTime;

  /* ── طبقة الحفيف ── */
  const rustleSrc = ctx.createBufferSource();
  rustleSrc.buffer = bufs.current.rustle;
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = RUSTLE_HIGHPASS_HZ;
  const rustleGain = ctx.createGain();
  rustleGain.gain.setValueAtTime(0.0001, t0);
  rustleGain.gain.exponentialRampToValueAtTime(RUSTLE_PEAK, t0 + 0.025);
  rustleGain.gain.exponentialRampToValueAtTime(0.04, t0 + FLAP_DELAY);
  rustleGain.gain.exponentialRampToValueAtTime(0.0001, t0 + RUSTLE_DURATION);
  // ارتجاف الورقة: تذبذب سريع خفيف في مستوى الحفيف — عمقه نسبة من الذروة
  const flutter = ctx.createOscillator();
  flutter.frequency.value = 28;
  const flutterDepth = ctx.createGain();
  flutterDepth.gain.value = RUSTLE_PEAK * 0.5;
  flutter.connect(flutterDepth);
  flutterDepth.connect(rustleGain.gain);
  rustleSrc.connect(hp);
  hp.connect(rustleGain);
  rustleGain.connect(ctx.destination);
  rustleSrc.start(t0);
  flutter.start(t0);
  flutter.stop(t0 + RUSTLE_DURATION);

  /* ── طبقة الخبطة (استقرار الورقة) ── */
  const flapSrc = ctx.createBufferSource();
  flapSrc.buffer = bufs.current.flap;
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = FLAP_LOWPASS_HZ;
  const flapGain = ctx.createGain();
  const tFlap = t0 + FLAP_DELAY;
  flapGain.gain.setValueAtTime(0.0001, tFlap);
  flapGain.gain.exponentialRampToValueAtTime(FLAP_PEAK, tFlap + 0.008);
  flapGain.gain.exponentialRampToValueAtTime(0.0001, tFlap + FLAP_DURATION);
  flapSrc.connect(lp);
  lp.connect(flapGain);
  flapGain.connect(ctx.destination);
  flapSrc.start(tFlap);
}

/**
 * قارئ flipbook للكتيب — عرض على الموقع فقط، بلا تحميل.
 * الكتيب عربي RTL والمكتبة LTR: نعرض الكتاب داخل حاوية معكوسة بالمرآة (scaleX(-1))
 * ونعكس كل صفحة داخليًا مرة أخرى — فيُحافَظ على اقتران الصفحات (الغلاف منفرد،
 * (2،3) معًا…) ويصير التقليب من اليسار لليمين كأي كتاب عربي، بلا عكس للترتيب.
 */
export default function FlipbookReader({ token, pages, ratio, title }: FlipbookReaderProps) {
  const t = useTranslations("reader");
  const tCommon = useTranslations("common");
  const bookRef = useRef<FlipBookRef | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);
  /** فهرس StPageFlip الحالي (بداية الفرشة المعروضة) — الترتيب طبيعي: 0 = الغلاف */
  const [flipIdx, setFlipIdx] = useState(0);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("landscape");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  /* صوت التقليب — التفضيل محفوظ في المتصفح، والافتراضي مفعّل */
  const [soundOn, setSoundOn] = useState(true);
  const soundOnRef = useRef(true); // مرآة للحالة — معالج StPageFlip يُربط مرة واحدة
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseBufsRef = useRef<{ rustle: AudioBuffer; flap: AudioBuffer } | null>(null);

  useEffect(() => {
    setMounted(true);
    const saved = window.localStorage.getItem(SOUND_PREF_KEY);
    if (saved === "off") {
      setSoundOn(false);
      soundOnRef.current = false;
    }
  }, []);

  /* تهيئة الصوت عند أول تفاعل مباشر — المتصفح يمنع بدء AudioContext خارج
     إيماءة مستخدم، وحدث التقليب يصل من أنيميشن لا من النقرة نفسها،
     فنجهّز السياق هنا لتكون القلبة الأولى مسموعة */
  useEffect(() => {
    const prime = () => {
      audioCtxRef.current ??= new AudioContext();
      if (audioCtxRef.current.state === "suspended") void audioCtxRef.current.resume();
    };
    window.addEventListener("pointerdown", prime);
    window.addEventListener("keydown", prime);
    return () => {
      window.removeEventListener("pointerdown", prime);
      window.removeEventListener("keydown", prime);
    };
  }, []);

  function toggleSound() {
    setSoundOn((v) => {
      const next = !v;
      soundOnRef.current = next;
      window.localStorage.setItem(SOUND_PREF_KEY, next ? "on" : "off");
      return next;
    });
  }

  /** يُستدعى عند بدء كل تقليبة (حالة "flipping") — لا عند اكتمالها */
  function onFlipStart() {
    if (!soundOnRef.current) return;
    audioCtxRef.current ??= new AudioContext();
    playFlipSound(audioCtxRef.current, noiseBufsRef);
  }

  /* تتبّع حالة ملء الشاشة (زر Esc يخرج منها خارج أزرارنا) */
  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  /* تجهيز الصفحات التالية مسبقًا — تكتمل قبل انتهاء أنيميشن التقليب */
  useEffect(() => {
    for (let p = flipIdx + 2; p <= Math.min(flipIdx + 1 + PREFETCH_AHEAD, pages); p++) {
      const img = new window.Image();
      img.src = `/api/booklet/${token}/${p}`;
    }
  }, [flipIdx, pages, token]);

  const canNext = flipIdx < pages - 1;
  const canPrev = flipIdx > 0;
  const readNext = () => bookRef.current?.pageFlip().flipNext();
  const readPrev = () => bookRef.current?.pageFlip().flipPrev();

  /* أسهم الكيبورد — الكتاب معكوس بصريًا (RTL): يسار = تقدّم بالقراءة */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") bookRef.current?.pageFlip().flipNext();
      if (e.key === "ArrowRight") bookRef.current?.pageFlip().flipPrev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function toggleFullscreen() {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void shellRef.current?.requestFullscreen?.();
  }

  /**
   * نص العدّاد: في العرض المزدوج الفرشة تعرض صفحتين — نعرض نطاقًا (مثل 2-3)،
   * وفي المفرد/الغلاف رقمًا واحدًا.
   */
  const spreadStart = flipIdx + 1;
  const spreadEnd =
    orientation === "landscape" && flipIdx > 0 && flipIdx + 1 < pages ? flipIdx + 2 : spreadStart;
  const pageLabel = spreadEnd > spreadStart ? `${spreadStart}-${spreadEnd}` : `${spreadStart}`;

  const pageH = Math.round(BASE_PAGE_WIDTH / ratio);

  /* children بهوية ثابتة — تغيّرها يجبر react-pageflip على إعادة استيراد كل الصفحات */
  const pageNodes = useMemo(
    () =>
      Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <div key={n} style={{ background: "white", overflow: "hidden" }}>
          {/* الصورة تُعكس مرة ثانية داخل الحاوية المعكوسة — فتظهر طبيعية */}
          <img
            src={`/api/booklet/${token}/${n}`}
            alt={t("pageAlt", { page: n })}
            draggable={false}
            loading={n <= EAGER_PAGES ? "eager" : "lazy"}
            decoding="async"
            onError={() => setLoadFailed(true)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              pointerEvents: "none",
              transform: "scaleX(-1)",
            }}
          />
        </div>
      )),
    // t مستقر ضمن نفس اللغة — الصفحات لا تتغيّر بعد التركيب
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pages, token]
  );

  return (
    <div
      ref={shellRef}
      className="select-none flex flex-col"
      style={{ background: "var(--cream)", minHeight: isFullscreen ? "100vh" : undefined }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* ── شريط القارئ ── */}
      <div
        className="flex items-center justify-between gap-3 flex-wrap"
        style={{ padding: "14px clamp(16px, 4vw, 32px)", borderBottom: "1.5px solid var(--bord)", background: "white" }}
      >
        <div className="font-heading font-bold text-dark text-[16px] md:text-[18px] truncate">📖 {title}</div>
        <div className="flex items-center gap-3">
          <span className="font-label text-[13px]" style={{ color: "var(--mid)" }} dir="auto">
            {t("pageOf", { page: pageLabel, total: pages })}
          </span>
          <button
            type="button"
            onClick={toggleSound}
            aria-label={soundOn ? t("muteSound") : t("unmuteSound")}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-tealpale"
            style={{ border: "1.5px solid var(--bord)", background: "white", color: soundOn ? "var(--teal)" : "var(--light)", cursor: "pointer" }}
          >
            {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? t("exitFullscreen") : t("fullscreen")}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-tealpale"
            style={{ border: "1.5px solid var(--bord)", background: "white", color: "var(--mid)", cursor: "pointer" }}
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
        </div>
      </div>

      {/* ── تنبيه تعذُّر تحميل صفحة ── */}
      {loadFailed && (
        <div
          className="text-center font-label text-[13px]"
          style={{ background: "var(--yellowlt)", color: "var(--mid)", padding: "10px 16px", borderBottom: "1px solid var(--bord)" }}
        >
          {t("loadError")}
        </div>
      )}

      {/* ── الكتاب — الحاوية معكوسة بالمرآة لتقليب RTL بدون كسر اقتران الصفحات ── */}
      <div className="flex-1 flex items-center justify-center" style={{ padding: "clamp(16px, 3vw, 40px)" }}>
        {mounted && (
          <div
            className="w-full"
            style={{ maxWidth: BASE_PAGE_WIDTH * 2 + BOOK_GUTTER, transform: "scaleX(-1)" }}
            dir="ltr"
          >
            <HTMLFlipBook
              ref={bookRef}
              width={BASE_PAGE_WIDTH}
              height={pageH}
              size="stretch"
              minWidth={MIN_PAGE_WIDTH}
              maxWidth={MAX_PAGE_WIDTH}
              minHeight={Math.round(MIN_PAGE_WIDTH / ratio)}
              maxHeight={Math.round(MAX_PAGE_WIDTH / ratio)}
              drawShadow
              maxShadowOpacity={SHADOW_OPACITY}
              flippingTime={FLIP_DURATION_MS}
              startPage={0}
              showCover
              usePortrait
              autoSize
              startZIndex={0}
              mobileScrollSupport={false}
              clickEventForward={false}
              useMouseEvents
              swipeDistance={SWIPE_DISTANCE}
              showPageCorners
              disableFlipByClick={false}
              renderOnlyPageLengthChange
              className=""
              style={{ margin: "0 auto" }}
              onFlip={(e: { data: number }) => setFlipIdx(e.data)}
              onChangeOrientation={(e: { data: "portrait" | "landscape" }) => setOrientation(e.data)}
              onChangeState={(e: { data: string }) => {
                if (e.data === "flipping") onFlipStart();
              }}
            >
              {pageNodes}
            </HTMLFlipBook>
          </div>
        )}
      </div>

      {/* ── أزرار التنقّل — dir ثابت LTR: «التالي» أول عنصر = يسار الكتاب (اتجاه القراءة العربية) ── */}
      <div className="flex items-center justify-center gap-4" style={{ paddingBottom: "clamp(20px, 4vw, 36px)" }} dir="ltr">
        <NavButton onClick={readNext} disabled={!canNext} label={tCommon("next")} icon={<ChevronLeft size={20} strokeWidth={2.5} />} size={44} />
        <span className="font-label text-[13px] tabular-nums" style={{ color: "var(--light)", minWidth: 72, textAlign: "center" }} dir="ltr">
          {pageLabel} / {pages}
        </span>
        <NavButton onClick={readPrev} disabled={!canPrev} label={tCommon("prev")} icon={<ChevronRight size={20} strokeWidth={2.5} />} size={44} />
      </div>
    </div>
  );
}
