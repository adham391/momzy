import { useTranslations } from "next-intl";
import SectionLabel from "@/components/ui/SectionLabel";
import PageHeaderWave from "@/components/ui/PageHeaderWave";

/** هيدر صفحة المقالات — نظير ShopHeader بتدرّج تركوازي يميّز المكتبة عن المتجر */
export default function ArticlesHeader() {
  const t = useTranslations("articles");

  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #EFF8F8 0%, #F4F9F5 45%, #FFF5F7 100%)",
        paddingTop: 48,
        paddingBottom: 72,
      }}
    >
      {/* ── دوائر ديكورية ── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute", top: -60, insetInlineEnd: -80, width: 320, height: 320,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(130,201,196,0.20) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute", bottom: -40, insetInlineStart: 120, width: 200, height: 200,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(242,167,181,0.20) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute", top: 20, insetInlineStart: -40, width: 120, height: 120,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(247,223,152,0.24) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* ── النص ── */}
      <div className="relative mx-auto text-center" style={{ maxWidth: 700, padding: "0 24px", zIndex: 2 }}>
        <SectionLabel color="teal" centered noDash>{t("headerLabel")}</SectionLabel>
        <h1 className="font-heading font-bold text-dark text-h1" style={{ lineHeight: 1.2 }}>
          {t.rich("headerTitle", {
            em: (chunks) => <span className="text-rose italic">{chunks}</span>,
          })}
        </h1>
        <p className="text-body leading-[1.85] text-mid mt-4" style={{ maxWidth: 520, margin: "16px auto 0" }}>
          {t("headerSubtitle")}
        </p>
      </div>

      <PageHeaderWave />
    </div>
  );
}
