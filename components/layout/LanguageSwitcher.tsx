"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/lib/i18n/navigation";
import { routing, LOCALE_LABELS, type Locale } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils/cn";

interface LanguageSwitcherProps {
  /** يُستدعى بعد اختيار لغة — لإغلاق قائمة الموبايل مثلًا */
  onSelect?: () => void;
  /** حجم أكبر لقائمة الموبايل */
  size?: "sm" | "lg";
}

/**
 * مبدّل اللغة — أزرار عربي/עברית/EN.
 * يستبدل بادئة اللغة في الرابط الحالي مع البقاء على نفس الصفحة.
 */
export default function LanguageSwitcher({ onSelect, size = "sm" }: LanguageSwitcherProps) {
  const locale = useLocale();
  const t = useTranslations("lang");
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function switchTo(next: Locale) {
    if (next === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
    onSelect?.();
  }

  return (
    <div
      role="group"
      aria-label={t("switch")}
      className={cn(
        "flex items-center rounded-full border-[1.5px] border-bord bg-white p-[3px]",
        isPending && "opacity-60"
      )}
    >
      {routing.locales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => switchTo(loc)}
          disabled={isPending}
          className={cn(
            "font-label font-bold rounded-full cursor-pointer [transition:background-color_180ms_ease,color_180ms_ease]",
            size === "lg" ? "text-[13px] px-4 py-2" : "text-[11px] px-2.5 py-1",
            loc === locale
              ? "bg-teal text-white"
              : "bg-transparent text-mid hover:bg-tealpale hover:text-dark"
          )}
        >
          {LOCALE_LABELS[loc]}
        </button>
      ))}
    </div>
  );
}
