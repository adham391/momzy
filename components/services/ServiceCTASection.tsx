"use client";

import React, { useState } from "react";
import { Link } from "@/lib/i18n/navigation";
import Container from "@/components/ui/Container";
import SectionWave from "@/components/ui/SectionWave";
import SectionLabel from "@/components/ui/SectionLabel";
import PolkaDots from "@/components/ui/PolkaDots";
import BookingModal from "./BookingModal";
import type { ServiceColor } from "@/lib/services/types";
import type { AgeGate } from "@/lib/utils/age";

/** خريطة الألوان حسب لون الكارد */
const COLOR_SCHEME: Record<ServiceColor, {
  bg: string;
  wave: string;
  btnBg: string;
  btnColor: string;
  btnShadow: string;
  waBorder: string;
  waColor: string;
}> = {
  rose: {
    bg:        "var(--rosepale)",
    wave:      "var(--rosepale)",
    btnBg:     "var(--rose)",
    btnColor:  "white",
    btnShadow: "0 6px 20px rgba(242,167,181,0.45)",
    waBorder:  "var(--teal)",
    waColor:   "var(--teal)",
  },
  teal: {
    bg:        "var(--tealpale)",
    wave:      "var(--tealpale)",
    btnBg:     "var(--teal)",
    btnColor:  "white",
    btnShadow: "0 6px 20px rgba(130,201,196,0.45)",
    waBorder:  "var(--rose)",
    waColor:   "var(--rose)",
  },
  yellow: {
    bg:        "var(--yellowlt)",
    wave:      "var(--yellowlt)",
    btnBg:     "var(--yellow)",
    btnColor:  "var(--dark)",
    btnShadow: "0 6px 20px rgba(247,223,152,0.55)",
    waBorder:  "var(--teal)",
    waColor:   "var(--teal)",
  },
  mint: {
    bg:        "var(--tealpale)",
    wave:      "var(--tealpale)",
    btnBg:     "var(--mint)",
    btnColor:  "var(--dark)",
    btnShadow: "0 6px 20px rgba(168,216,213,0.45)",
    waBorder:  "var(--rose)",
    waColor:   "var(--rose)",
  },
};

interface ServiceCTASectionProps {
  serviceTitle: string;
  serviceSlug?: string;
  color?: ServiceColor;
  heading?: React.ReactNode;
  subheading?: string;
  whatsappNumber?: string;
  /** الفئة العمرية للورشة — تُمرَّر لنموذج التسجيل */
  ageGate?: AgeGate;
  /** ترتيب التداخل — يزداد مع عدد الأقسام قبله في الصفحة */
  zIndex?: number;
}

/**
 * قسم CTA النهائي — خلفية rosepale→yellowlt
 * أيقونة + SectionLabel + عنوان + أزرار + trust badge
 */
