import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/Container";
import ArticlesHeader from "@/components/articles/ArticlesHeader";
import ArticleFilters from "@/components/articles/ArticleFilters";
import { getArticles } from "@/lib/sanity/queries/articles";
import { getArticleLabeller } from "@/lib/articles/labels";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "articles" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

/** ISR — يُعاد بناء الصفحة كل دقيقة، فيظهر مقال هبة الجديد سريعًا */
export const revalidate = 60;

/** صفحة المقالات — server يجلب ويترجم، وclient يفلتر */
export default async function ArticlesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const articles = await getArticles(locale);
  const { t, cardLabels, categoryOptions } = await getArticleLabeller(locale);

  const items = articles.map((article) => ({ article, labels: cardLabels(article) }));

  return (
    <>
      <ArticlesHeader />
      <div style={{ paddingTop: 16, paddingBottom: 80 }}>
        <Container>
          {articles.length === 0 ? (
            <p className="text-body text-mid text-center py-20">{t("emptyAll")}</p>
          ) : (
            <ArticleFilters
              items={items}
              categories={categoryOptions(articles)}
              allLabel={t("all")}
              emptyLabel={t("empty")}
            />
          )}
        </Container>
      </div>
    </>
  );
}
