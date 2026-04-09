import Link from "next/link";
import Container from "@/components/ui/Container";
import SectionLabel from "@/components/ui/SectionLabel";
import Chip from "@/components/ui/Chip";
import { cn } from "@/lib/utils/cn";
import { ARTICLE_PREVIEWS } from "@/lib/utils/constants";

/** قسم أحدث المقالات */
export default function ArticlesSection() {
  return (
    <section className="py-11 bg-offwh">
      <Container>
        {/* عنوان القسم */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <SectionLabel color="teal">أحدث المقالات</SectionLabel>
            <h2 className="font-heading text-[clamp(28px,3.5vw,46px)] font-bold text-dark">
              اقرئي وتعلّمي مع{" "}
              <span className="text-teal italic">Momzy</span>
            </h2>
          </div>
          <Link
            href="/articles"
            className="text-[13px] font-semibold text-teal cursor-pointer transition-colors hover:text-teald"
          >
            كل المقالات ←
          </Link>
        </div>

        {/* شبكة المقالات */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {ARTICLE_PREVIEWS.map((article) => (
            <Link
              key={article.title}
              href="/articles"
              className="bg-white rounded-[22px] overflow-hidden border-[1.5px] border-bord cursor-pointer transition-all duration-250 hover:-translate-y-[5px] hover:shadow-[0_14px_40px_rgba(0,0,0,0.09)]"
            >
              {/* منطقة الصورة */}
              <div
                className={cn(
                  "h-[170px] flex items-center justify-center text-[56px]",
                  article.imageBg
                )}
              >
                {article.emoji}
              </div>

              {/* المحتوى */}
              <div className="p-[22px]">
                <Chip variant={article.chipColor}>{article.chipLabel}</Chip>
                <div className="font-heading text-lg text-dark my-2.5 leading-[1.4]">
                  {article.title}
                </div>
                <div className="flex justify-between mt-3 text-[11px] text-light">
                  <span>{article.readTime}</span>
                  <span className="text-teal font-bold">اقرئي ←</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
