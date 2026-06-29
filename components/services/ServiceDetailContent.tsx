import Container from "@/components/ui/Container";
import SectionWave from "@/components/ui/SectionWave";
import type { Service } from "@/lib/services/types";

interface ServiceDetailContentProps {
  service: Service;
}

/** ألوان متناوبة للنجوم في كاردات المواضيع — وردي / تيل / أصفر */
const TOPIC_PALETTES = [
  { bg: "var(--rosepale)",            color: "var(--rose)" },
  { bg: "var(--tealpale)",            color: "var(--teal)" },
  { bg: "rgba(247,223,152,0.30)",     color: "#C09420"     },
];

/** كارد موضوع واحد — نجمة ملوّنة + نص */
function TopicCard({ topic, palette }: { topic: string; palette: { bg: string; color: string } }) {
  return (
    <div
      className="flex items-start gap-3 rounded-[14px] p-4 transition-transform hover:-translate-y-0.5"
      style={{ background: "var(--offwh)", border: "1.5px solid var(--bord)" }}
    >
      <span
        className="flex-shrink-0 flex items-center justify-center"
        style={{
          width: 28, height: 28, borderRadius: 8,
          background: palette.bg,
          color: palette.color,
          fontSize: 16,
        }}
      >
        ✦
      </span>
      <p
        className="text-[13px] md:text-[16px] leading-[1.65] pt-0.5"
        style={{ color: "#3D2C24", fontFamily: "'Tajawal', sans-serif" }}
      >
        {topic}
      </p>
    </div>
  );
}

/**
 * المحتوى التفصيلي لصفحة الخدمة — palette موحّد عبر الموقع:
 *  - الوصف الطويل: offwh + teal accent
 *  - المواضيع: rosepale + rose accent
 *  - الفوائد: cream + teal accent
 *
 * كل قسم يظهر فقط إذا كانت بياناته متوفرة.
 */
export default function ServiceDetailContent({ service }: ServiceDetailContentProps) {
  const hasLongDesc = service.longDescription && service.longDescription.length > 0;
  const hasTopics   = service.topics         && service.topics.length > 0;
  const hasBenefits = service.benefits       && service.benefits.length > 0;

  if (!hasLongDesc && !hasTopics && !hasBenefits) return null;

  return (
    <>
      {/* ─── الوصف الطويل — offwh + teal accent ─── */}
      {hasLongDesc && (
        <section className="relative reveal-section" style={{ marginTop: -60, zIndex: 2 }}>
          <SectionWave fill="var(--offwh)" />
          <div style={{ background: "var(--offwh)", marginTop: -1, padding: "8px 0 80px" }}>
          <Container>
            <div className="max-w-[760px] mx-auto">
              <p
                className="font-label font-bold mb-4 text-[13px] md:text-[19px]"
                style={{ color: "var(--teal)", letterSpacing: "2.5px", textTransform: "uppercase" }}
              >
                عن الخدمة
              </p>
              <h2
                className="text-h2 font-heading font-bold mb-6"
                style={{ color: "#3D2C24" }}
              >
                ماذا نتطرق له خلال <span style={{ color: "var(--rose)" }}>اللقاء</span>
              </h2>
              <div className="flex flex-col gap-4">
                {service.longDescription!.map((para, i) => (
                  <p
                    key={i}
                    className="text-[14px] md:text-[18px] leading-[1.95]"
                    style={{ color: "var(--mid)", fontFamily: "'Tajawal', sans-serif" }}
                  >
                    {para}
                  </p>
                ))}
              </div>
            </div>
          </Container>
          </div>
        </section>
      )}

      {/* ─── قسم موحّد: المحاور + لمين هاي الخدمة ─── */}
      {(hasTopics || hasBenefits) && (
        <section className="relative reveal-section" style={{ marginTop: -60, zIndex: 3 }}>
          <SectionWave fill="white" />
          <div style={{ background: "white", marginTop: -1, padding: "56px 0 96px" }}>
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-10 md:gap-12">

              {/* العمود الأول: المحاور */}
              {hasTopics && (
                <div>
                  <div className="mb-7">
                    <p
                      className="font-label font-bold mb-3 text-[12px] md:text-[14px]"
                      style={{ color: "var(--teal)", letterSpacing: "3px", textTransform: "uppercase" }}
                    >
                      المحاور
                    </p>
                    <h2
                      className="font-heading font-bold"
                      style={{ fontSize: "clamp(24px, 2.6vw, 32px)", color: "#3D2C24", lineHeight: 1.25 }}
                    >
                      مواضيع نتعمّق بها <span style={{ color: "var(--rose)" }}>معاً</span>
                    </h2>
                  </div>

                  <ul className="flex flex-col gap-3.5">
                    {service.topics!.map((topic, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span
                          className="flex-shrink-0 flex items-center justify-center mt-0.5"
                          style={{
                            width: 22, height: 22, borderRadius: "50%",
                            background: "var(--rosepale)",
                            color: "var(--rose)",
                            fontSize: 12,
                          }}
                        >
                          ✦
                        </span>
                        <span
                          className="text-[14px] md:text-[16px] leading-[1.7]"
                          style={{ color: "#3D2C24", fontFamily: "'Tajawal', sans-serif" }}
                        >
                          {topic}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* divider عمودي بين العمودين — يظهر فقط على الديسكتوب */}
              {hasTopics && hasBenefits && (
                <div className="hidden md:block" style={{ width: 1, background: "var(--bord)" }} />
              )}

              {/* العمود الثاني: لمين هاي الخدمة */}
              {hasBenefits && (
                <div>
                  <div className="mb-7">
                    <p
                      className="font-label font-bold mb-3 text-[12px] md:text-[14px]"
                      style={{ color: "var(--teal)", letterSpacing: "3px", textTransform: "uppercase" }}
                    >
                      لمين هاي الخدمة
                    </p>
                    <h2
                      className="font-heading font-bold"
                      style={{ fontSize: "clamp(24px, 2.6vw, 32px)", color: "#3D2C24", lineHeight: 1.25 }}
                    >
                      ما الذي <span style={{ color: "var(--rose)" }}>ستحصلين عليه</span>
                    </h2>
                  </div>

                  <ul className="flex flex-col gap-3.5">
                    {service.benefits!.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span
                          className="flex-shrink-0 flex items-center justify-center mt-0.5"
                          style={{
                            width: 22, height: 22, borderRadius: "50%",
                            background: "var(--tealpale)",
                            color: "var(--teal)",
                          }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </span>
                        <span
                          className="text-[14px] md:text-[16px] leading-[1.7]"
                          style={{ color: "#3D2C24", fontFamily: "'Tajawal', sans-serif" }}
                        >
                          {benefit}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          </Container>
          </div>
        </section>
      )}
    </>
  );
}
