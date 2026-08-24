import { Link } from "@/lib/i18n/navigation";
import Image from "next/image";
import Container from "@/components/ui/Container";
import { cn } from "@/lib/utils/cn";
import { OFFER_CARDS } from "@/lib/utils/constants";
import PolkaDots from "@/components/ui/PolkaDots";
import SectionWave from "@/components/ui/SectionWave";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("home");
  return (
    /** ─ الـ section شفاف — الـ wave يغطي نهاية LatestSection ─ */
    <section className="relative reveal-section" style={{ marginTop: -60, zIndex: 3 }}>

      {/* ── موجة أعلى القسم ── */}
      <SectionWave fill="#FDFAF5" />

      {/* ── محتوى القسم ── */}
      <div className="relative overflow-hidden bg-offwh" style={{ marginTop: -1, paddingTop: 24, paddingBottom: 56 }}>
        {/* نقاط ديكورية متحركة */}
        <PolkaDots opacity={0.2} count={18} />
        <Container className="relative z-[2]">
          {/* العنوان المركزي */}
          <div className="text-center mb-7">
            <h2 className="font-heading text-h2 font-bold text-dark">
              {t.rich("offer.title", { brand: (chunks) => <span className="text-rose italic">{chunks}</span> })}
            </h2>
          </div>

          {/* شبكة الكاردات */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {OFFER_CARDS.map((card) => (
              <Link
                key={card.key}
                href={card.href}
                className="bg-white rounded-[14px] p-[18px_20px] border-[1.5px] border-bord relative overflow-hidden [transition:transform_280ms_cubic-bezier(0.23,1,0.32,1),box-shadow_280ms_ease,border-color_200ms_ease] cursor-pointer flex items-start gap-3.5 hover:-translate-y-1.5 hover:shadow-[0_16px_44px_rgba(0,0,0,0.09)] hover:border-transparent"
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
                    "w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0",
                    ICON_BG[card.color]
                  )}
                >
                  <Image src={card.icon} alt={t(`offer.cards.${card.key}.title`)} width={26} height={26} className="object-contain" />
                </span>

                {/* المحتوى */}
                <div className="pt-2.5">
                  <div className="font-heading text-h4 text-dark mb-2">
                    {t(`offer.cards.${card.key}.title`)}
                  </div>
                  <div className="text-body-sm text-mid leading-[1.65] mb-3.5">
                    {t(`offer.cards.${card.key}.description`)}
                  </div>
                  <span
                    className={cn(
                      "text-body-sm font-bold flex items-center gap-1.5 [transition:gap_200ms_cubic-bezier(0.23,1,0.32,1)]",
                      LINK_COLOR[card.color]
                    )}
                  >
                    {t(`offer.cards.${card.key}.link`)}
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
