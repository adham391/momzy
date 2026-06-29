import Link from "next/link";
import Container from "@/components/ui/Container";
import PageHeaderWave from "@/components/ui/PageHeaderWave";
import PolkaDots from "@/components/ui/PolkaDots";

/** Hero صفحة الخدمات — مُحسَّن للتحويل: scarcity + credentials + CTAs */
export default function ServicesHero() {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #FFF5F7 0%, #FEF0F5 50%, #EFF8F8 100%)",
        paddingTop: 56,
        paddingBottom: 96,
      }}
    >
      {/* نقاط ديكورية */}
      <PolkaDots colors={["#F2A7B5", "#82C9C4", "#F7DF98"]} opacity={0.18} count={14} />

      <Container>
        <div className="relative z-[2] text-center max-w-[760px] mx-auto">

          {/* Scarcity badge — تصميم احترافي بأيقونة SVG */}
          <div
            className="inline-flex items-center gap-2.5 mb-6 ps-1.5 pe-4 py-1.5 rounded-full"
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
              <CalendarIcon />
            </span>
            <span className="font-label font-bold text-[12px] md:text-[13px]" style={{ color: "var(--dark)", letterSpacing: "0.3px" }}>
              المواعيد محدودة — <span style={{ color: "var(--teal)" }}>احجزي مكانك مبكراً</span>
            </span>
          </div>

          {/* Section label */}
          <p
            className="font-label font-bold text-[12px] md:text-[14px] mb-4"
            style={{ color: "var(--teal)", letterSpacing: "3px", textTransform: "uppercase" }}
          >
            خدمات MOMZY
          </p>

          {/* العنوان الرئيسي */}
          <h1
            className="font-heading font-bold mb-5"
            style={{
              fontSize: "clamp(32px, 4.4vw, 54px)",
              color: "#3D2C24",
              lineHeight: 1.2,
            }}
          >
            <span className="block">دعم حقيقي لأمومة</span>
            <span className="block mt-3 md:mt-4" style={{ color: "var(--rose)", fontStyle: "italic" }}>
              أهدأ وأكثر ثقة
            </span>
          </h1>

          {/* النص الفرعي */}
          <p
            className="mb-7 max-w-[600px] mx-auto"
            style={{
              fontSize: "clamp(15px, 1.4vw, 18px)",
              color: "var(--mid)",
              fontFamily: "'Tajawal', sans-serif",
              lineHeight: 1.85,
              fontWeight: 500,
            }}
          >
            من اللحظة الأولى للحمل وحتى السنة الأولى لطفلك — هبة بجانبك بورشات
            جماعية ولقاءات فردية مصمّمة بعناية لاحتياجاتك.
          </p>

          {/* Credential chips */}
          <div className="flex items-center justify-center gap-2 md:gap-3 flex-wrap mb-8">
            <CredentialChip icon="👩‍⚕️" text="ممرضة معتمدة" dotColor="var(--rose)" />
            <CredentialChip icon="🤱" text="مرشدة رضاعة" dotColor="var(--teal)" />
            <CredentialChip icon="🤰" text="مرافقة ولادة" dotColor="#C09420" />
          </div>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="#services"
              className="inline-flex items-center justify-center gap-2 font-label font-extrabold [transition:transform_220ms_cubic-bezier(0.23,1,0.32,1),box-shadow_220ms_ease] hover:-translate-y-[3px]"
              style={{
                fontSize: "clamp(15px, 1.3vw, 17px)",
                background: "linear-gradient(135deg, var(--teal) 0%, #6BB5B0 100%)",
                color: "var(--dark)",
                border: "none",
                borderRadius: 50,
                padding: "16px 36px",
                cursor: "pointer",
                boxShadow: "0 12px 28px rgba(130,201,196,0.40)",
                minWidth: 200,
              }}
            >
              <span>تصفّحي الخدمات</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </Link>

            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 font-label font-extrabold [transition:transform_200ms_ease,background-color_200ms_ease] hover:-translate-y-[2px]"
              style={{
                fontSize: "clamp(15px, 1.3vw, 17px)",
                background: "white",
                color: "var(--rose)",
                border: "2px solid var(--rose)",
                borderRadius: 50,
                padding: "14px 36px",
                cursor: "pointer",
                minWidth: 200,
              }}
            >
              تواصلي مع هبة ←
            </Link>
          </div>

          {/* Trust micro-line */}
          <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
            <TrustLine icon="🔒" text="معلوماتك محمية" />
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(37,34,32,0.25)" }} />
            <TrustLine icon="💬" text="رد خلال 24 ساعة" />
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(37,34,32,0.25)" }} />
            <TrustLine icon="✓" text="بدون التزام" />
          </div>

        </div>
      </Container>

      <PageHeaderWave fillColor="var(--offwh)" />
    </div>
  );
}

/** chip لشهادة مهنية */
function CredentialChip({ icon, text, dotColor }: { icon: string; text: string; dotColor: string }) {
  return (
    <span
      className="inline-flex items-center gap-2 font-label font-bold text-[12px] md:text-[13px] px-3.5 py-2 rounded-full"
      style={{
        background: "white",
        color: "var(--dark)",
        border: "1px solid var(--bord)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: dotColor, flexShrink: 0 }} />
      <span>{text}</span>
    </span>
  );
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
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
