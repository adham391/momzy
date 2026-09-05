import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Container from "@/components/ui/Container";
import ArticleHero, { ArticleHeroCover } from "@/components/articles/ArticleHero";
import ArticleBody from "@/components/articles/ArticleBody";
import ArticleSources from "@/components/articles/ArticleSources";
import RelatedArticles from "@/components/articles/RelatedArticles";
import { getArticleBySlug, getAllArticleSlugs } from "@/lib/sanity/queries/articles";
import { getArticleLabeller } from "@/lib/articles/labels";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = await getArticleBySlug(slug, locale);
  if (!article) return { title: "Momzy" };

  return {
    title: `${article.title} | Momzy`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      publishedTime: article.publishedIso,
      images: article.coverImage ? [{ url: article.coverImage }] : undefined,
    },
  };
}

/** المسارات تُبنى مسبقًا لكل المقالات المنشورة */
export async function generateStaticParams() {
  const slugs = await getAllArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

/** ISR — تعديلات هبة تظهر خلال دقيقة */
export const revalidate = 60;

export default async function ArticlePage({ params }: PageProps) {
  const { locale, slug } = await params;
  const article = await getArticleBySlug(slug, locale);
  if (!article) notFound();

  const { t, categoryLabel, readTime } = await getArticleLabeller(locale);

  return (
    <>
      <ArticleHero
        article={article}
        categoryLabel={categoryLabel(article)}
        readTime={readTime(article.readMinutes)}
        backLabel={t("backToAll")}
      />

      <ArticleHeroCover article={article} />

      <article style={{ paddingTop: 48, paddingBottom: 16 }}>
        <Container>
          <ArticleBody body={article.body} />
          <ArticleSources
            sources={article.sources}
            title={t("sourcesTitle")}
            note={t("sourcesNote")}
          />
        </Container>
      </article>

      <RelatedArticles slug={article.slug} category={article.category} locale={locale} />
    </>
  );
}
