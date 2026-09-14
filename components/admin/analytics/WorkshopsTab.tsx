import { Armchair, CalendarCheck, Coins, Hourglass } from "lucide-react";
import { getWorkshopStats } from "@/lib/db/categoryStats";
import type { WorkshopItemStat, WorkshopStats } from "@/lib/stats/aggregate";
import { periodLabel, type StatsPeriod } from "@/lib/stats/period";
import { formatILS } from "@/lib/utils/format";
import SalesChart from "./SalesChart";
import { BarRow, EmptyState, Panel, StatCard, StatsNote, maxOf } from "./blocks";

/** تبويب الورشات واللقاءات — يجلب الأرقام ثم يرسمها */
export default async function WorkshopsTab({ period }: { period: StatsPeriod }) {
  return <WorkshopsView stats={await getWorkshopStats(period)} period={period} />;
}

/** تفاصيل صف ورشة: الزوّار والجلسات القادمة والمقاعد والانتظار */
function workshopDetails(item: WorkshopItemStat): string[] {
  return [
    `${item.views} مشاهدة`,
    item.upcomingSessions > 0 ? `${item.upcomingSessions} جلسة قادمة` : "لا جلسات قادمة",
    ...(item.seatsTotal > 0 ? [`${item.seatsBooked} من ${item.seatsTotal} مقعد محجوز`] : []),
    ...(item.waitlist > 0 ? [`${item.waitlist} في قائمة الانتظار`] : []),
  ];
}

/** عرض أرقام الورشات — بلا جلب، فيُرسم بأي بيانات */
export function WorkshopsView({ stats, period }: { stats: WorkshopStats; period: StatsPeriod }) {
  const maxRevenue = maxOf(stats.items, (item) => item.revenue);

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-5">
        <StatCard icon={Coins} label="الإيرادات" value={formatILS(stats.revenue)} tone="rose" />
        <StatCard
          icon={CalendarCheck}
          label="التسجيلات المدفوعة"
          value={String(stats.registrations)}
          hint={stats.unpaid > 0 ? `و${stats.unpaid} بانتظار الدفع` : undefined}
        />
        <StatCard
          icon={Armchair}
          label="المقاعد المحجوزة الآن"
          value={stats.seatsTotal > 0 ? `${stats.seatsBooked} من ${stats.seatsTotal}` : "0"}
          hint={`${stats.upcomingSessions} جلسة قادمة`}
        />
        <StatCard icon={Hourglass} label="قائمة الانتظار" value={String(stats.waitlist)} hint="لم يُشعَرن بعد" />
      </div>

      <SalesChart
        data={stats.series}
        granularity={stats.granularity}
        title={`إيرادات الورشات — ${periodLabel(period)}`}
      />

      <Panel title="كل ورشة ولقاء">
        {stats.items.length === 0 ? (
          <EmptyState text="لا ورشات بعد" />
        ) : (
          stats.items.map((item) => (
            <BarRow
              key={item.key}
              label={item.name}
              value={formatILS(item.revenue)}
              sub={`${item.registrations} تسجيل`}
              ratio={item.revenue / maxRevenue}
              tone="teal"
              details={workshopDetails(item)}
            />
          ))
        )}
      </Panel>

      <StatsNote>
        التسجيلات والإيرادات للتسجيلات المدفوعة في الفترة. الجلسات القادمة ومقاعدها وقائمة الانتظار هي
        الوضع الحالي، لا الفترة.
      </StatsNote>
    </div>
  );
}
