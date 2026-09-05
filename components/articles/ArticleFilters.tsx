"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import ArticleCard, { type ArticleCardLabels } from "./ArticleCard";
import type { ArticleCard as ArticleData } from "@/lib/sanity/queries/articles";
import type { ArticleCategory } from "@/lib/articles/categories";

/** مقال مع نصوصه المترجَمة — يُجهَّز على السيرفر فلا يقرأ الفلتر next-intl */
export interface ArticleWithLabels {
  article: ArticleData;
  labels: ArticleCardLabels;
}

/** زر تصنيف — الاسم مترجَم، والقيمة مفتاح ثابت */
export interface CategoryOption {
  value: ArticleCategory;
  label: string;
}

/**
 * فلتر التصنيفات + شبكة المقالات.
 *
 * الفلترة في المتصفّح لا في الـ URL: عدد المقالات صغير، والتبديل الفوري
 * أفضل من رحلة للسيرفر. تظهر التصنيفات التي فيها مقال فعلًا — فلا يضغط
 * القارئ زرًّا يقوده إلى فراغ.
 */
export default function ArticleFilters({
  items,
  categories,
  allLabel,
  emptyLabel,
}: {
  items: ArticleWithLabels[];
  categories: CategoryOption[];
  allLabel: string;
  emptyLabel: string;
}) {
  const [active, setActive] = useState<ArticleCategory | "all">("all");

  const shown = active === "all" ? items : items.filter((i) => i.article.category === active);

  return (
    <>
      {/* ── أزرار التصنيف ── */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2.5 mb-8">
          <FilterButton active={active === "all"} onClick={() => setActive("all")}>
            {allLabel}
          </FilterButton>
          {categories.map((c) => (
            <FilterButton key={c.value} active={active === c.value} onClick={() => setActive(c.value)}>
              {c.label}
            </FilterButton>
          ))}
        </div>
      )}

      {/* ── الشبكة ── */}
      {shown.length === 0 ? (
        <p className="text-body text-mid text-center py-16">{emptyLabel}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 items-stretch">
          {shown.map((item) => (
            <ArticleCard key={item.article.slug ?? item.article.title} {...item} />
          ))}
        </div>
      )}
    </>
  );
}

/** زر تصنيف واحد */
function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "px-4 py-2 rounded-full text-body-sm font-bold border-[1.5px] cursor-pointer transition-colors",
        active
          ? "bg-dark text-white border-dark"
          : "bg-white text-mid border-bord hover:border-teal hover:text-teal"
      )}
    >
      {children}
    </button>
  );
}
