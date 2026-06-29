"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

/** كارد قيمة داخل الـ modal */
function ValueCard({
  icon,
  bg,
  title,
  desc,
}: {
  icon: string;
  bg: string;
  title: string;
  desc: string;
}) {
  return (
    <div
      className="rounded-[14px] p-4"
      style={{ background: "var(--offwh)", border: "1.5px solid var(--bord)" }}
    >
      <div
        style={{
          width: 40, height: 40, borderRadius: 10,
          background: bg,
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 10,
        }}
      >
        <Image src={icon} alt={title} width={24} height={24} className="object-contain" />
      </div>
      <p className="font-heading font-bold text-[14px] mb-1" style={{ color: "var(--dark)" }}>{title}</p>
      <p className="text-[12px] leading-[1.7]" style={{ color: "var(--mid)", fontFamily: "'Tajawal', sans-serif" }}>{desc}</p>
    </div>
  );
}

/** بيانات كاردات القيم */
const VALUE_CARDS = [
  { icon: "/icons/services-icon.png", bg: "var(--rosepale)",  title: "المعرفة المهنية",       desc: "خدمات متخصصة مبنية على خبرة حقيقية" },
  { icon: "/icons/products-icon.png", bg: "var(--tealpale)",  title: "منتجات مختارة بعناية", desc: "محتوى ومنتجات على أساس علمي موثوق" },
  { icon: "/icons/blog-icon.png",     bg: "var(--yellowlt)",  title: "المجتمع الداعم",       desc: "مساحة آمنة تجمع الأمهات" },
  { icon: "/icons/heart-icon.png",    bg: "var(--rosepale)",  title: "الطفل في المركز",      desc: "دعم الأم يؤثر على نمو طفلها" },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

/** Modal قصة Momzy — يُفتح من الهيرو */
export default function MomzyStoryModal({ open, onClose }: Props) {
  /** mounted: هل المكوّن في الـ DOM | visible: هل الـ animation في حالة ظهور */
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      // mount أولاً ثم frame واحد لتشغيل الـ enter transition
      setMounted(true);
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    } else {
      // تشغيل exit animation ثم unmount بعد انتهائها
      setVisible(false);
      const timer = setTimeout(() => setMounted(false), 200);
      return () => clearTimeout(timer);
    }
  }, [open]);

  /** إغلاق بـ Escape */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  /** منع التمرير على الـ body عند الفتح */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 9999, padding: "16px" }}
      dir="rtl"
    >
      {/* الستارة — enter 220ms / exit 160ms */}
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(37,34,32,0.6)",
          backdropFilter: "blur(4px)",
          opacity: visible ? 1 : 0,
          transition: visible ? "opacity 220ms ease-out" : "opacity 160ms ease-in",
        }}
        onClick={onClose}
      />

      {/* نافذة الـ modal — enter 280ms ease-out / exit 180ms ease-in */}
      <div
        className="relative w-full rounded-[24px] overflow-y-auto"
        style={{
          maxWidth: 680,
          maxHeight: "90vh",
          background: "white",
          boxShadow: "0 32px 80px rgba(0,0,0,0.22)",
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(0.95)",
          transition: visible
            ? "opacity 280ms cubic-bezier(0.23, 1, 0.32, 1), transform 280ms cubic-bezier(0.23, 1, 0.32, 1)"
            : "opacity 180ms ease-in, transform 180ms ease-in",
        }}
      >
        {/* ── هيدر الـ modal ── */}
        <div
          className="sticky top-0 flex items-center justify-between px-7 py-5"
          style={{
            background: "linear-gradient(135deg, #FFF5F7 0%, #FEF0F5 50%, #EFF8F8 100%)",
            borderBottom: "1.5px solid var(--bord)",
            zIndex: 2,
          }}
        >
          <div>
            <p
              className="font-label font-bold text-[11px] mb-1"
              style={{ color: "var(--teal)", letterSpacing: "2.5px", textTransform: "uppercase" }}
            >
              قصتنا
            </p>
            <h2 className="font-heading font-bold text-[22px]" style={{ color: "var(--dark)" }}>
              قصة <span style={{ color: "var(--rose)" }}>Momzy</span>
            </h2>
          </div>
          {/* زر إغلاق */}
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
            style={{ color: "var(--mid)", fontSize: 18, background: "var(--bord)" }}
            aria-label="إغلاق"
          >
            ✕
          </button>
        </div>

        {/* ── المحتوى ── */}
        <div className="px-7 py-8">

          {/* نص القصة */}
          <p
            className="text-[15px] leading-[1.9] mb-3"
            style={{ color: "var(--mid)", fontFamily: "'Tajawal', sans-serif" }}
          >
            Momzy مؤسسة متخصصة ترافق الأمهات منذ فترة الحمل وحتى السنوات الأولى من حياة الطفل، مع تركيز خاص على مرحلة ما بعد الولادة ورعاية الأطفال حديثي الولادة.
          </p>
          <p
            className="text-[15px] leading-[1.9] mb-6"
            style={{ color: "var(--mid)", fontFamily: "'Tajawal', sans-serif" }}
          >
            تقوم Momzy على رؤية تؤمن أن دعم الأم في هذه المرحلة المبكرة لا ينعكس عليها فقط، بل يؤثر بشكل عميق على بداية حياة الطفل ونموه.
          </p>

          {/* اقتباس */}
          <blockquote
            className="mb-7"
            style={{ borderRight: "3px solid var(--rose)", paddingRight: 18 }}
          >
            <p
              className="font-heading italic text-[15px] leading-[1.9]"
              style={{ color: "var(--mid)", fontFamily: "'Amiri', serif" }}
            >
              "في Momzy نؤمن أن بداية الأمومة لحظة مفصلية في حياة كل عائلة — لحظة تتشكل فيها تجربة الأم، وتبدأ فيها قصة حياة طفل جديد."
            </p>
          </blockquote>

          {/* القيم الأربع */}
          <p
            className="font-label font-bold text-[11px] mb-4"
            style={{ color: "var(--rose)", letterSpacing: "2.5px", textTransform: "uppercase" }}
          >
            قيمنا
          </p>
          <div className="grid grid-cols-2 gap-3 mb-7">
            {VALUE_CARDS.map((card) => (
              <ValueCard key={card.title} {...card} />
            ))}
          </div>

          {/* زر إغلاق سفلي */}
          <button
            onClick={onClose}
            className="w-full font-label font-bold text-[14px] py-3 rounded-full transition-opacity hover:opacity-85"
            style={{ background: "var(--rose)", color: "white" }}
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
