import Container from "@/components/ui/Container";
import SectionWave from "@/components/ui/SectionWave";
import ArticleCard from "./ArticleCard";
import { getRelatedArticles } from "@/lib/sanity/queries/articles";
import { getArticleLabeller } from "@/lib/articles/labels";
import type { ArticleCategory } from "@/lib/articles/categories";

/**
 * «اقرئي أيضًا» — من التصنيف نفسه أولاً ثم الأحدث.
 * يختفي القسم كليًا حين لا يوجد مقال آخر — أفضل من شبكة فارغة.
 */
export default async function RelatedArticles({
  slug,
  category,
  locale,
}: {
  slug: string;
  category: ArticleCategory | null;
  locale: string;
}) {
  const related = await getRelatedArticles(slug, category, locale);
  if (related.length === 0) return null;

  const { t, cardLabels } = await getArticleLabeller(locale);

  return (
    <section className="relative" style={{ marginTop: 40, zIndex: 2 }}>
      <SectionWave fill="#FDFAF5" />
      <div className="bg-cream" style={{ marginTop: -1, paddingTop: 24, paddingBottom: 72 }}>
        <Container>
          <h2 className="font-heading text-h2 font-bold text-dark mb-8 text-center">
            {t("relatedTitle")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 items-stretch">
            {related.map((a) => (
              <ArticleCard key={a.slug ?? a.title} article={a} labels={cardLabels(a)} />
            ))}
          </div>
        </Container>
      </div>
    </section>
  );
}
