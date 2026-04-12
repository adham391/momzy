import Link from "next/link";

/** قسم الهيرو — مطابق للـ prototype */
export default function HeroSection() {
  return (
    <section
        className="relative overflow-hidden flex items-center"
        style={{ background: "linear-gradient(140deg,#F2A7B5 0%,#FB9AB4 50%,#DC7A8A 100%)", minHeight: 290, zIndex: 1, position: "relative" }}
      >
        {/* ── الدوائر الديكورية ─────────────────────────── */}
        {/* hero-deco1 */}
        <span
          className="absolute rounded-full pointer-events-none"
          style={{ width: 110, height: 110, background: "var(--teal)", opacity: 0.85, top: 32, left: "46%", zIndex: 1 }}
        />
        {/* hero-deco2 */}
        <span
          className="absolute rounded-full pointer-events-none"
          style={{ width: 160, height: 160, background: "var(--yellow)", opacity: 0.9, bottom: 55, left: 220, zIndex: 1 }}
        />
        {/* hero-deco3 */}
        <span
          className="absolute rounded-full pointer-events-none"
          style={{ width: 110, height: 110, background: "#F5D98E", opacity: 0.8, bottom: 20, left: 60, zIndex: 1 }}
        />
        {/* hero-deco4 */}
        <span
          className="absolute rounded-full pointer-events-none"
          style={{ width: 340, height: 340, background: "rgba(255,255,255,0.05)", top: -100, left: "35%", zIndex: 0 }}
        />

        {/* ── محتوى النص ────────────────────────────────── */}
        <div
          className="mx-auto w-full relative"
          style={{ maxWidth: 1200, padding: "20px 56px 70px", minHeight: 260, display: "flex", alignItems: "center", zIndex: 3 }}
        >
          {/* النص — margin-left يدفعه عن الديكور اليساري */}
          <div className="ml-0 sm:ml-[40%] md:ml-[44%] max-w-full sm:max-w-[500px] py-[60px] sm:py-[28px]">
            {/* tag */}
            <span
              className="font-heading text-[19px] italic block mb-[18px]"
              style={{ color: "var(--yellow)" }}
            >
              نرافقك من الحمل حتى السنوات الأولى..
            </span>

            {/* العنوان */}
            <h1
              className="font-heading font-bold text-white mb-5"
              style={{ fontSize: "clamp(30px,4vw,52px)", lineHeight: 1.18 }}
            >
              بداية الأمومة
              <br />
              <span style={{ color: "var(--yellow)" }}>لحظة مفصلية</span>
            </h1>

            {/* الوصف */}
            <p
              className="text-[15px] leading-[1.85] font-bold mb-8"
              style={{ color: "rgba(255,255,255,0.9)", maxWidth: 400 }}
            >
              Momzy مؤسسة متخصصة ترافق الأمهات منذ الحمل وحتى السنوات الأولى من
              حياة الطفل — مع تركيز خاص على ما بعد الولادة ورعاية الأطفال حديثي
              الولادة.{" "}
              <Link href="/about" className="underline font-bold" style={{ opacity: 0.85 }}>
                قصة Momzy ←
              </Link>
            </p>

            {/* أزرار CTA */}
            <div className="flex gap-[14px] flex-wrap">
              <a
                href="/services"
                className="inline-flex items-center font-bold"
                style={{
                  background: "white",
                  color: "#82C9C4",
                  borderRadius: 50,
                  padding: "12px 28px",
                  fontWeight: 700,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                }}
              >
                اكتشفي خدماتنا
              </a>
              <a
                href="/shop"
                className="inline-flex items-center font-bold"
                style={{
                  background: "#82C9C4",
                  color: "white",
                  borderRadius: 50,
                  padding: "12px 28px",
                  fontWeight: 700,
                  boxShadow: "0 4px 16px rgba(130,201,196,0.4)",
                }}
              >
                اكتشفي منتجاتنا
              </a>
            </div>
          </div>
        </div>

    </section>
  );
}
