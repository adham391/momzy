"use client";

import { useState, useRef, useEffect } from "react";
import type { ProductSort } from "@/lib/products/types";

interface FilterBarProps {
  categories:       string[];
  activeCategory:   string;
  onChangeCategory: (cat: string) => void;
  searchQuery:      string;
  onChangeSearch:   (q: string) => void;
  sort:             ProductSort;
  onChangeSort:     (s: ProductSort) => void;
}

/** خيارات الترتيب */
const SORT_OPTIONS: { value: ProductSort; label: string; icon: string }[] = [
  { value: "newest",     label: "الأحدث",              icon: "✦" },
  { value: "price-asc",  label: "السعر: الأقل أولاً",  icon: "↑" },
  { value: "price-desc", label: "السعر: الأعلى أولاً", icon: "↓" },
];

/** شريط فلترة + بحث + ترتيب — تصميم احترافي */
export default function FilterBar({
  categories,
  activeCategory,
  onChangeCategory,
  searchQuery,
  onChangeSearch,
  sort,
  onChangeSort,
}: FilterBarProps) {
  const [sortOpen, setSortOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeSort = SORT_OPTIONS.find((o) => o.value === sort) ?? SORT_OPTIONS[0];

  /** إغلاق الـ dropdown عند الضغط خارجه */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className="flex flex-col gap-4"
      style={{ marginBottom: 36 }}
    >
      {/* صف 1: بحث + ترتيب */}
      <div className="flex gap-3 items-center">

        {/* البحث */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onChangeSearch(e.target.value)}
            placeholder="ابحثي عن منتج..."
            className="w-full font-body text-[14px] text-dark outline-none [transition:border-color_150ms_ease]"
            style={{
              border: "1.5px solid var(--bord)",
              borderRadius: 14,
              padding: "11px 16px 11px 42px",
              background: "white",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--teal)")}
            onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--bord)")}
          />
          <svg
            className="absolute end-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="var(--light)" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        {/* الترتيب — custom dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setSortOpen((v) => !v)}
            className="flex items-center gap-2 font-label font-semibold text-[13px] [transition:border-color_150ms_ease,background-color_150ms_ease]"
            style={{
              border: "1.5px solid var(--bord)",
              borderRadius: 14,
              padding: "11px 16px",
              background: "white",
              color: "var(--dark)",
              minWidth: 170,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              cursor: "pointer",
              justifyContent: "space-between",
            }}
          >
            <span className="flex items-center gap-1.5">
              <span style={{ color: "var(--teal)", fontWeight: 700 }}>{activeSort.icon}</span>
              {activeSort.label}
            </span>
            <svg
              width="12" height="12" viewBox="0 0 12 12" fill="none"
              style={{
                transition: "transform 0.2s",
                transform: sortOpen ? "rotate(180deg)" : "rotate(0deg)",
                color: "var(--light)",
              }}
            >
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* قائمة الترتيب */}
          {sortOpen && (
            <div
              className="absolute start-0 z-50 overflow-hidden"
              style={{
                top: "calc(100% + 8px)",
                minWidth: 170,
                background: "white",
                border: "1.5px solid var(--bord)",
                borderRadius: 14,
                boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
              }}
            >
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { onChangeSort(opt.value); setSortOpen(false); }}
                  className="w-full text-right flex items-center gap-2 font-label font-semibold text-[13px] transition-colors"
                  style={{
                    padding: "11px 16px",
                    background: sort === opt.value ? "var(--tealpale)" : "transparent",
                    color:      sort === opt.value ? "var(--teal)"     : "var(--mid)",
                    cursor: "pointer",
                    borderBottom: "1px solid var(--bord)",
                  }}
                >
                  <span style={{ color: "var(--teal)", fontWeight: 700, minWidth: 14 }}>{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* صف 2: التصنيفات */}
      <div className="flex flex-wrap gap-2">
        <CategoryButton
          label="الكل"
          active={activeCategory === "all"}
          onClick={() => onChangeCategory("all")}
        />
        {categories.map((cat) => (
          <CategoryButton
            key={cat}
            label={cat}
            active={activeCategory === cat}
            onClick={() => onChangeCategory(cat)}
          />
        ))}
      </div>
    </div>
  );
}

/** زر فلتر تصنيف */
function CategoryButton({ label, active, onClick }: {
  label:   string;
  active:  boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="btn-wobble inline-flex items-center font-label font-semibold text-[13px] [transition:background-color_200ms_ease,border-color_200ms_ease,color_200ms_ease]"
      style={{
        padding: "8px 20px",
        borderRadius: 20,
        border:     active ? "1.5px solid var(--teal)" : "1.5px solid var(--bord)",
        background: active ? "var(--teal)"             : "white",
        color:      active ? "white"                   : "var(--mid)",
        boxShadow:  active ? "0 4px 12px rgba(130,201,196,0.35)" : "0 2px 8px rgba(0,0,0,0.04)",
        cursor: "pointer",
      }}
    >
      {active && <span style={{ marginLeft: 6, fontSize: 10 }}>✦</span>}
      {label}
    </button>
  );
}
