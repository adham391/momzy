"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { NAV_ITEMS, HEADER_HEIGHT, LOGO_HEIGHT } from "@/lib/utils/constants";
import MegaMenu from "./MegaMenu";
import MobileMenu from "./MobileMenu";

/** تأخير إغلاق الميقا منيو بالمللي ثانية */
const MEGA_CLOSE_DELAY = 150;

/** الهيدر الرئيسي — sticky مع blur و نافبار تفاعلي */
export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMegaOpen, setIsMegaOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(null);

  /* ── مراقبة التمرير لإضافة الظل ─────────────────────── */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ── التحكم بالميقا منيو ────────────────────────────── */
  const handleMegaEnter = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setIsMegaOpen(true);
  }, []);

  const handleMegaLeave = useCallback(() => {
    closeTimer.current = setTimeout(() => setIsMegaOpen(false), MEGA_CLOSE_DELAY);
  }, []);

  /* ── تبديل قائمة الموبايل ───────────────────────────── */
  const toggleMenu = useCallback(() => setIsMenuOpen((prev) => !prev), []);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-[500] bg-offwh/95 backdrop-blur-[20px] border-b border-black/[.07] transition-shadow duration-300",
          scrolled && "shadow-[0_4px_28px_rgba(0,0,0,0.07)]"
        )}
        style={{ height: HEADER_HEIGHT }}
      >
        <div className="mx-auto max-w-[1240px] px-5 sm:px-8 md:px-14 h-full flex items-center justify-between gap-5">
          {/* اللوقو */}
          <Link href="/" className="shrink-0">
            <Image
              src="/icons/momzy-logo.png"
              alt="Momzy"
              width={140}
              height={LOGO_HEIGHT}
              className="object-contain"
              style={{ height: LOGO_HEIGHT, width: "auto" }}
              priority
            />
          </Link>

          {/* النافبار — ديسكتوب فقط */}
          <nav className="hidden sm:flex items-center gap-[3px]">
            {NAV_ITEMS.map((item) => {
              const isShop = item.hasDropdown;
              const Wrapper = isShop ? "div" : Link;
              const wrapperProps = isShop
                ? {
                    onMouseEnter: handleMegaEnter,
                    onMouseLeave: handleMegaLeave,
                    className: "relative",
                  }
                : {};

              return (
                <div key={item.id} {...(isShop ? wrapperProps : {})} className={isShop ? "relative" : undefined}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-[10px] text-[13px] font-semibold text-mid transition-all duration-150 border-[1.5px] border-transparent",
                      `hover:${item.hoverBorder} hover:${item.hoverBg} hover:shadow-[0_2px_10px_rgba(0,0,0,0.06)] hover:text-dark`
                    )}
                  >
                    <span
                      className={cn(
                        "w-7 h-7 rounded-[7px] flex items-center justify-center shrink-0",
                        item.iconBg
                      )}
                    >
                      <Image
                        src={item.icon}
                        alt={item.label}
                        width={item.id === "services" ? 40 : 30}
                        height={item.id === "services" ? 40 : 30}
                        className="object-contain"
                      />
                    </span>
                    {item.label}
                  </Link>

                  {/* الميقا منيو */}
                  {isShop && isMegaOpen && (
                    <MegaMenu onMouseEnter={handleMegaEnter} onMouseLeave={handleMegaLeave} />
                  )}
                </div>
              );
            })}
          </nav>

          {/* زر البرغر — موبايل فقط */}
          <button
            onClick={toggleMenu}
            className="flex sm:hidden flex-col gap-[5px] p-2 cursor-pointer rounded-lg transition-colors hover:bg-cream"
            aria-label="القائمة"
          >
            <span
              className={cn(
                "block w-[22px] h-[2.5px] bg-dark rounded-sm transition-all duration-300",
                isMenuOpen && "translate-y-[7.5px] rotate-45"
              )}
            />
            <span
              className={cn(
                "block w-[22px] h-[2.5px] bg-dark rounded-sm transition-all duration-300",
                isMenuOpen && "opacity-0 scale-x-0"
              )}
            />
            <span
              className={cn(
                "block w-[22px] h-[2.5px] bg-dark rounded-sm transition-all duration-300",
                isMenuOpen && "-translate-y-[7.5px] -rotate-45"
              )}
            />
          </button>
        </div>
      </header>

      {/* قائمة الموبايل */}
      <MobileMenu isOpen={isMenuOpen} onClose={closeMenu} />
    </>
  );
}
