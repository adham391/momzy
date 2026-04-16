"use client";

import { useEffect } from "react";

/** عتبة الظهور للـ fadeInUp */
const REVEAL_THRESHOLD = 0.08;

/** مدة أنيميشن الظهور */
const DURATION = "0.65s";

/** مقدار الإزاحة الابتدائية للأسفل */
const OFFSET = "40px";

/** تشغيل أو إيقاف النقاط المتحركة داخل قسم معين */
function setDotsPlayState(section: Element, state: "running" | "paused") {
  section.querySelectorAll<HTMLElement>(".animate-ping").forEach((dot) => {
    dot.style.animationPlayState = state;
  });
}

/**
 * SectionsReveal — مكوّن client بدون واجهة، يتولى:
 *
 * 1. fadeInUp — كل .reveal-section يظهر بأنيميشن عند الدخول للـ viewport
 * 2. dots optimization — النقاط تعمل فقط عند ظهور قسمها، وتتوقف عند الخروج
 *
 * النتيجة: بدلاً من 108 أنيميشن متزامن → عادةً 18 فقط (قسم واحد في الـ viewport)
 */
export default function SectionsReveal() {
  useEffect(() => {
    // احترام prefers-reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // ── 1. fadeInUp للأقسام الخمسة ──────────────────────────────
    const revealSections = document.querySelectorAll<HTMLElement>(".reveal-section");

    revealSections.forEach((el) => {
      el.style.opacity    = "0";
      el.style.transform  = `translateY(${OFFSET})`;
      el.style.transition = `opacity ${DURATION} ease, transform ${DURATION} ease`;
    });

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          el.style.opacity   = "1";
          el.style.transform = "translateY(0)";
          revealObserver.unobserve(el); // مرة واحدة فقط
        });
      },
      { threshold: REVEAL_THRESHOLD }
    );

    revealSections.forEach((el) => revealObserver.observe(el));

    // ── 2. إيقاف/تشغيل النقاط حسب الـ viewport ──────────────────
    // rootMargin سالب → المنطقة النشطة هي وسط الشاشة فقط (50%)
    // النتيجة: قسم واحد فقط يعمل في أي وقت
    const dotsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setDotsPlayState(
            entry.target,
            entry.isIntersecting ? "running" : "paused"
          );
        });
      },
      { threshold: 0, rootMargin: "-25% 0px -25% 0px" }
    );

    // راقب فقط الأقسام التي تحتوي على نقاط
    document.querySelectorAll<Element>("section").forEach((section) => {
      if (section.querySelector(".animate-ping")) {
        dotsObserver.observe(section);
      }
    });

    return () => {
      revealObserver.disconnect();
      dotsObserver.disconnect();
    };
  }, []);

  // لا يرندر أي DOM
  return null;
}
