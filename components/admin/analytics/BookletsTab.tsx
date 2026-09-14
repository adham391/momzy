import { BookOpen, Clock, Coins, Eye } from "lucide-react";
import { getBookletStats } from "@/lib/db/categoryStats";
import { EMPTY_READING, type BookletStats, type StoreItemStat } from "@/lib/stats/aggregate";
import { periodLabel, type StatsPeriod } from "@/lib/stats/period";
import { formatILS } from "@/lib/utils/format";
import SalesChart from "./SalesChart";
import { BarRow, EmptyState, Panel, StatCard, StatsNote, maxOf } from "./blocks";

/** تبويب الكتيبات الرقمية — يجلب الأرقام ثم يرسمها */
export default async function BookletsTab({ period }: { period: StatsPeriod }) {
  return <BookletsView stats={await getBookletStats(period)} period={period} />;
}

/** نسبة مئوية صحيحة — صفر حين لا مقام */
function percent(part: number, whole: number): number {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}

/** تفاصيل صف كتيب: الزوّار والسلة والقراءة والهدايا */
function bookletDetails(item: StoreItemStat, stats: BookletStats): string[] {
  const reading = stats.readingBySlug[item.slug] ?? EMPTY_READING;
  return [
    `${item.views} مشاهدة`,
    `${item.addToCart} إضافة للسلة`,
    `فُتح ${reading.opened} من ${reading.links} رابط`,
    `${reading.opens} مرة قراءة`,
    ...(item.gifts > 0 ? [`منها ${item.gifts} هدية`] : []),
  ];
}

/** عرض أرقام الكتيبات — بلا جلب، فيُرسم بأي بيانات */
export function BookletsView({ stats, period }: { stats: BookletStats; period: StatsPeriod }) {
  const maxRevenue = maxOf(stats.items, (item) => item.revenue);
  const { reading } = stats;

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-5">
        <StatCard icon={Coins} label="قيمة المبيعات" value={formatILS(stats.revenue)} tone="rose" />
        <StatCard
          icon={BookOpen}
          label="النسخ المباعة"
          value={String(stats.units)}
          hint={stats.gifts > 0 ? `منها ${stats.gifts} هدية` : undefined}
        />
        <StatCard
          icon={Eye}
          label="فُتح رابط القراءة"
          value={`${percent(reading.opened, reading.links)}%`}
          hint={`${reading.opened} من ${reading.links} · ${reading.opens} مرة قراءة`}
        />
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
        title={`مبيعات الكتيبات — ${periodLabel(period)}`}
      />

      <Panel title="كل كتيب">
        {stats.items.length === 0 ? (
          <EmptyState text="لا كتيبات بعد" />
        ) : (
          stats.items.map((item) => (
            <BarRow
              key={item.slug}
              label={item.name}
              value={formatILS(item.revenue)}
              sub={`${item.units} نسخة`}
              ratio={item.revenue / maxRevenue}
              tone="teal"
              details={bookletDetails(item, stats)}
            />
          ))
        )}
      </Panel>

      <StatsNote>
        تُحسب الطلبات المدفوعة فقط، وقيمة المبيعات قبل خصم الكوبونات. «فُتح» يعني أنّ رابط القراءة
        فُتح مرة واحدة على الأقل؛ الرابط يبقى صالحًا مدى الحياة، فتُحسب كل مرات قراءته.
      </StatsNote>
    </div>
  );
}
