import Link from "next/link";
import type { Service, ServiceColor } from "@/lib/services/types";

interface ServiceCardProps {
  service: Service;
  /** رقم واتساب هبة — للحجز المباشر */
  whatsappNumber?: string;
}

/** نظام ألوان كل خدمة — accent للنص، soft للخلفيات، glow للتوهّج */
const PALETTE: Record<ServiceColor, { accent: string; emblem: string; chip: string; glow: string }> = {
  rose:   { accent: "#D9697A", emblem: "linear-gradient(135deg,#FDE4EC,#F7C4CE)", chip: "rgba(242,167,181,0.14)", glow: "rgba(242,167,181,0.55)" },
  teal:   { accent: "#4FA8A6", emblem: "linear-gradient(135deg,#D4EEED,#A8D8D5)", chip: "rgba(130,201,196,0.16)", glow: "rgba(130,201,196,0.50)" },
  yellow: { accent: "#B8920A", emblem: "linear-gradient(135deg,#FEF4D0,#F7DF98)", chip: "rgba(247,223,152,0.28)", glow: "rgba(247,223,152,0.65)" },
  mint:   { accent: "#5DA9A4", emblem: "linear-gradient(135deg,#DDF0EE,#A8D8D5)", chip: "rgba(168,216,213,0.20)", glow: "rgba(168,216,213,0.50)" },
};

/** ترجمة type → نص عربي */
const TYPE_LABEL: Record<Service["type"], string> = {
  workshop:   "ورشة جماعية",
  individual: "لقاء فردي",
  online:     "أونلاين",
  home:       "زيارة بيتية",
};

/** كارد خدمة فاخر — بلا صورة، شعار نوع + توهّج + حجز واتساب */
export default function ServiceCard({ service, whatsappNumber }: ServiceCardProps) {
  const p = PALETTE[service.color];

  // رابط واتساب مع رسالة جاهزة لهذه الخدمة
  const waMessage = encodeURIComponent(
    `مرحباً هبة 🌸\nحابة أحجز موعد لـ: ${service.title}\nشو المواعيد المتاحة؟`
  );
  const waDigits = (whatsappNumber ?? "972500000000").replace(/\D/g, "") || "972500000000";
  const waLink = `https://wa.me/${waDigits}?text=${waMessage}`;

  return (
    <div
      className="group relative flex flex-col h-full overflow-hidden bg-white [transition:transform_300ms_cubic-bezier(0.23,1,0.32,1),box-shadow_300ms_ease] hover:-translate-y-1.5"
      style={{
        borderRadius: 22,
        border: "1px solid rgba(0,0,0,0.05)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.03), 0 10px 30px rgba(0,0,0,0.05)",
      }}
    >
      {/* توهّج لوني ناعم أعلى الزاوية — يشتدّ عند الـ hover */}
      <div
        aria-hidden="true"
        className="absolute pointer-events-none opacity-70 group-hover:opacity-100 [transition:opacity_300ms_ease]"
        style={{
          top: -70, insetInlineEnd: -70, width: 180, height: 180, borderRadius: "50%",
          background: `radial-gradient(circle, ${p.glow}, transparent 70%)`,
          filter: "blur(8px)",
        }}
      />

      <div className="relative flex flex-col flex-1 p-4 pt-5 sm:p-5">

        {/* ── الرأس: شعار النوع + التسمية ── */}
        <div className="flex items-center gap-2.5 mb-3.5">
          <span
            className="flex items-center justify-center shrink-0 shadow-sm"
            style={{ width: 40, height: 40, borderRadius: 12, background: p.emblem, color: p.accent }}
          >
            <TypeIcon type={service.type} />
          </span>
          <span
            className="font-label font-extrabold uppercase"
            style={{ color: p.accent, fontSize: 11, letterSpacing: "1.5px" }}
          >
            {TYPE_LABEL[service.type]}
          </span>
        </div>

        {/* العنوان */}
        <h3 className="font-heading font-bold text-dark mb-3 leading-snug" style={{ fontSize: 18 }}>
          {service.title}
        </h3>

        {/* meta — شارات أنيقة */}
        <div className="flex flex-wrap gap-1.5 mb-3.5">
          <MetaChip chip={p.chip} accent={p.accent}><ClockIcon /> {service.duration}</MetaChip>
          <MetaChip chip={p.chip} accent={p.accent}><PinIcon /> {service.location}</MetaChip>
          {service.ageRange && <MetaChip chip={p.chip} accent={p.accent}><BabyIcon /> {service.ageRange}</MetaChip>}
        </div>

        {/* الوصف القصير — سطران */}
        <p className="text-mid leading-[1.7] mb-4 line-clamp-2" style={{ fontSize: 13, fontFamily: "'Tajawal', sans-serif" }}>
          {service.shortDescription}
        </p>

        {/* ── الأزرار — مثبّتة بالأسفل ── */}
        <div className="mt-auto">
          {/* حجز عبر واتساب */}
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-wobble flex items-center justify-center gap-2 font-bold w-full whitespace-nowrap"
            style={{
              background: "linear-gradient(135deg,#25D366,#1EBE5A)",
              color: "white",
              borderRadius: 50,
              padding: "11px 14px",
              fontSize: 14,
              boxShadow: "0 6px 18px rgba(37,211,102,0.35)",
            }}
          >
            <WhatsAppIcon />
            احجزي موعدك
          </a>

          {/* التفاصيل — رابط نصي */}
          <Link
            href={`/services/${service.slug}`}
            className="block text-center font-bold mt-2.5 hover:opacity-70 transition-opacity"
            style={{ color: p.accent, fontSize: 13 }}
          >
            التفاصيل الكاملة ←
          </Link>
        </div>
      </div>
    </div>
  );
}

/** شارة meta — خلفية ملوّنة خفيفة + أيقونة */
function MetaChip({ children, chip, accent }: { children: React.ReactNode; chip: string; accent: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full font-label"
      style={{ background: chip, color: accent, fontSize: 12, padding: "4px 10px" }}
    >
      {children}
    </span>
  );
}

/* ── أيقونات النوع ───────────────────────────────────── */

function TypeIcon({ type }: { type: Service["type"] }) {
  const common = { width: 21, height: 21, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (type === "workshop") {
    return (
      <svg {...common}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }
  if (type === "online") {
    return (
      <svg {...common}>
        <rect x="2" y="4" width="14" height="13" rx="2" />
        <path d="m22 7-6 4 6 4V7z" />
      </svg>
    );
  }
  if (type === "home") {
    return (
      <svg {...common}>
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.5V21h14V9.5" />
        <path d="M9 21v-6h6v6" />
      </svg>
    );
  }
  // individual
  return (
    <svg {...common}>
      <path d="M20 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 20l1.9-4.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 14" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function BabyIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M9 12h.01M15 12h.01M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5" />
    </svg>
  );
}
