"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Container from "@/components/ui/Container";
import SectionLabel from "@/components/ui/SectionLabel";
import type { ProductContent } from "@/lib/products/types";
import {
  Sparkles, MessageCircle, Flame,
  Baby, BookOpen, ClipboardList, Gift,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ProductContentsProps {
  items: ProductContent[];
}

/** عدد أسطر الوصف قبل الطيّ */
const CLAMP_LINES = 2;

/**
 * أيقونة احتياطية لكل عنصر — تُستخدم إذا لم تُرفع أيقونة من Sanity.
 * مرتّبة لتطابق محتويات صندوق مشوار أم بالترتيب:
 * شمعة · بذور · فوطة · مدوّنة · بطاقات تحديات · بطاقات دعم · كتيّب.
 */
const FALLBACK_ICONS: LucideIcon[] = [
  Flame, Gift, Baby,
  ClipboardList, Sparkles, MessageCircle, BookOpen,
];

/** ألوان الأيقونات تتناوب: rose → teal → yellow */
const ICON_COLORS = [
  { bg: "rgba(242,167,181,0.18)", border: "rgba(242,167,181,0.35)", color: "#F2A7B5" },
  { bg: "var(--tealpale)",        border: "rgba(130,201,196,0.40)", color: "#82C9C4" },
  { bg: "rgba(247,223,152,0.25)", border: "rgba(247,223,152,0.50)", color: "#C09420" },
];

/**
 * قسم محتويات المنتج — "كل قطعةٍ جمعناها لكِ".
 * كل بطاقة تعرض سطرين من الوصف مع زر «المزيد» يفتح نصّها كاملًا —
 * فتبقى الشبكة مرتّبة رغم تفصيل الأوصاف.
 */
export default function ProductContents({ items }: ProductContentsProps) {
  return (
    <section style={{ background: "var(--cream)", padding: "20px 0 clamp(68px, 6vw, 88px)" }}>
      <Container>
        <div className="mb-6 md:mb-12 text-center">
          <SectionLabel color="teal" centered>محتويات الصندوق</SectionLabel>
          <h2
            className="text-h2 font-heading font-bold"
            style={{ color: "var(--dark)", lineHeight: 1.2 }}
          >
            كل قطعةٍ جمعناها <span style={{ color: "var(--rose)", fontStyle: "italic" }}>لكِ</span>
          </h2>
        </div>

        {/* items-start: توسّع بطاقة لا يمدّ باقي بطاقات الصف */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5 items-start">
          {items.map((item, idx) => (
            <ContentCard key={item.name} item={item} idx={idx} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function ContentCard({ item, idx }: { item: ProductContent; idx: number }) {
  const FallbackIcon = FALLBACK_ICONS[idx] ?? Sparkles;
  const colorSet     = ICON_COLORS[idx % 3];

  const [open, setOpen] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const pRef = useRef<HTMLParagraphElement>(null);

  /** يُظهر زر «المزيد» فقط إذا كان الوصف يتجاوز أسطر الطيّ فعلاً */
  useEffect(() => {
    const el = pRef.current;
    if (el) setOverflows(el.scrollHeight > el.clientHeight + 2);
  }, []);

  return (
    <div
      className="rounded-[20px] overflow-hidden [transition:transform_250ms_cubic-bezier(0.23,1,0.32,1),box-shadow_250ms_ease] hover:shadow-[0_8px_28px_rgba(242,167,181,0.12)] hover:-translate-y-[3px]"
      style={{ background: "white", border: "1.5px solid rgba(242,167,181,0.15)" }}
    >
      {/* صورة المعاينة من Sanity — تظهر في أعلى البطاقة إذا رُفعت */}
      {item.image && (
        <div className="relative w-full" style={{ height: 130 }}>
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
          />
        </div>
      )}

      <div className="p-3.5 sm:p-5">
        {/* الأيقونة — صورة من Sanity أو Lucide احتياطي */}
        <div
          className="flex items-center justify-center mb-3"
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: colorSet.bg,
            border: `1px solid ${colorSet.border}`,
            overflow: "hidden",
          }}
        >
          {item.icon ? (
            <Image
              src={item.icon}
              alt={item.name}
              width={30}
              height={30}
              className="object-contain"
            />
          ) : (
            <FallbackIcon size={22} color={colorSet.color} strokeWidth={1.5} fill="none" />
          )}
        </div>

        {/* الاسم — يحجز سطرين دائمًا كي تتساوى ارتفاعات البطاقات المطويّة */}
        <h3
          className="font-heading font-bold mb-2"
          style={{
            fontSize: 17,
            color: "var(--dark)",
            lineHeight: 1.3,
            minHeight: "2.6em",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {item.name}
        </h3>

        <p
          ref={pRef}
          className="text-[14px] leading-[1.75]"
          style={{
            color: "var(--mid)",
            fontFamily: "'Tajawal', sans-serif",
            ...(open
              ? {}
              : {
                  display: "-webkit-box",
                  WebkitLineClamp: CLAMP_LINES,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }),
          }}
        >
          {item.description}
        </p>

        {/* زر المزيد/أقل — للبطاقة الواحدة فقط، وفقط إن كان النص يُقصّ */}
        {overflows && (
          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="mt-1.5 font-label font-bold text-[12.5px] active:scale-[0.97] [transition:transform_140ms_ease-out]"
            style={{ color: "var(--teal)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            {open ? "أقل ↑" : "المزيد ↓"}
          </button>
        )}
      </div>
    </div>
  );
}
