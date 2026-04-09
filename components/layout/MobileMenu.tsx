"use client";

import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { MOBILE_NAV_ITEMS } from "@/lib/utils/constants";
import { HEADER_HEIGHT } from "@/lib/utils/constants";

/** خصائص القائمة المتنقلة */
interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

/** قائمة الموبايل — overlay كامل الشاشة */
export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-offwh/[.98] backdrop-blur-[20px] z-[400] flex flex-col p-6 gap-2 overflow-y-auto border-t border-bord"
      style={{ top: HEADER_HEIGHT }}
    >
      {/* عناصر التنقل */}
      {MOBILE_NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onClose}
          className="flex items-center gap-3.5 px-[18px] py-4 rounded-[14px] text-base font-semibold text-dark border-[1.5px] border-bord bg-white cursor-pointer transition-all duration-150 hover:border-rose hover:bg-rosepale hover:text-rose"
        >
          <span
            className={cn(
              "w-10 h-10 rounded-[10px] flex items-center justify-center text-lg shrink-0",
              item.iconBg
            )}
          >
            {item.emoji}
          </span>
          {item.label}
        </Link>
      ))}

      {/* زر CTA */}
      <Link
        href="/services"
        onClick={onClose}
        className="mt-2 flex items-center justify-center gap-2.5 bg-rose text-white px-4 py-4 rounded-[14px] text-base font-bold cursor-pointer shadow-[0_4px_16px_rgba(217,105,122,0.35)]"
      >
        احجزي مع هبة
      </Link>
    </div>
  );
}
