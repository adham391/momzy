import { Link } from "@/lib/i18n/navigation";
import Chip from "@/components/ui/Chip";
import ArticleCover from "./ArticleCover";
import type { ArticleCard as ArticleData } from "@/lib/sanity/queries/articles";

/**
 * بطاقة مقال — تُستعمل في /articles وفي «اقرئي أيضًا».
 *
 * مكوّن أصمّ عمدًا: يستقبل النصوص مترجَمة جاهزة بدل أن يقرأ next-intl،
 * فيعمل كما هو داخل Server Component وداخل فلتر Client على السواء.
 */
export interface ArticleCardLabels {
  /** اسم التصنيف باللغة المعروضة */
  category: string;
  /** «٥ دقائق قراءة» */
  readTime: string;
  /** «اقرئي ←» */
  read: string;
}

export default function ArticleCard({
  article,
  labels,
}: {
  article: ArticleData;
  labels: ArticleCardLabels;
}) {
  return (
    <Link
      href={article.href}
      className="flex flex-col bg-white rounded-[22px] overflow-hidden border-[1.5px] border-bord cursor-pointer [transition:transform_250ms_cubic-bezier(0.23,1,0.32,1),box-shadow_250ms_ease] hover:-translate-y-[5px] hover:shadow-[0_14px_40px_rgba(0,0,0,0.09)]"
    >
      <ArticleCover
        src={article.coverImage}
        alt={article.coverAlt}
        category={article.category}
        emoji={article.emoji}
        bg={article.imageBg}
        ratio={3 / 2}
        emojiSize={56}
      />

      <div className="flex flex-col flex-1 p-[22px]">
        <Chip variant={article.chipColor}>{labels.category}</Chip>

        <h3 className="font-heading text-h4 text-dark my-2.5 leading-[1.4]">{article.title}</h3>

        {article.excerpt && (
          <p className="text-body-sm text-mid leading-[1.85] line-clamp-3">{article.excerpt}</p>
        )}

        {/* mt-auto يثبّت السطر أسفل البطاقة فتستوي البطاقات مهما اختلف النص */}
        <div className="flex items-center justify-between gap-3 mt-auto pt-4 text-[11px] md:text-[13px] text-light">
          <span className="flex items-center gap-2">
            {article.publishedIso ? (
              <time dateTime={article.publishedIso}>{article.publishedAt}</time>
            ) : (
              <span>{article.publishedAt}</span>
            )}
            {article.readMinutes ? (
              <>
                <span aria-hidden="true">·</span>
                <span>{labels.readTime}</span>
              </>
            ) : null}
          </span>
          <span className="text-[11px] md:text-[14px] text-teal font-bold shrink-0">{labels.read}</span>
        </div>
      </div>
    </Link>
  );
}
