"use client";

import { useState } from "react";

/** سؤال وجواب — يطابق ProductFAQ و ServiceFAQ بنيويًا */
export interface FAQEntry {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQEntry[];
  /** لون التمييز عند الفتح — لون الخدمة/المنتج */
  accent?: string;
  /** خلفية العنصر المفتوح */
  openBg?: string;
}

/**
 * قائمة أسئلة قابلة للطي — سؤال واحد مفتوح في كل مرة.
 * مكوّن مشترك بين صفحة المنتج وصفحة الورشة (لا تكرار للأكورديون).
 * لا يحوي عنوان قسم ولا خلفية — كل صفحة تغلّفه بقسمها الخاص.
 */
export default function FAQAccordion({
  items,
  accent = "var(--rose)",
  openBg = "var(--rosepale)",
}: FAQAccordionProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="flex flex-col gap-3">
      {items.map((faq, idx) => (
        <FAQItem
          key={idx}
          faq={faq}
          accent={accent}
          openBg={openBg}
          isOpen={openIdx === idx}
          onToggle={() => setOpenIdx(openIdx === idx ? null : idx)}
        />
      ))}
    </div>
  );
}

function FAQItem({
  faq,
  isOpen,
  onToggle,
  accent,
  openBg,
}: {
  faq: FAQEntry;
  isOpen: boolean;
  onToggle: () => void;
  accent: string;
  openBg: string;
}) {
  return (
    <div
      className="rounded-[16px] overflow-hidden [transition:background-color_200ms_ease,border-color_200ms_ease]"
      style={{
        background: isOpen ? openBg : "white",
        border: isOpen ? `1.5px solid ${accent}` : "1.5px solid var(--bord)",
      }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-start transition-colors"
        style={{ background: "transparent", border: "none", cursor: "pointer" }}
        aria-expanded={isOpen}
      >
        <span className="font-heading font-bold text-[16px] flex-1" style={{ color: "var(--dark)" }}>
          {faq.question}
        </span>
        <span
          className="flex items-center justify-center shrink-0 [transition:transform_200ms_ease,background-color_200ms_ease]"
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: isOpen ? accent : "var(--tealpale)",
            color: isOpen ? "white" : "var(--teal)",
            fontSize: 14,
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          ▾
        </span>
      </button>

      {isOpen && (
        <div
          className="px-6 pb-5 pt-0"
          style={{
            color: "var(--mid)",
            fontFamily: "'Tajawal', sans-serif",
            fontSize: 14,
            lineHeight: 1.85,
          }}
        >
          {faq.answer}
        </div>
      )}
    </div>
  );
}
