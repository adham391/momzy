import { getTranslations } from "next-intl/server";
import { ARTICLE_CATEGORIES } from "./categories";
import type { ArticleCard } from "@/lib/sanity/queries/articles";
import type { ArticleCardLabels } from "@/components/articles/ArticleCard";

/**
 * نصوص المقالات المترجَمة.
 *
 * البطاقة مكوّن أصمّ لا يقرأ next-intl (كي تعمل داخل فلتر Client)، فالترجمة
 * تحدث هنا مرة واحدة على السيرفر وتُمرَّر جاهزة. وهذه الدالة هي الموضع
 * الوحيد الذي يعرف كيف تُصاغ «٥ دقائق للقراءة» — فلا تتكرّر الصيغة في صفحتين.
 */
export async function getArticleLabeller(locale: string) {
  const t = await getTranslations({ locale, namespace: "articles" });

  /**
   * اسم التصنيف باللغة المعروضة.
   * البطاقات الاحتياطية الثابتة بلا مفتاح، فتحمل اسمها جاهزًا — وإلا
   * ظهرت شارة فارغة حين لا مقال في Sanity بعد.
   */
  const categoryLabel = (a: Pick<ArticleCard, "category" | "staticCategoryLabel">): string =>
    a.category ? t(`categories.${a.category}`) : a.staticCategoryLabel ?? "";

  /** «٥ دقائق للقراءة» — بصيغة الجمع الصحيحة لكل لغة */
  const readTime = (minutes?: number): string => t("readTime", { minutes: minutes ?? 1 });

  /** نصوص بطاقة واحدة */
  const cardLabels = (a: ArticleCard): ArticleCardLabels => ({
    category: categoryLabel(a),
    readTime: readTime(a.readMinutes),
    read: t("read"),
  });

  /**
   * أزرار التصنيف — التصنيفات الموجودة فعلًا في المقالات المعروضة فقط،
   * بالترتيب المُعرَّف في categories.ts لا بترتيب ورودها.
   */
  const categoryOptions = (articles: ArticleCard[]) => {
    const present = new Set(articles.map((a) => a.category).filter(Boolean));
    return ARTICLE_CATEGORIES.filter((c) => present.has(c)).map((value) => ({
      value,
      label: t(`categories.${value}`),
    }));
  };

  return { t, categoryLabel, readTime, cardLabels, categoryOptions };
}
