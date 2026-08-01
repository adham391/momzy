import { Users, ShoppingBag, Percent } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  getTrafficSources,
  getSalesBySource,
  getBestSellers,
  getDailySales,
  getConversionRate,
} from "@/lib/db/analytics";
import SalesChart from "@/components/admin/analytics/SalesChart";
import UtmGenerator from "@/components/admin/analytics/UtmGenerator";
import { formatILS } from "@/lib/utils/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "التحليلات — لوحة Momzy" };

export default async function AdminAnalyticsPage() {
  const [sources, salesBySource, bestSellers, dailySales, conversion] = await Promise.all([
    getTrafficSources(30),
    getSalesBySource(30),
    getBestSellers(30),
    getDailySales(30),
    getConversionRate(30),
  ]);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://momzyworld.com";
  const maxSourceCount = Math.max(1, ...sources.map((s) => s.count));
  const maxSourceRevenue = Math.max(1, ...salesBySource.map((s) => s.revenue));
  const maxSellerQty = Math.max(1, ...bestSellers.map((b) => b.quantity));

  return (
    <div>
      <h1 className="font-heading text-h2 font-bold text-dark mb-1">التحليلات</h1>
      <p className="text-mid text-body-sm mb-6">آخر 30 يوم</p>

      {/* ── بطاقات ── */}
      <div className="grid grid-cols-3 gap-3 md:gap-4 mb-5">
        <Stat icon={Users} label="الجلسات" value={String(conversion.sessions)} />
        <Stat icon={ShoppingBag} label="الطلبات" value={String(conversion.purchases)} accent />
        <Stat icon={Percent} label="معدّل التحويل" value={`${conversion.rate.toFixed(1)}%`} />
      </div>

      {/* ── مخطط المبيعات ── */}
      <SalesChart data={dailySales} />

      {/* ── المصادر + المبيعات حسب المصدر ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <Panel title="مصادر الزيارات">
          {sources.length === 0 ? (
            <Empty text="لا زيارات بعد" />
          ) : (
            sources.map((s) => (
              <BarRow key={s.source} label={s.source} value={`${s.count}`} ratio={s.count / maxSourceCount} />
            ))
          )}
        </Panel>

        <Panel title="المبيعات حسب المصدر">
          {salesBySource.length === 0 ? (
            <Empty text="لا مبيعات بعد" />
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
            <Empty text="لا مبيعات بعد" />
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

/* ── مكوّنات ── */

function Stat({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-white rounded-[var(--rl)] border border-bord p-4">
      <div className="flex items-center gap-2 mb-2">
        <span
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: accent ? "var(--rosepale)" : "var(--tealpale)" }}
        >
          <Icon size={16} className={accent ? "text-rose" : "text-teal"} />
        </span>
        <span className="text-micro text-light font-label">{label}</span>
      </div>
      <div className="font-label font-extrabold text-dark text-[22px]">{value}</div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-[var(--rl)] border border-bord p-5 h-full">
      <h2 className="font-heading font-bold text-dark text-body mb-4">{title}</h2>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

function BarRow({
  label,
  value,
  sub,
  ratio,
  tone = "rose",
}: {
  label: string;
  value: string;
  sub?: string;
  ratio: number;
  tone?: "rose" | "teal";
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-body-sm text-dark font-semibold truncate">{label}</span>
        <span className="text-body-sm font-bold shrink-0 mr-2" style={{ color: tone === "teal" ? "var(--teal)" : "var(--dark)" }}>
          {value}
          {sub ? <span className="text-micro text-light font-normal"> · {sub}</span> : null}
        </span>
      </div>
      <div className="h-2 rounded-full bg-cream overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.max(4, ratio * 100)}%`, background: tone === "teal" ? "var(--teal)" : "var(--rose)" }}
        />
      </div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-center text-light text-body-sm py-6">{text}</p>;
}
