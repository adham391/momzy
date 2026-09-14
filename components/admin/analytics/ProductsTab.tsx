import { Clock, Coins, Package, ShoppingBag } from "lucide-react";
import { getProductStats } from "@/lib/db/categoryStats";
import type { StoreItemStat, StoreStats } from "@/lib/stats/aggregate";
import { periodLabel, type StatsPeriod } from "@/lib/stats/period";
import { formatILS } from "@/lib/utils/format";
import SalesChart from "./SalesChart";
import { BarRow, EmptyState, Panel, StatCard, StatsNote, maxOf } from "./blocks";

/** تبويب المنتجات الفيزيائية — يجلب الأرقام ثم يرسمها */
export default async function ProductsTab({ period }: { period: StatsPeriod }) {
  return <ProductsView stats={await getProductStats(period)} period={period} />;
}

/** تفاصيل صف منتج: الزوّار والسلة والمخزون والهدايا */
function productDetails(item: StoreItemStat): string[] {
  return [
    `${item.views} مشاهدة`,
    `${item.addToCart} إضافة للسلة`,
    item.stock === null ? "المخزون بلا حدّ" : `المخزون المتبقي ${item.stock}`,
    ...(item.gifts > 0 ? [`منها ${item.gifts} هدية`] : []),
  ];
}

/** عرض أرقام المنتجات — بلا جلب، فيُرسم بأي بيانات */
export function ProductsView({ stats, period }: { stats: StoreStats; period: StatsPeriod }) {
  const maxRevenue = maxOf(stats.items, (item) => item.revenue);

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-5">
        <StatCard icon={Coins} label="قيمة المبيعات" value={formatILS(stats.revenue)} tone="rose" />
        <StatCard
          icon={Package}
          label="القطع المباعة"
          value={String(stats.units)}
          hint={stats.gifts > 0 ? `منها ${stats.gifts} هدية` : undefined}
        />
        <StatCard icon={ShoppingBag} label="الطلبات المدفوعة" value={String(stats.orders)} />
        <StatCard
          icon={Clock}
          label="بانتظار الدفع"
          value={String(stats.unpaidOrders)}
          hint="طلبات لم يكتمل دفعها"
        />
      </div>

      <SalesChart
        data={stats.series}
        granularity={stats.granularity}
        title={`مبيعات المنتجات — ${periodLabel(period)}`}
      />

      <Panel title="كل منتج">
        {stats.items.length === 0 ? (
          <EmptyState text="لا منتجات بعد" />
        ) : (
          stats.items.map((item) => (
            <BarRow
              key={item.slug}
              label={item.name}
              value={formatILS(item.revenue)}
              sub={`${item.units} قطعة`}
              ratio={item.revenue / maxRevenue}
              tone="teal"
              details={productDetails(item)}
            />
          ))
        )}
      </Panel>

      <StatsNote>
        تُحسب الطلبات المدفوعة فقط. قيمة المبيعات قبل خصم الكوبونات ودون الشحن. المشاهدات وإضافات السلة
        في الفترة نفسها، والمخزون هو المتبقي الآن.
      </StatsNote>
    </div>
  );
}
