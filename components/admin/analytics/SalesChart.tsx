import { formatILS, formatDate } from "@/lib/utils/format";
import type { DailySales } from "@/lib/db/analytics";

/** رسم أعمدة SVG للمبيعات اليومية (Tailwind فقط، بلا مكتبات) */
export default function SalesChart({ data }: { data: DailySales[] }) {
  const W = 700;
  const H = 180;
  const chartH = H - 6;
  const n = data.length;
  const gap = 3;
  const barW = (W - gap * (n - 1)) / n;
  const max = Math.max(1, ...data.map((d) => d.revenue));
  const total = data.reduce((s, d) => s + d.revenue, 0);

  return (
    <div className="bg-white rounded-[var(--rl)] border border-bord p-5 mb-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading font-bold text-dark text-body">مبيعات آخر 30 يوم</h2>
        <span className="font-label font-extrabold text-teal">{formatILS(total)}</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="مخطط المبيعات اليومية">
        {data.map((d, i) => {
          const h = (d.revenue / max) * chartH;
          const x = i * (barW + gap);
          return (
            <rect
              key={i}
              x={x}
              y={chartH - h}
              width={barW}
              height={d.revenue > 0 ? Math.max(h, 2) : 1}
              rx={2}
              fill="var(--rose)"
              opacity={d.revenue > 0 ? 1 : 0.15}
            />
          );
        })}
        <line x1={0} y1={chartH} x2={W} y2={chartH} stroke="var(--bord)" strokeWidth={1} />
      </svg>

      <div className="flex justify-between text-micro text-light mt-2">
        <span>{formatDate(data[0].date)}</span>
        <span>الأعلى يوميًا: {formatILS(max)}</span>
        <span>{formatDate(data[n - 1].date)}</span>
      </div>
    </div>
  );
}
