"use client";

import { useState } from "react";
import Container from "@/components/ui/Container";
import SectionLabel from "@/components/ui/SectionLabel";
import type { ProductFAQ as FAQ } from "@/lib/products/types";

interface ProductFAQProps {
  items: FAQ[];
}

/** قسم الأسئلة الشائعة — accordion يفتح سؤال واحد في كل مرة */
export default function ProductFAQ({ items }: ProductFAQProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section style={{ background: "var(--cream)", padding: "28px 0 clamp(80px, 10vw, 120px)" }}>
      <Container>
        <div className="mx-auto" style={{ maxWidth: 800 }}>
          <div className="mb-10 text-center">
            <SectionLabel color="teal" centered>أسئلة شائعة</SectionLabel>
            <h2
              className="text-h2 font-heading font-bold"
              style={{ color: "var(--dark)", lineHeight: 1.2 }}
            >
              كل اللي بتفكري <span style={{ color: "var(--rose)", fontStyle: "italic" }}>فيه</span>
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {items.map((faq, idx) => (
              <FAQItem
                key={idx}
                faq={faq}
                isOpen={openIdx === idx}
                onToggle={() => setOpenIdx(openIdx === idx ? null : idx)}
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

function FAQItem({
  faq,
  isOpen,
  onToggle,
}: {
  faq: FAQ;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="rounded-[16px] overflow-hidden [transition:background-color_200ms_ease,border-color_200ms_ease]"
      style={{
        background: isOpen ? "var(--rosepale)" : "white",
        border: isOpen
          ? "1.5px solid rgba(242,167,181,0.40)"
          : "1.5px solid rgba(242,167,181,0.10)",
      }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-right transition-colors"
        style={{ background: "transparent", border: "none", cursor: "pointer" }}
        aria-expanded={isOpen}
      >
        <span
          className="font-heading font-bold text-[16px] flex-1"
          style={{ color: "var(--dark)" }}
        >
          {faq.question}
        </span>
        <span
          className="flex items-center justify-center shrink-0 transition-transform"
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: isOpen ? "var(--rose)" : "var(--tealpale)",
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
