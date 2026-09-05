import { Link } from "@/lib/i18n/navigation";
import Container from "@/components/ui/Container";
import Chip from "@/components/ui/Chip";
import PageHeaderWave from "@/components/ui/PageHeaderWave";
import ArticleCover from "./ArticleCover";
import type { ArticleFull } from "@/lib/sanity/queries/articles";

/**
 * رأس صفحة المقال — عودة، تصنيف، عنوان، تاريخ وزمن قراءة، ثم الغلاف.
 *
 * الغلاف يخرج من الهيدر ويتداخل مع بداية المحتوى (margin سالب) — النمط
 * نفسه المتّبع في موجات الأقسام، فيربط الرأس بالنص بدل أن يفصلهما خطّ.
 */
export default function ArticleHero({
  article,
  categoryLabel,
  readTime,
  backLabel,
}: {
  article: ArticleFull;
  categoryLabel: string;
  readTime: string;
  backLabel: string;
}) {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #EFF8F8 0%, #F6F8F4 50%, #FFF5F7 100%)",
        paddingTop: 32,
        paddingBottom: 96,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute", top: -80, insetInlineEnd: -60, width: 300, height: 300,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(130,201,196,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <Container className="relative" >
        <div className="mx-auto text-center" style={{ maxWidth: 760, zIndex: 2, position: "relative" }}>
          <Link
            href="/articles"
            className="inline-block text-body-sm font-bold text-teal hover:text-teald transition-colors mb-6"
          >
            {backLabel}
          </Link>

          <div className="mb-4">
            <Chip variant={article.chipColor}>{categoryLabel}</Chip>
          </div>

          <h1 className="font-heading font-bold text-dark text-h1" style={{ lineHeight: 1.25 }}>
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="text-body leading-[1.9] text-mid mt-5" style={{ maxWidth: 620, margin: "20px auto 0" }}>
              {article.excerpt}
            </p>
          )}

          <div className="flex items-center justify-center gap-2.5 mt-6 text-body-sm text-light">
            {article.publishedIso ? (
              <time dateTime={article.publishedIso}>{article.publishedAt}</time>
            ) : (
              <span>{article.publishedAt}</span>
            )}
            <span aria-hidden="true">·</span>
            <span>{readTime}</span>
          </div>
        </div>
      </Container>

      <PageHeaderWave />
    </div>
  );
}

/** الغلاف — يُعرض بعد الهيدر ويتداخل معه */
export function ArticleHeroCover({ article }: { article: ArticleFull }) {
  return (
    <Container>
      <div
        className="mx-auto rounded-[24px] overflow-hidden border-[1.5px] border-bord shadow-[0_14px_44px_rgba(0,0,0,0.07)]"
        style={{ maxWidth: 860, marginTop: -56, position: "relative", zIndex: 3 }}
      >
        <ArticleCover
          src={article.coverImageLarge ?? article.coverImage}
          alt={article.coverAlt}
          category={article.category}
          ratio={16 / 9}
          emojiSize={96}
          className="w-full"
        />
      </div>
    </Container>
  );
}
