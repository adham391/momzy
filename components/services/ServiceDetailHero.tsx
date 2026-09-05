"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import Image from "next/image";
import Container from "@/components/ui/Container";
import ServiceMeta from "./ServiceMeta";
import BookingModal from "./BookingModal";
import CTAAction from "./CTAAction";
import { serviceContactTarget } from "@/lib/services/contactLink";
import type { Service } from "@/lib/services/types";

interface ServiceDetailHeroProps {
  service: Service;
  /** رقم واتساب هبة — للـ deep link */
  whatsappNumber?: string;
}

/**
 * Hero صفحة تفاصيل الخدمة — palette موحّد عبر كل الموقع
 *   - خلفية: gradient وردي → تيل (نفس باقي الصفحات)
 *   - accent أساسي: تيل (CTA) + وردي (تفاصيل)
 *   - نصوص: بني دافئ #3D2C24
 */
/** حدود نسبة إطار الغلاف — تمنع أن يطول أو يعرض بإفراط */
const MIN_COVER_ASPECT = 0.8;   // 4:5 طولي
const MAX_COVER_ASPECT = 1.78;  // 16:9 عرضي

export default function ServiceDetailHero({ service, whatsappNumber }: ServiceDetailHeroProps) {
  const t = useTranslations("services");
  const tNav = useTranslations("nav");
  const isRtl = useLocale() !== "en";
  const [bookingOpen, setBookingOpen] = useState(false);

  const waMessage = encodeURIComponent(t("waInquireMessage", { title: service.title }));
  // خدمة تُتّفق مباشرة (كالزيارة البيتية): الزرّ الأساسي نفسه واتساب
  const contact = service.whatsappOnly
    ? serviceContactTarget(whatsappNumber, t("waArrangeMessage", { title: service.title }))
    : null;

  const waLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${waMessage}`
    : null;

  return (
    <>
      <section
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #EFF8F8 0%, #FEF0F5 50%, #FFF5F7 100%)",
          paddingTop: 36,
          paddingBottom: 80,
        }}
      >
        <Container>
          {/* Breadcrumb */}
          <nav
            className="font-label text-[13px] md:text-[15px] flex items-center gap-1.5 mb-5"
            style={{ color: "var(--light)" }}
          >
            <Link href="/" className="hover:text-dark transition-colors">{tNav("home")}</Link>
            <span>›</span>
            <Link href="/services" className="hover:text-dark transition-colors">{t("breadcrumbServices")}</Link>
            <span>›</span>
            <span style={{ color: "var(--mid)" }}>{service.title}</span>
          </nav>

          <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-10 md:gap-14 items-start">

            {/* ── يمين (RTL): صورة الخدمة ── */}
            <div
              className="rounded-[24px] overflow-hidden relative"
              style={{
                // الإطار يتبع نسبة الغلاف (بحدود معقولة) فلا يُقصّ منه شيء
                aspectRatio: String(
                  Math.min(Math.max(service.coverAspect ?? 4 / 3, MIN_COVER_ASPECT), MAX_COVER_ASPECT)
                ),
                border: "1.5px solid var(--bord)",
                boxShadow: "0 16px 48px rgba(0,0,0,0.10)",
                background: "white",
              }}
            >
              {service.coverImage ? (
                <Image
                  src={service.coverImage}
                  alt={service.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: "var(--rosepale)" }}
                >
                  <span style={{ fontSize: 96, color: "var(--rose)", opacity: 0.35 }}>✦</span>
                </div>
              )}
            </div>

            {/* ── يسار: المعلومات + CTAs ── */}
            <div>

              {/* type label — نقطة تيل + نص */}
              <div className="flex items-center gap-2 mb-4">
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--teal)" }} />
                <span
                  className="font-label font-bold text-[14px] md:text-[15px]"
                  style={{ color: "var(--mid)", letterSpacing: "1.5px", textTransform: "uppercase" }}
                >
                  {t(`type.${service.type}`)}
                </span>
              </div>

              {/* العنوان — آخر كلمة بلون وردي */}
              <h1
                className="font-heading font-bold mb-2"
                style={{
                  fontSize: "clamp(28px, 3.8vw, 46px)",
                  color: "#3D2C24",
                  lineHeight: 1.2,
                }}
              >
                {(() => {
                  const words = service.title.trim().split(/\s+/);
                  const lastWord = words.pop();
                  const rest = words.join(" ");
                  return (
                    <>
                      {rest && <>{rest} </>}
                      <span style={{ color: "var(--rose)" }}>{lastWord}</span>
                    </>
                  );
                })()}
              </h1>

              {/* Subtitle: credentials */}
              <p
                className="font-label text-[15px] md:text-[16px] mb-5"
                style={{ color: "var(--mid)" }}
              >
                {t.rich("heroSupervisedBy", { name: (chunks) => <span style={{ color: "#3D2C24", fontWeight: 700 }}>{chunks}</span> })}
              </p>

              {/* الوصف القصير */}
              <p
                className="leading-[1.85] mb-6"
                style={{
                  fontSize: "clamp(15px, 1.3vw, 17px)",
                  color: "var(--mid)",
                  fontFamily: "'Tajawal', sans-serif",
                }}
              >
                {service.shortDescription}
              </p>

              {/* بطاقة الـ meta — التفاصيل والسعر */}
              <div className="mb-5">
                <ServiceMeta service={service} />
              </div>

              {/* Scarcity */}
              <p
                className="font-label font-semibold text-[13px] mb-3 flex items-center justify-center gap-2"
                style={{ color: "var(--mid)" }}
              >
                <CalendarIcon />
                {t("limitedDates")}
              </p>

              {/* CTA الرئيسي */}
              <CTAAction
                href={contact?.href}
                disabled={!!contact && !contact.href}
                onClick={() => setBookingOpen(true)}
                className="w-full inline-flex items-center justify-center gap-2 font-label font-extrabold mb-3 btn-wobble [transition:transform_220ms_cubic-bezier(0.23,1,0.32,1),box-shadow_220ms_ease] hover:-translate-y-[3px]"
                style={{
                  fontSize: "clamp(16px, 1.4vw, 19px)",
                  background: "linear-gradient(135deg, var(--teal) 0%, #6BB5B0 100%)",
                  color: "var(--dark)",
                  border: "none",
                  borderRadius: 50,
                  padding: "20px 32px",
                  cursor: "pointer",
                  boxShadow: "0 12px 32px rgba(130,201,196,0.45)",
                }}
              >
                <span>
                  {contact
                    ? t("arrangeWhatsApp")
                    : t("registerNow")}
                </span>
                <span style={{ fontSize: "1.1em" }}>{isRtl ? "←" : "→"}</span>
              </CTAAction>

              {/* ملاحظة: لماذا لا يوجد سعر ولا حجز فوري */}
              {contact && (
                <p className="text-center text-body-sm mb-4" style={{ color: "var(--light)" }}>
                  {t("arrangeNote")}
                </p>
              )}

              {/* WhatsApp — link خفيف تحت الزر (زائد حين يكون الزرّ نفسه واتساب) */}
              {waLink && !contact && (
                <div className="flex items-center justify-center mb-5">
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-label font-semibold text-[14px] [transition:color_180ms_ease] hover:text-[#25D366]"
                    style={{ color: "var(--mid)" }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
                    </svg>
                    {t("orWhatsappInquire")}
                  </a>
                </div>
              )}

              {/* Micro-trust — أيقونات SVG monochrome */}
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <MicroTrust icon={<LockIcon />} text={t("trust.privacy")} />
                <span style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(37,34,32,0.20)" }} />
                <MicroTrust icon={<CheckMonoIcon />} text={t("trust.reply24h")} />
              </div>

            </div>
          </div>
        </Container>
      </section>

      {/* النموذج لا يُركَّب للخدمات التي تُتّفق على واتساب */}
      {!contact && (
        <BookingModal
          open={bookingOpen}
          onClose={() => setBookingOpen(false)}
          serviceTitle={service.title}
          serviceSlug={service.slug}
          ageGate={service}
        />
      )}
    </>
  );
}

/* ── أيقونات SVG monochrome ──────────────────────────────────── */

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function CheckMonoIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function MicroTrust({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5" style={{ color: "var(--mid)" }}>
      {icon}
      <span className="font-label font-semibold text-[12px]">{text}</span>
    </span>
  );
}
