import Image from "next/image";
import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/Container";
import SectionLabel from "@/components/ui/SectionLabel";
import PolkaDots from "@/components/ui/PolkaDots";
import SectionWave from "@/components/ui/SectionWave";
import { getSiteSettings } from "@/lib/sanity/queries/siteSettings";

/** أخضر واتساب الرسمي — للزر والتمييزات فقط، لا للخلفيات الكبيرة */
const WA_GREEN = "#25D366";

/** ألوان محادثة واتساب الداكنة — تجعل النموذج يُقرأ فوراً كواتساب */
const WA_CHAT   = "#0B141A";
const WA_BAR    = "#1F2C34";
const WA_BUBBLE = "#1F2C34";
const WA_TEXT   = "#E9EDEF";

/** أيقونة واتساب */
function WhatsAppGlyph({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  );
}

/** علامة ✓ صغيرة لنقاط القيمة */
function TickIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/**
 * قسم قناة واتساب — هدفه تحويل الزائرة إلى مشتركة.
 * نموذج هاتف يعرض أمثلة لما يصلها، فتفهم القيمة قبل أن تضغط.
 * يظهر فقط إذا ضُبط رابط القناة (في Sanity أو الافتراضي).
 */
export default async function ChannelSection() {
  const t = await getTranslations("home");
  const { socialLinks } = await getSiteSettings();
  const channelUrl = socialLinks.whatsappChannel;
  if (!channelUrl) return null;

  const bullets  = [t("channel.bullet1"), t("channel.bullet2"), t("channel.bullet3")];
  const messages = [t("channel.msg1"),    t("channel.msg2"),    t("channel.msg3")];

  return (
    <section className="relative reveal-section" style={{ marginTop: -60, zIndex: 6 }}>
      <SectionWave fill="#EFF8F8" />

      <div
        className="relative overflow-hidden"
        style={{ background: "var(--tealpale)", marginTop: -1, paddingTop: 16, paddingBottom: 72 }}
      >
        <PolkaDots colors={["#82C9C4", "#A8D8D5", "#25D366"]} opacity={0.16} count={14} />

        <Container className="relative z-[2]">
          <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-center">

            {/* ── النص والدعوة ── */}
            <div className="text-center md:text-start">
              <SectionLabel color="teal" className="justify-center md:justify-start">
                {t("channel.label")}
              </SectionLabel>

              <h2 className="font-heading text-h2 font-bold text-dark mb-4">
                {t("channel.title")}
              </h2>

              <p
                className="text-mid mb-6 mx-auto md:mx-0"
                style={{ fontSize: 15, lineHeight: 1.95, maxWidth: 460, fontFamily: "var(--font-tajawal), sans-serif" }}
              >
                {t("channel.text")}
              </p>

              {/* نقاط القيمة */}
              <ul className="inline-flex flex-col gap-3 mb-7 text-start">
                {bullets.map((b, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-dark" style={{ fontSize: 14.5 }}>
                    <span
                      className="flex items-center justify-center shrink-0 rounded-full"
                      style={{ width: 21, height: 21, background: WA_GREEN, boxShadow: "0 2px 8px rgba(37,211,102,0.40)" }}
                    >
                      <TickIcon />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>

              {/* الزر */}
              <div>
                <a
                  href={channelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 font-bold text-white active:scale-[0.97] [transition:transform_160ms_var(--ease-out),box-shadow_200ms_ease] hover:shadow-[0_12px_32px_rgba(37,211,102,0.45)]"
                  style={{
                    background: WA_GREEN,
                    borderRadius: 50,
                    padding: "14px 30px",
                    fontSize: 15.5,
                    boxShadow: "0 8px 24px rgba(37,211,102,0.32)",
                  }}
                >
                  <WhatsAppGlyph />
                  {t("channel.cta")}
                </a>
              </div>

              {/* طمأنة الخصوصية — تزيل أكبر تردّد قبل الاشتراك */}
              <p className="text-light mt-3.5" style={{ fontSize: 12.5, lineHeight: 1.7 }}>
                {t("channel.privacy")}
              </p>
            </div>

            {/* ── نموذج الهاتف ── */}
            <div className="relative mx-auto w-full" style={{ maxWidth: 292 }}>
              {/* هالة خضراء خلف الهاتف */}
              <div
                aria-hidden="true"
                className="absolute pointer-events-none"
                style={{
                  inset: -34,
                  background: "radial-gradient(circle at 50% 38%, rgba(37,211,102,0.20), transparent 68%)",
                  filter: "blur(12px)",
                }}
              />

              <div
                className="relative"
                style={{
                  borderRadius: 34,
                  border: "8px solid #16222A",
                  background: WA_CHAT,
                  overflow: "hidden",
                  boxShadow: "0 26px 64px rgba(0,0,0,0.24)",
                }}
              >
                {/* شريط القناة */}
                <div className="flex items-center gap-2.5" style={{ background: WA_BAR, padding: "12px 14px" }}>
                  <span
                    className="relative shrink-0 overflow-hidden rounded-full bg-white"
                    style={{ width: 34, height: 34 }}
                  >
                    <Image src="/images/heba.jpg" alt="" fill sizes="34px" className="object-cover object-top" />
                  </span>
                  <div className="min-w-0">
                    <div className="font-bold leading-tight" style={{ color: WA_TEXT, fontSize: 11.5 }}>
                      {t("channel.channelName")}
                    </div>
                    <div className="flex items-center gap-1" style={{ color: WA_GREEN, fontSize: 10.5 }}>
                      <WhatsAppGlyph size={10} />
                      {t("channel.channelBadge")}
                    </div>
                  </div>
                </div>

                {/* الرسائل */}
                <div className="flex flex-col items-start gap-2.5" style={{ padding: "16px 12px 20px" }}>
                  {messages.map((m, i) => (
                    <div
                      key={i}
                      className="stagger-item"
                      style={{
                        background: WA_BUBBLE,
                        color: WA_TEXT,
                        borderRadius: 13,
                        borderStartStartRadius: 4,
                        padding: "10px 12px",
                        maxWidth: "94%",
                        fontSize: 12.5,
                        lineHeight: 1.8,
                        animationDelay: `${180 + i * 90}ms`,
                        boxShadow: "0 1px 2px rgba(0,0,0,0.28)",
                      }}
                    >
                      {m}
                    </div>
                  ))}
                </div>
              </div>

              {/* توضيح أنّ ما فوق أمثلة لا لقطة حقيقية */}
              <p className="text-center text-light mt-3" style={{ fontSize: 11.5 }}>
                {t("channel.mockCaption")}
              </p>
            </div>

          </div>
        </Container>
      </div>
    </section>
  );
}
