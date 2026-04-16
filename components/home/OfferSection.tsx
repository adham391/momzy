import Link from "next/link";
import Container from "@/components/ui/Container";
import { cn } from "@/lib/utils/cn";
import { OFFER_CARDS } from "@/lib/utils/constants";
import PolkaDots from "@/components/ui/PolkaDots";

/** ألوان البار العلوي لكل variant */
const BAR_GRADIENT: Record<string, string> = {
  rose:   "bg-gradient-to-l from-rose to-roselt",
  teal:   "bg-gradient-to-l from-teal to-mint",
  yellow: "bg-gradient-to-l from-yellow to-[#f5d858]",
};

/** ألوان الأيقونة لكل variant */
const ICON_BG: Record<string, string> = {
  rose:   "bg-gradient-to-br from-[#fde4ec] to-rosepale",
  teal:   "bg-gradient-to-br from-[#d4eeed] to-tealpale",
  yellow: "bg-gradient-to-br from-[#faedc8] to-yellowlt",
};

/** ألوان الرابط */
const LINK_COLOR: Record<string, string> = {
  rose:   "text-rose",
  teal:   "text-teal",
  yellow: "text-[#9A7A10]",
};

/** قسم "كل ما تحتاجينه في Momzy" */
export default function OfferSection() {
  return (
    /** ─ الـ section شفاف — الـ wave يغطي نهاية LatestSection ─ */
    <section className="relative reveal-section" style={{ marginTop: -40, zIndex: 3 }}>

      {/* ── موجة أعلى القسم ── */}
      <svg
        viewBox="0 0 1440 40"
        preserveAspectRatio="none"
        style={{ display: "block", width: "100%", height: 40 }}
        aria-hidden="true"
      >
        <path d="M0,20 C480,0 960,0 1440,20 L1440,40 L0,40 Z" fill="#FDFAF5" />
      </svg>

      {/* ── محتوى القسم ── */}
      <div className="relative overflow-hidden bg-offwh" style={{ marginTop: -1, paddingTop: 40, paddingBottom: 80 }}>
        {/* نقاط ديكورية متحركة */}
        <PolkaDots opacity={0.2} count={18} />
        <Container className="relative z-[2]">
          {/* العنوان المركزي */}
          <div className="text-center mb-7">
            <h2 className="font-heading text-[clamp(28px,3.5vw,46px)] font-bold text-dark">
              كل ما تحتاجينه في <span className="text-rose italic">Momzy</span>
            </h2>
          </div>

          {/* شبكة الكاردات */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {OFFER_CARDS.map((card) => (
              <Link
                key={card.href + card.title}
                href={card.href}
                className="bg-white rounded-[14px] p-[18px_20px] border-[1.5px] border-bord relative overflow-hidden transition-all duration-[280ms] cursor-pointer flex items-start gap-3.5 hover:-translate-y-1.5 hover:shadow-[0_16px_44px_rgba(0,0,0,0.09)] hover:border-transparent"
              >
                {/* البار العلوي الملون */}
                <span
                  className={cn(
                    "h-1 rounded-t-[22px] absolute top-0 left-0 right-0",
                    BAR_GRADIENT[card.color]
                  )}
                />

                {/* الأيقونة */}
                <span
                  className={cn(
                    "w-10 h-10 rounded-[10px] flex items-center justify-center text-xl shrink-0",
                    ICON_BG[card.color]
                  )}
                >
                  {card.emoji}
                </span>

                {/* المحتوى */}
                <div className="pt-2.5">
                  <div className="font-heading text-[26px] text-dark mb-2">
                    {card.title}
                  </div>
                  <div className="text-sm text-mid leading-[1.65] mb-3.5">
                    {card.description}
                  </div>
                  <span
                    className={cn(
                      "text-[13px] font-bold flex items-center gap-1.5 transition-all hover:gap-2.5",
                      LINK_COLOR[card.color]
                    )}
                  >
                    {card.linkText} ←
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </div>

    </section>
  );
}
