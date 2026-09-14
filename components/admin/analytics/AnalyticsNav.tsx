import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { PERIOD_OPTIONS, type StatsPeriod } from "@/lib/stats/period";

/** تبويبات صفحة التحليلات بترتيب العرض */
export const ANALYTICS_TABS = [
  { value: "overview", label: "نظرة عامة" },
  { value: "products", label: "المنتجات" },
  { value: "booklets", label: "الكتيبات" },
  { value: "workshops", label: "الورشات" },
] as const;

export type AnalyticsTab = (typeof ANALYTICS_TABS)[number]["value"];

/** يقرأ التبويب من الرابط — غير المعروف يعود إلى «نظرة عامة» */
export function parseTab(value: string | undefined): AnalyticsTab {
  return ANALYTICS_TABS.find((tab) => tab.value === value)?.value ?? "overview";
}

/** رابط الصفحة بتبويب وفترة */
function analyticsHref(tab: AnalyticsTab, period: StatsPeriod): string {
  return `/admin/analytics?tab=${tab}&days=${period}`;
}

/**
 * تبويبات التحليلات ومفتاح الفترة — روابط عادية لا حالة في المتصفّح:
 * الصفحة تُرسم على السيرفر حسب الرابط، فيبقى كل عرضٍ قابلًا للرجوع إليه.
 * مفتاح الفترة لتبويبات الفئات فقط؛ «نظرة عامة» ثابتة على آخر 30 يومًا.
 */
export default function AnalyticsNav({ tab, period }: { tab: AnalyticsTab; period: StatsPeriod }) {
  return (
    <div className="flex flex-col gap-3 mb-6">
      <nav className="flex flex-wrap gap-2" aria-label="أقسام التحليلات">
        {ANALYTICS_TABS.map((option) => (
          <Pill
            key={option.value}
            href={analyticsHref(option.value, period)}
            active={option.value === tab}
            label={option.label}
          />
        ))}
      </nav>

      {tab !== "overview" && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-micro text-light font-label">الفترة:</span>
          {PERIOD_OPTIONS.map((option) => (
            <Pill
              key={String(option.value)}
              href={analyticsHref(tab, option.value)}
              active={option.value === period}
              label={option.label}
              small
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** رابط بشكل حبّة — اللون inline لأن قاعدة `a { color: inherit }` تتفوّق على Tailwind */
function Pill({
  href,
  active,
  label,
  small,
}: {
  href: string;
  active: boolean;
  label: string;
  small?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      style={{ color: active ? "var(--dark)" : "var(--mid)" }}
      className={cn(
        "rounded-full border font-bold transition-colors",
        small ? "px-3 py-1 text-micro" : "px-4 py-2 text-body-sm",
        active ? "bg-rose border-rose" : "bg-white border-bord hover:border-rose"
      )}
    >
      {label}
    </Link>
  );
}
