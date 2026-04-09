import Link from "next/link";
import Button from "@/components/ui/Button";

/** بيانات الكاردات العائمة حول الدائرة المركزية */
const FLOATING_CARDS = [
  {
    emoji: "🤱",
    label: "رضاعة",
    style: { top: "12%", right: "8%",  animation: "float1 3.2s ease-in-out infinite" },
    bg: "from-[#fde4ec] to-[#fef0f4]",
  },
  {
    emoji: "👶",
    label: "طفل",
    style: { top: "50%", right: "2%",  animation: "float2 4s ease-in-out infinite 0.6s" },
    bg: "from-[#d8f2f0] to-[#eff8f8]",
  },
  {
    emoji: "🌸",
    label: "صحة نفسية",
    style: { top: "10%", left: "12%",  animation: "float3 3.6s ease-in-out infinite 1s" },
    bg: "from-[#fde4ec] to-[#fef0f4]",
  },
  {
    emoji: "💊",
    label: "صحة",
    style: { top: "48%", left: "2%",   animation: "float4 4.4s ease-in-out infinite 0.3s" },
    bg: "from-[#fef4d0] to-[#fefbf0]",
  },
  {
    emoji: "📚",
    label: "تعليم",
    style: { bottom: "16%", left: "18%", animation: "float5 3.8s ease-in-out infinite 0.8s" },
    bg: "from-[#d4f0ee] to-[#eff8f8]",
  },
] as const;

/** قسم الهيرو — الواجهة الرئيسية مع ديكور 3D عائم */
export default function HeroSection() {
  return (
    <>
      <section className="bg-gradient-to-br from-[#F2A7B5] via-[#FB9AB4] to-[#DC7A8A] min-h-[420px] relative overflow-hidden flex items-center">

        {/* ── دوائر الخلفية ──────────────────────────────── */}
        <span className="absolute w-[110px] h-[110px] rounded-full bg-teal/85 top-8 start-[46%] blur-[2px] pointer-events-none" />
        <span className="absolute w-[160px] h-[160px] rounded-full bg-yellow/90 -bottom-10 start-[220px] blur-[3px] pointer-events-none" />
        <span className="absolute w-[110px] h-[110px] rounded-full bg-[#F5D98E]/80 bottom-5 start-[60px] blur-[2px] pointer-events-none" />
        <span className="absolute w-[380px] h-[380px] rounded-full bg-white/[.06] -top-[120px] start-[35%] pointer-events-none" />
        {/* دائرة ضبابية إضافية لعمق أكثر */}
        <span className="absolute w-[220px] h-[220px] rounded-full bg-[#E88098]/30 bottom-0 end-[20%] blur-[40px] pointer-events-none" />

        {/* ── منطقة الديكور 3D — اليسار (مخفية على الموبايل) ── */}
        <div className="absolute end-0 top-0 bottom-0 w-[46%] hidden sm:flex items-center justify-center z-[2]">
          <div className="relative w-full h-full flex items-center justify-center">

            {/* الدائرة المركزية الكبيرة */}
            <div
              className="w-[260px] h-[260px] rounded-full relative"
              style={{
                background: "radial-gradient(circle at 35% 35%, #ffffff55, #F7C4CE88 50%, #E8809888)",
                boxShadow: "0 30px 80px rgba(220,100,130,0.4), 0 8px 24px rgba(220,100,130,0.25), inset 0 2px 8px rgba(255,255,255,0.4)",
                border: "2px solid rgba(255,255,255,0.35)",
              }}
            >
              {/* حلقة داخلية */}
              <div
                className="absolute inset-4 rounded-full"
                style={{
                  background: "radial-gradient(circle at 40% 30%, rgba(255,255,255,0.5), rgba(255,255,255,0.05))",
                  border: "1.5px solid rgba(255,255,255,0.25)",
                }}
              />
              {/* نقطة ضوء */}
              <div className="absolute top-7 right-9 w-6 h-6 rounded-full bg-white/40 blur-[4px]" />
            </div>

            {/* الكاردات العائمة */}
            {FLOATING_CARDS.map((card) => (
              <div
                key={card.label}
                className="absolute"
                style={card.style}
              >
                <div
                  className={`bg-gradient-to-br ${card.bg} backdrop-blur-sm rounded-2xl px-3 py-2.5 flex items-center gap-2 shadow-[0_8px_24px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08)] border border-white/60`}
                >
                  <span className="text-2xl leading-none">{card.emoji}</span>
                  <span className="text-[11px] font-bold text-dark/80 font-label whitespace-nowrap">
                    {card.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── محتوى النص ────────────────────────────────── */}
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8 md:px-14 w-full relative z-[3] min-h-[420px] flex items-center">
          <div className="sm:me-[46%] max-w-[480px] py-10 sm:py-0">

            {/* العلامة التمهيدية */}
            <span className="font-heading text-[19px] italic text-yellow mb-5 block drop-shadow-sm">
              نرافقك من الحمل حتى السنوات الأولى..
            </span>

            {/* العنوان الرئيسي */}
            <h1 className="font-heading font-bold leading-[1.15] mb-6"
                style={{ fontSize: "clamp(46px, 6vw, 76px)" }}>
              <span className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
                بداية الأمومة
              </span>
              <br />
              {/* gradient من أصفر إلى برتقالي */}
              <span
                style={{
                  background: "linear-gradient(135deg, #F7DF98 0%, #F5A623 60%, #E8870A 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  filter: "drop-shadow(0 2px 6px rgba(245,160,35,0.3))",
                }}
              >
                لحظة مفصلية
              </span>
            </h1>

            {/* الوصف */}
            <p className="text-[15px] leading-[1.85] text-white/90 max-w-[400px] mb-8 font-bold">
              Momzy مؤسسة متخصصة ترافق الأمهات منذ الحمل وحتى السنوات الأولى من
              حياة الطفل — مع تركيز خاص على ما بعد الولادة ورعاية الأطفال حديثي
              الولادة.{" "}
              <Link
                href="/about"
                className="underline opacity-85 font-bold hover:opacity-100"
              >
                قصة Momzy ←
              </Link>
            </p>

            {/* أزرار CTA */}
            <div className="flex gap-3.5 flex-wrap">
              <Button variant="white" href="/services">
                اكتشفي خدماتنا
              </Button>
              <Button variant="teal" href="/shop">
                اكتشفي منتجاتنا
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── الموجة أسفل الهيرو ────────────────────────── */}
      <div className="bg-offwh h-[50px] relative">
        <div
          className="absolute top-0 left-0 right-0 h-[50px] bg-gradient-to-br from-[#B85565] to-[#C86070]"
          style={{ clipPath: "ellipse(55% 100% at 50% 0%)" }}
        />
      </div>
    </>
  );
}
