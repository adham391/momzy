import AnalyticsNav, { parseTab, type AnalyticsTab } from "@/components/admin/analytics/AnalyticsNav";
import OverviewTab from "@/components/admin/analytics/OverviewTab";
import ProductsTab from "@/components/admin/analytics/ProductsTab";
import BookletsTab from "@/components/admin/analytics/BookletsTab";
import WorkshopsTab from "@/components/admin/analytics/WorkshopsTab";
import { parsePeriod, periodLabel, type StatsPeriod } from "@/lib/stats/period";

export const dynamic = "force-dynamic";
export const metadata = { title: "التحليلات — لوحة Momzy" };

/** السطر تحت العنوان — يصف ما تعرضه الأرقام */
function subtitle(tab: AnalyticsTab, period: StatsPeriod): string {
  return tab === "overview" ? "آخر 30 يوم · المبيعات المدفوعة فقط" : `${periodLabel(period)} · المدفوع فقط`;
}

/**
 * التحليلات — «نظرة عامة» على الزيارات والمبيعات كلها، وتبويب لكل فئة:
 * المنتجات والكتيبات والورشات، بأرقامها منفصلة.
 * التبويب والفترة في الرابط (?tab= &days=)، فكل تبويب يجلب بياناته وحده.
 */
export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; days?: string }>;
}) {
  const params = await searchParams;
  const tab = parseTab(params.tab);
  const period = parsePeriod(params.days);

  return (
    <div>
      <h1 className="font-heading text-h2 font-bold text-dark mb-1">التحليلات</h1>
      <p className="text-mid text-body-sm mb-5">{subtitle(tab, period)}</p>

      <AnalyticsNav tab={tab} period={period} />

      {tab === "overview" && <OverviewTab />}
      {tab === "products" && <ProductsTab period={period} />}
      {tab === "booklets" && <BookletsTab period={period} />}
      {tab === "workshops" && <WorkshopsTab period={period} />}
    </div>
  );
}
