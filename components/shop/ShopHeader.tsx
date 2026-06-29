import SectionLabel from "@/components/ui/SectionLabel";
import PageHeaderWave from "@/components/ui/PageHeaderWave";

/** هيدر صفحة المتجر */
export default function ShopHeader() {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #FFF5F7 0%, #FEF0F5 40%, #EFF8F8 100%)",
        paddingTop: 48,
        paddingBottom: 72,
      }}
    >
      {/* ── دوائر ديكورية ── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: -60,
          right: -80,
          width: 320,
          height: 320,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(242,167,181,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: -40,
          left: 120,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(247,223,152,0.22) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 20,
          left: -40,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(130,201,196,0.2) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* ── النص ── */}
      <div
        className="relative mx-auto text-center"
        style={{ maxWidth: 700, padding: "0 24px", zIndex: 2 }}
      >
        <SectionLabel color="teal" centered noDash>متجر Momzy</SectionLabel>
        <h1
          className="font-heading font-bold text-dark text-h1"
          style={{ lineHeight: 1.2 }}
        >
          كل ما تحتاجينه في مكان{" "}
          <span className="text-rose italic">واحد</span>
        </h1>
        <p
          className="text-body leading-[1.85] text-mid mt-4"
          style={{ maxWidth: 500, margin: "16px auto 0" }}
        >
          منتجات مختارة بعناية، كتيبات تعليمية، وورشات مسجلة — كلها مصممة
          لترافقك في كل خطوة من رحلتك كأم.
        </p>
      </div>

      {/* ── wave سفلية ── */}
      <PageHeaderWave />
    </div>
  );
}
