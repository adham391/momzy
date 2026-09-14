import { Users, ShoppingBag, Percent } from "lucide-react";
import {
  getTrafficSources,
  getSalesBySource,
  getBestSellers,
  getDailySales,
  getConversionRate,
} from "@/lib/db/analytics";
import { formatILS } from "@/lib/utils/format";
import SalesChart from "./SalesChart";
import UtmGenerator from "./UtmGenerator";
import { BarRow, EmptyState, Panel, StatCard, maxOf } from "./blocks";

/** أيام «نظرة عامة» — ثابتة كما كانت الصفحة قبل التبويبات */
const OVERVIEW_DAYS = 30;

/** نظرة عامة: الزيارات ومصادرها، والتحويل، والمبيعات كلها، ومولّد روابط UTM */
export default async function OverviewTab() {
  const [sources, salesBySource, bestSellers, dailySales, conversion] = await Promise.all([
    getTrafficSources(OVERVIEW_DAYS),
    getSalesBySource(OVERVIEW_DAYS),
    getBestSellers(OVERVIEW_DAYS),
    getDailySales(OVERVIEW_DAYS),
    getConversionRate(OVERVIEW_DAYS),
  ]);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://momzyworld.com";
  const maxSourceCount = maxOf(sources, (s) => s.count);
  const maxSourceRevenue = maxOf(salesBySource, (s) => s.revenue);
  const maxSellerQty = maxOf(bestSellers, (b) => b.quantity);

  return (
    <div>
      {/* ── بطاقات ── */}
      <div className="grid grid-cols-3 gap-3 md:gap-4 mb-5">
        <StatCard icon={Users} label="الجلسات" value={String(conversion.sessions)} />
        <StatCard icon={ShoppingBag} label="الطلبات المدفوعة" value={String(conversion.purchases)} tone="rose" />
        <StatCard icon={Percent} label="معدّل التحويل" value={`${conversion.rate.toFixed(1)}%`} />
      </div>

      {/* ── مخطط المبيعات ── */}
      <SalesChart data={dailySales} title={`مبيعات آخر ${OVERVIEW_DAYS} يوم`} />

      {/* ── المصادر + المبيعات حسب المصدر ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <Panel title="مصادر الزيارات">
          {sources.length === 0 ? (
            <EmptyState text="لا زيارات بعد" />
          ) : (
            sources.map((s) => (
              <BarRow key={s.source} label={s.source} value={`${s.count}`} ratio={s.count / maxSourceCount} />
            ))
          )}
        </Panel>

        <Panel title="المبيعات حسب المصدر">
          {salesBySource.length === 0 ? (
            <EmptyState text="لا مبيعات بعد" />
          ) : (
            salesBySource.map((s) => (
              <BarRow
                key={s.source}
                label={s.source}
                value={formatILS(s.revenue)}
                sub={`${s.orders} طلب`}
                ratio={s.revenue / maxSourceRevenue}
                tone="teal"
              />
            ))
          )}
        </Panel>
      </div>

      {/* ── أفضل المنتجات ── */}
      <div className="mb-5">
        <Panel title="الأكثر مبيعًا">
          {bestSellers.length === 0 ? (
            <EmptyState text="لا مبيعات بعد" />
          ) : (
            bestSellers.map((b) => (
              <BarRow
                key={b.name}
                label={b.name}
                value={`${b.quantity} قطعة`}
                sub={formatILS(b.revenue)}
                ratio={b.quantity / maxSellerQty}
                tone="teal"
              />
            ))
          )}
        </Panel>
      </div>

      {/* ── مولّد UTM ── */}
      <UtmGenerator baseUrl={baseUrl} />
    </div>
  );
}
