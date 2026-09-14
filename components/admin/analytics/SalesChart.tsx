import { formatILS, formatDate, formatMonth } from "@/lib/utils/format";
import type { SeriesGranularity } from "@/lib/stats/period";

/** نقطة يرسمها المخطط — يوم أو شهر، وإيراده */
export interface ChartPoint {
  date: string;
  revenue: number;
}

const WIDTH = 700;
const HEIGHT = 180;
/** فراغ تحت الأعمدة لخطّ القاعدة */
const BASELINE_GAP = 6;
const BAR_GAP = 3;
/** أعرض عمود — كي لا يتمدّد عمود أو اثنان على عرض المخطط كله */
const MAX_BAR_WIDTH = 48;
/** أنحف عمود — حين تكثر النقاط حتى تضيق خاناتها */
const MIN_BAR_WIDTH = 1;
/** أدنى ارتفاع لعمود فيه مبيعات — كي يُرى البيع الصغير */
const MIN_FILLED_HEIGHT = 2;

/** تسمية النقطة: تاريخ اليوم، أو «شهر/سنة» */
function pointLabel(date: string, granularity: SeriesGranularity): string {
  return granularity === "day" ? formatDate(date) : formatMonth(date);
}

/**
 * مخطط أعمدة SVG للإيرادات (بلا مكتبات).
 * الزمن يجري من اليمين إلى اليسار كقراءة الصفحة: الأقدم يمينًا والأحدث يسارًا،
 * مطابقًا لتسميتي التاريخ تحته.
 */
export default function SalesChart({
  data,
  title,
  granularity = "day",
}: {
  data: ChartPoint[];
  title: string;
  granularity?: SeriesGranularity;
}) {
  const count = data.length;
  if (count === 0) return null;

  const chartHeight = HEIGHT - BASELINE_GAP;
  // لكل نقطة خانة بعرض متساوٍ، والعمود في وسطها: الأعمدة القليلة (أشهر «الكل»)
  // تتوزّع على عرض المخطط كله بدل أن تتكدّس في طرفه بعيدًا عن تسميتي التاريخ
  const slotWidth = WIDTH / count;
  const barWidth = Math.max(MIN_BAR_WIDTH, Math.min(MAX_BAR_WIDTH, slotWidth - BAR_GAP));
  const peak = Math.max(0, ...data.map((point) => point.revenue));
  const scale = Math.max(1, peak);
  const total = data.reduce((sum, point) => sum + point.revenue, 0);

  return (
    <div className="bg-white rounded-[var(--rl)] border border-bord p-5 mb-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading font-bold text-dark text-body">{title}</h2>
        <span className="font-label font-extrabold text-teal">{formatILS(total)}</span>
      </div>

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label={title}>
        {data.map((point, i) => {
          const height = (point.revenue / scale) * chartHeight;
          const filled = point.revenue > 0;
          return (
            <rect
              key={point.date}
              x={WIDTH - (i + 1) * slotWidth + (slotWidth - barWidth) / 2}
              y={chartHeight - (filled ? Math.max(height, MIN_FILLED_HEIGHT) : 1)}
              width={barWidth}
              height={filled ? Math.max(height, MIN_FILLED_HEIGHT) : 1}
              rx={2}
              fill="var(--rose)"
              opacity={filled ? 1 : 0.15}
            />
          );
        })}
        <line x1={0} y1={chartHeight} x2={WIDTH} y2={chartHeight} stroke="var(--bord)" strokeWidth={1} />
      </svg>

      <div className="flex justify-between text-micro text-light mt-2">
        <span>{pointLabel(data[0].date, granularity)}</span>
        <span>
          {granularity === "day" ? "الأعلى في يوم" : "الأعلى في شهر"}: {formatILS(peak)}
        </span>
        {/* نقطة واحدة (شهر «الكل» الأول) — تسمية واحدة لا اثنتان متطابقتان */}
        {count > 1 && <span>{pointLabel(data[count - 1].date, granularity)}</span>}
      </div>
    </div>
  );
}
