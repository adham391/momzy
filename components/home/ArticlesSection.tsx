import Link from "next/link";
import Container from "@/components/ui/Container";
import SectionLabel from "@/components/ui/SectionLabel";
import Chip from "@/components/ui/Chip";
import { cn } from "@/lib/utils/cn";
import PolkaDots from "@/components/ui/PolkaDots";
import SectionWave from "@/components/ui/SectionWave";
import MomzyText from "@/components/ui/MomzyText";
import { getHomeArticles } from "@/lib/sanity/queries/articles";
import type { HomePageContent } from "@/lib/sanity/queries/homePage";

/** قسم أحدث المقالات — من Sanity (مع fallback ثابت) */
export default async function ArticlesSection({ content }: { content: HomePageContent }) {
  const articles = await getHomeArticles();
  if (articles.length === 0) return null;

  return (
    /** ─ الـ section شفاف — الـ wave يغطي نهاية HebaSection ─ */
    <section className="relative reveal-section" style={{ marginTop: -60, zIndex: 5 }}>

      {/* ── موجة أعلى القسم ── */}
      <SectionWave fill="#FDFAF5" />

      {/* ── محتوى القسم ── */}
      <div className="relative overflow-hidden bg-offwh" style={{ marginTop: -1, paddingTop: 16, paddingBottom: 72 }}>
        <PolkaDots opacity={0.2} count={18} />

        <Container className="relative z-[2]">
          {/* عنوان القسم */}
          <div className="flex items-end justify-between mb-10">
            <div>
              <SectionLabel color="teal">{content.articlesLabel}</SectionLabel>
              <h2 className="font-heading text-h2 font-bold text-dark">
                <MomzyText text={content.articlesTitle} />
              </h2>
            </div>
            <Link
              href="/articles"
              className="text-btn font-semibold text-teal cursor-pointer transition-colors hover:text-teald"
            >
              كل المقالات ←
            </Link>
          </div>

          {/* شبكة المقالات */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {articles.map((article, i) => (
              <Link
                key={i}
                href={article.href}
                className="bg-white rounded-[22px] overflow-hidden border-[1.5px] border-bord cursor-pointer [transition:transform_250ms_cubic-bezier(0.23,1,0.32,1),box-shadow_250ms_ease] hover:-translate-y-[5px] hover:shadow-[0_14px_40px_rgba(0,0,0,0.09)]"
              >
                {/* منطقة الصورة — صورة حقيقية أو إيموجي احتياطي */}
                {article.coverImage ? (
                  <div
                    className="h-[170px] bg-cover bg-center"
                    style={{ backgroundImage: `url('${article.coverImage}')` }}
                  />
                ) : (
                  <div className={cn("h-[170px] flex items-center justify-center text-[56px]", article.imageBg)}>
                    {article.emoji}
                  </div>
                )}

                {/* المحتوى */}
                <div className="p-[22px]">
                  <Chip variant={article.chipColor}>{article.category}</Chip>
                  <div className="font-heading text-h4 text-dark my-2.5 leading-[1.4]">
                    {article.title}
                  </div>
                  <div className="flex justify-between mt-3 text-[11px] md:text-[13px] text-light">
                    <span style={{ fontFamily: "'Tajawal', sans-serif" }}>{article.publishedAt}</span>
                    <span className="text-[11px] md:text-[14px] text-teal font-bold">اقرئي ←</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </div>

    </section>
  );
}
