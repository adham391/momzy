import Container from "@/components/ui/Container";
import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { HEBA_SERVICES } from "@/lib/utils/constants";
import PolkaDots from "@/components/ui/PolkaDots";

/** تاقات هبة المهنية */
const HEBA_TAGS = ["ممرضة معتمدة", "مرشدة رضاعة", "مرافقة ولادة"];

/** قسم هبة حسن — التعريف بالمؤسسة */
export default function HebaSection() {
  return (
    /** ─ الـ section شفاف — الـ wave يغطي نهاية OfferSection ─ */
    <section className="relative reveal-section" style={{ zIndex: 4 }}>

      {/* ── موجة أعلى القسم ── */}
      <svg
        viewBox="0 0 1440 40"
        preserveAspectRatio="none"
        style={{ display: "block", width: "100%", height: 40 }}
        aria-hidden="true"
      >
        <path d="M0,20 C480,0 960,0 1440,20 L1440,40 L0,40 Z" fill="#F8F4EE" />
      </svg>

      {/* ── محتوى القسم ── */}
      <div className="relative overflow-hidden bg-cream" style={{ marginTop: -1, paddingTop: 16, paddingBottom: 80 }}>
        {/* نقاط ديكورية متحركة */}
        <PolkaDots colors={["#F2A7B5", "#82C9C4", "#F7DF98", "#A8D8D5"]} opacity={0.2} count={18} />

<Container>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-center relative z-[2]">

            {/* العمود البصري — الصورة والمعلومات */}
            <div className="text-center">
              {/* الصورة الدائرية */}
              <div className="w-[260px] h-[260px] rounded-full mx-auto mb-6 bg-gradient-to-br from-rose to-mint flex items-center justify-center text-[120px] border-[6px] border-white shadow-[0_16px_48px_rgba(217,105,122,0.25)] relative">
                👩‍⚕️
                {/* علامة التوثيق */}
                <span className="absolute bottom-2.5 end-2.5 w-11 h-11 rounded-full bg-teal border-[3px] border-white flex items-center justify-center text-lg shadow-[0_4px_12px_rgba(79,168,166,0.4)]">
                  ✓
                </span>
              </div>

              {/* الاسم */}
              <div className="font-heading text-[28px] text-dark mb-1">هبة حسن</div>
              <div className="font-label text-sm text-light tracking-[2px] uppercase mb-5">Heba Hasan</div>

              {/* التاقات المهنية */}
              <div className="flex gap-2 justify-center flex-wrap mb-6">
                {HEBA_TAGS.map((tag) => (
                  <span
                    key={tag}
                    className="bg-white border-[1.5px] border-bord px-4 py-1.5 rounded-full text-xs text-mid font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* العمود النصي — الوصف والخدمات */}
            <div>
              <SectionLabel color="rose">مؤسِّسة Momzy</SectionLabel>
              <h2 className="font-heading text-[clamp(28px,3.5vw,46px)] font-bold text-dark leading-[1.22]">
                القلب النابض
                <br />
                وراء <span className="text-rose italic">Momzy</span>
              </h2>

              <p className="text-[15px] leading-[1.85] text-mid mt-4 mb-3.5">
                ممرضة شغوفة بالأمومة، رحلتها مع أكثر من ألف أم منحتها فهماً عميقاً
                لما تحتاجه كل أم. هبة لا تقدم معلومات فقط — تقدم حضوراً إنسانياً حقيقياً.
              </p>
              <p className="text-[15px] leading-[1.85] text-mid mb-8">
                من أول نبضة قلب حتى الخطوة الأولى لطفلك — هبة بجانبك بعلم وحب وشغف حقيقي.
              </p>

              {/* شبكة الخدمات */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {HEBA_SERVICES.map((svc) => (
                  <div
                    key={svc.title}
                    className="bg-white rounded-[14px] p-[18px_16px] border-[1.5px] border-bord flex items-start gap-3 transition-all duration-[220ms] cursor-pointer hover:-translate-y-[3px] hover:shadow-[0_8px_22px_rgba(0,0,0,0.07)] hover:border-rosepale"
                  >
                    <span
                      className={cn(
                        "w-9 h-9 rounded-[10px] flex items-center justify-center text-lg shrink-0",
                        svc.iconBg
                      )}
                    >
                      {svc.emoji}
                    </span>
                    <div>
                      <div className="text-[13px] font-bold text-dark mb-0.5">{svc.title}</div>
                      <div className="text-[11px] text-light leading-[1.5]">{svc.description}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* زر CTA */}
              <div className="mt-7">
                <Button variant="rose" href="/services">احجزي مع هبة ←</Button>
              </div>
            </div>

          </div>
        </Container>
      </div>

    </section>
  );
}
