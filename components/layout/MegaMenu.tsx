"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { MEGA_CATEGORIES, type MegaCategory } from "@/lib/utils/constants";

/** خصائص الميقا منيو */
interface MegaMenuProps {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

/** الميقا منيو — dropdown المتجر مع كاتيقوريز وpreview */
export default function MegaMenu({ onMouseEnter, onMouseLeave }: MegaMenuProps) {
  const [activeId, setActiveId] = useState(MEGA_CATEGORIES[0].id);
  const active = MEGA_CATEGORIES.find((c) => c.id === activeId)!;

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="absolute top-[calc(100%+10px)] end-0 bg-white rounded-[22px] border-[1.5px] border-bord shadow-[0_16px_48px_rgba(0,0,0,0.12)] min-w-[520px] z-[600] overflow-hidden flex animate-[dropIn_0.18s_ease_both]"
    >
      {/* عمود الكاتيقوريز */}
      <div className="w-[180px] shrink-0 border-s border-bord py-3 bg-offwh">
        {MEGA_CATEGORIES.map((cat) => (
          <div
            key={cat.id}
            onMouseEnter={() => setActiveId(cat.id)}
            className={cn(
              "flex items-center gap-2.5 px-[18px] py-3 text-sm font-semibold text-mid cursor-pointer transition-all duration-150 relative",
              activeId === cat.id && "bg-white text-teal"
            )}
          >
            {/* شريط التنشيط */}
            {activeId === cat.id && (
              <span className="absolute start-0 top-1/2 -translate-y-1/2 w-[3px] h-[60%] rounded-sm bg-teal" />
            )}
            <span className={cn("w-8 h-8 rounded-lg flex items-center justify-center", cat.iconBg)}>
              <Image src={cat.icon} alt={cat.label} width={30} height={30} className="object-contain" />
            </span>
            {cat.label}
          </div>
        ))}
      </div>

      {/* عمود الـ Preview */}
      <div className="flex-1 p-5 flex flex-col gap-3">
        {/* المنتج المميز */}
        <Link
          href="/shop"
          className={cn(
            "flex items-center gap-3.5 p-4 rounded-[14px] border-[1.5px] cursor-pointer transition-all duration-200 hover:-translate-x-[3px]",
            active.featuredBg,
            active.featuredBorderColor
          )}
        >
          <span className="w-14 h-14 rounded-[10px] flex items-center justify-center text-[28px] shrink-0">
            {active.featured.emoji}
          </span>
          <div>
            <span
              className={cn(
                "font-label text-[9px] font-extrabold tracking-wider uppercase text-white px-2.5 py-[3px] rounded-[10px] inline-block mb-1",
                active.featured.badgeBg
              )}
            >
              {active.featured.badge}
            </span>
            <div className="text-sm font-bold text-dark">{active.featured.title}</div>
            <div className="font-label text-base font-extrabold text-teal">{active.featured.price}</div>
          </div>
        </Link>

        {/* قائمة العناصر */}
        {active.items.length > 0 && (
          <div className="flex flex-col gap-1.5">
            {active.items.map((item, i) => (
              <Link
                key={i}
                href="/shop"
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-[14px] text-[13px] text-mid cursor-pointer transition-all duration-150 border border-transparent hover:bg-tealpale hover:text-teal hover:border-[rgba(130,201,196,0.2)]"
              >
                <span className="text-lg w-7 text-center">{item.emoji}</span>
                {item.title}
              </Link>
            ))}
          </div>
        )}

        {/* رابط عرض الكل */}
        <Link
          href="/shop"
          className="mt-1 text-xs font-bold text-teal flex items-center gap-1.5 px-3 py-2 rounded-[14px] transition-all duration-200 hover:gap-2.5 cursor-pointer"
        >
          {active.seeAllText} ←
        </Link>
      </div>
    </div>
  );
}
