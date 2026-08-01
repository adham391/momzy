import Link from "next/link";
import { TrendingUp, ShoppingBag, Truck, CalendarDays, ArrowLeft } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getDashboardStats } from "@/lib/db/dashboard";
import { formatILS, formatDate } from "@/lib/utils/format";
import { OrderStatusBadge } from "@/components/admin/StatusBadge";

export const metadata = { title: "الرئيسية — لوحة Momzy" };

// لوحة التحكم تعرض بيانات حيّة — لا كاش
export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const stats = await getDashboardStats();

  return (
    <div>
      <h1 className="font-heading text-h2 font-bold text-dark mb-1">لوحة التحكم</h1>
      <p className="text-mid text-body-sm mb-6">نظرة سريعة على متجر Momzy</p>

      {/* ── بطاقات الإحصائيات ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <StatCard icon={TrendingUp} label="مبيعات اليوم" value={formatILS(stats.salesToday)} />
        <StatCard icon={TrendingUp} label="مبيعات الأسبوع" value={formatILS(stats.salesWeek)} />
        <StatCard icon={TrendingUp} label="مبيعات الشهر" value={formatILS(stats.salesMonth)} />
        <StatCard icon={ShoppingBag} label="طلبات جديدة" value={String(stats.newOrdersCount)} accent />
      </div>

      {/* ── تنبيهات ── */}
      {(stats.unshippedCount > 0 || stats.todayBookingsCount > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-6">
          {stats.unshippedCount > 0 && (
            <AlertCard
              icon={Truck}
              href="/admin/orders?status=pending"
              text={`${stats.unshippedCount} طلب بحاجة للمتابعة والشحن`}
            />
          )}
          {stats.todayBookingsCount > 0 && (
            <AlertCard
              icon={CalendarDays}
              href="/admin/bookings"
              text={`${stats.todayBookingsCount} حجز اليوم`}
            />
          )}
        </div>
      )}

      {/* ── أحدث الطلبات + الحجوزات ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* أحدث الطلبات */}
        <Panel title="أحدث الطلبات" href="/admin/orders">
          {stats.recentOrders.length === 0 ? (
            <Empty text="لا توجد طلبات بعد" />
          ) : (
            <ul className="flex flex-col divide-y divide-bord">
              {stats.recentOrders.map((o) => (
                <li key={o.id}>
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="flex items-center gap-3 py-3 first:pt-0 hover:opacity-70 transition-opacity"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-label font-bold text-dark text-body-sm" style={{ direction: "ltr", textAlign: "right" }}>
                        {o.order_number}
                      </div>
                      <div className="text-micro text-light truncate">{o.customer_name}</div>
                    </div>
                    <OrderStatusBadge status={o.order_status} />
                    <span className="font-label font-extrabold text-teal text-body-sm shrink-0 w-20 text-left">
                      {formatILS(o.total_amount)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* أحدث الحجوزات */}
        <Panel title="أحدث الحجوزات" href="/admin/bookings">
          {stats.recentBookings.length === 0 ? (
            <Empty text="نظام الحجوزات قيد الإنشاء" />
          ) : (
            <ul className="flex flex-col divide-y divide-bord">
              {stats.recentBookings.map((b) => (
                <li key={b.id} className="flex items-center gap-3 py-3 first:pt-0">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-dark text-body-sm truncate">{b.customer_name}</div>
                    <div className="text-micro text-light truncate">{b.service_name ?? "—"}</div>
                  </div>
                  <span className="text-micro text-light">{formatDate(b.date)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

/* ── مكوّنات ── */

function StatCard({
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
          <Icon size={17} className={accent ? "text-rose" : "text-teal"} />
        </span>
        <span className="text-micro text-light font-label">{label}</span>
      </div>
      <div className="font-label font-extrabold text-dark text-[22px]">{value}</div>
    </div>
  );
}

function AlertCard({ icon: Icon, href, text }: { icon: LucideIcon; href: string; text: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 bg-white rounded-[var(--r)] border border-bord p-4 hover:border-rose transition-colors"
    >
      <span className="w-9 h-9 rounded-lg bg-rosepale flex items-center justify-center shrink-0">
        <Icon size={18} className="text-rose" />
      </span>
      <span className="flex-1 text-body-sm text-dark font-semibold">{text}</span>
      <ArrowLeft size={16} className="text-light" />
    </Link>
  );
}

function Panel({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-[var(--rl)] border border-bord p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading font-bold text-dark text-body">{title}</h2>
        <Link href={href} className="text-micro text-teal font-bold hover:underline">
          الكل ←
        </Link>
      </div>
      {children}
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-center text-light text-body-sm py-8">{text}</p>;
}