export default function ServiceCTASection({
  serviceTitle,
  serviceSlug,
  color = "rose",
  heading = "جاهزة للخطوة التالية؟",
  subheading = "سجّلي مكانك الآن — مقعدكِ يُحجز فورًا، ويصلكِ التأكيد على بريدكِ.",
  whatsappNumber,
  ageGate,
  zIndex = 5,
}: ServiceCTASectionProps) {
  const [open, setOpen] = useState(false);
  const c = COLOR_SCHEME[color];

  const waMessage = encodeURIComponent(`مرحباً، أرغب بحجز "${serviceTitle}"`);
  const waLink    = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${waMessage}`
    : null;

  return (
    <>
      <section
        className="relative overflow-hidden"
        style={{ marginTop: -60, zIndex }}
      >
        <SectionWave fill={c.wave} />

        <div
          className="relative overflow-hidden"
          style={{
            background: c.bg,
            marginTop: -2,
            padding: "8px 0 0",
          }}
        >
          {/* ── نقاط متحركة — مثل الصفحة الرئيسية ── */}
          <PolkaDots colors={["#F2A7B5", "#82C9C4", "#F7DF98", "#A8D8D5"]} opacity={0.12} count={10} duration="5s" />

          <Container>
            <div className="text-center relative z-10" style={{ maxWidth: 620, margin: "0 auto" }}>

              {/* Scarcity badge — تصميم احترافي */}
              <div
                className="inline-flex items-center gap-2.5 mb-5 ps-1.5 pe-4 py-1.5 rounded-full"
                style={{
                  background: "white",
                  border: "1px solid var(--bord)",
                  boxShadow: "0 6px 20px rgba(242,167,181,0.18)",
                }}
              >
                <span
                  className="flex items-center justify-center"
                  style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: "linear-gradient(135deg, var(--rose) 0%, #DC8A9E 100%)",
                    color: "white",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </span>
                <span className="font-label font-bold text-[12px] md:text-[13px]" style={{ color: "var(--dark)", letterSpacing: "0.3px" }}>
                  المواعيد محدودة — <span style={{ color: "var(--teal)" }}>احجزي مكانك مبكراً</span>
                </span>
              </div>

              {/* العنوان — لون أساسي بني دافئ (DNA البراند) */}
              <h2
                className="font-heading font-bold mb-3"
                style={{
                  fontSize: "clamp(28px, 3.6vw, 42px)",
                  color: "#3D2C24",
                  lineHeight: 1.2,
                }}
              >
                {heading}
              </h2>

              {/* النص الفرعي */}
              <p
                className="mb-7"
                style={{
                  fontSize: "clamp(15px, 1.3vw, 17px)",
                  color: "var(--mid)",
                  fontFamily: "'Tajawal', sans-serif",
                  lineHeight: 1.85,
                }}
              >
                {subheading}
              </p>

              {/* CTA رئيسي — تيل (لون البراند، يتباين مع خلفية الوردي) */}
              <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center justify-center gap-2 font-label font-extrabold mb-4 [transition:transform_220ms_cubic-bezier(0.23,1,0.32,1),box-shadow_220ms_ease] hover:-translate-y-[3px] hover:shadow-[0_18px_44px_rgba(130,201,196,0.55)]"
                style={{
                  fontSize: "clamp(17px, 1.5vw, 20px)",
                  background: "linear-gradient(135deg, var(--teal) 0%, #6BB5B0 100%)",
                  color: "var(--dark)",
                  border: "none",
                  borderRadius: 50,
                  padding: "20px 48px",
                  cursor: "pointer",
                  boxShadow: "0 12px 32px rgba(130,201,196,0.45)",
                  minWidth: 240,
                }}
              >
                <span>سجّلي الآن</span>
                <span style={{ fontSize: "1.2em" }}>←</span>
              </button>

              {/* WhatsApp — أبرز قليلاً */}
              {waLink && (
                <div className="mb-5">
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-label font-bold text-[14px] md:text-[15px] [transition:transform_200ms_ease,background-color_200ms_ease] hover:-translate-y-[2px]"
                    style={{
                      background: "white",
                      color: "#25D366",
                      border: "2px solid #25D366",
                      borderRadius: 50,
                      padding: "12px 28px",
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
                    </svg>
                    أو تحدّثي معي على واتساب
                  </a>
                </div>
              )}

              {/* رابط صفحة التواصل — مخفّف جداً */}
              <div className="mb-2">
                <Link
                  href="/contact"
                  className="font-label text-[13px] [transition:color_180ms_ease] hover:underline"
                  style={{ color: "var(--light)" }}
                >
                  تفضّلين نموذج تواصل؟ ←
                </Link>
              </div>

              {/* Trust line */}
              <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
                <TrustLine icon="🔒" text="معلوماتك محمية" />
                <span style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(37,34,32,0.25)" }} />
                <TrustLine icon="💬" text="استشارة بدون التزام" />
                <span style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(37,34,32,0.25)" }} />
                <TrustLine icon="✓" text="ممرضة معتمدة" />
              </div>

            </div>
          </Container>

          {/* ── wave أسفل القسم — نفس شكل الـ wave العلوي ── */}
          <svg
            viewBox="0 0 1440 60"
            preserveAspectRatio="none"
            style={{ display: "block", width: "100%", height: 60, marginTop: 0 }}
            aria-hidden="true"
          >
            <path
              d="M0,20 C240,60 480,0 720,30 C960,60 1200,0 1440,20 L1440,60 L0,60 Z"
              fill="var(--offwh)"
            />
          </svg>
        </div>
      </section>

      <BookingModal
        open={open}
        onClose={() => setOpen(false)}
        serviceTitle={serviceTitle}
        serviceSlug={serviceSlug}
        ageGate={ageGate}
      />
    </>
  );
}

function TrustLine({ icon, text }: { icon: string; text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span style={{ fontSize: 13 }}>{icon}</span>
      <span className="font-label font-semibold text-[12px]" style={{ color: "var(--mid)" }}>
        {text}
      </span>
    </span>
  );
}
