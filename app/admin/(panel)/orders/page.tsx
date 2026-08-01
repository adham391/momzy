import Link from "next/link";
import { PackageOpen, Download } from "lucide-react";
import { listOrdersForAdmin } from "@/lib/db/orders";
import type { OrderStatus } from "@/lib/db/types";
import OrdersFilterBar from "@/components/admin/orders/OrdersFilterBar";
import { OrderStatusBadge } from "@/components/admin/StatusBadge";
import { formatILS, formatDate } from "@/lib/utils/format";

// قائمة لحظية — الطلبات الجديدة تظهر فورًا بلا تخزين مؤقت
export const dynamic = "force-dynamic";

export const metadata = { title: "الطلبات — لوحة Momzy" };

interface PageProps {
  searchParams: Promise<{ status?: string; q?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const status = sp.status ?? "all";
  const search = sp.q ?? "";

  const orders = await listOrdersForAdmin({
    status: status as OrderStatus | "all",
    search,
  });

  // رابط تصدير الشحن — يحترم الفلتر الحالي
  const exportParams = new URLSearchParams();
  if (status !== "all") exportParams.set("status", status);
  if (search) exportParams.set("q", search);
  const exportHref = `/api/admin/orders/export${exportParams.toString() ? `?${exportParams.toString()}` : ""}`;

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-1">
        <h1 className="font-heading text-h2 font-bold text-dark">الطلبات</h1>
        <a
          href={exportHref}
          className="inline-flex items-center gap-1.5 text-body-sm text-teal font-bold hover:underline shrink-0"
        >
          <Download size={15} /> تصدير للشحن (CSV)
        </a>
      </div>
      <p className="text-mid text-body-sm mb-6">{orders.length} طلب</p>

      <OrdersFilterBar status={status} search={search} />

      {orders.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* ── جدول (ديسكتوب) ── */}
          <div className="hidden md:block bg-white rounded-[var(--rl)] border border-bord overflow-hidden">
            <table className="w-full text-body-sm">
              <thead>
                <tr className="text-right text-light border-b border-bord bg-cream/50">
                  <Th>رقم الطلب</Th>
                  <Th>العميل</Th>
                  <Th>المنتجات</Th>
                  <Th>الإجمالي</Th>
                  <Th>الحالة</Th>
                  <Th>التاريخ</Th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr
                    key={o.id}
                    className="border-b border-bord last:border-0 hover:bg-cream/40 transition-colors"
                  >
                    <td className="p-3.5">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="font-label font-bold text-dark hover:text-rose"
                        style={{ direction: "ltr", display: "inline-block" }}
                      >
                        {o.order_number}
                      </Link>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-dark">{o.customer_name}</div>
                      <div className="text-micro text-light" style={{ direction: "ltr", textAlign: "right" }}>
                        {o.customer_phone}
                      </div>
                    </td>
                    <td className="p-3.5 text-mid max-w-[220px] truncate">{o.productSummary || "—"}</td>
                    <td className="p-3.5 font-label font-extrabold text-teal">{formatILS(o.total_amount)}</td>
                    <td className="p-3.5"><OrderStatusBadge status={o.order_status} /></td>
                    <td className="p-3.5 text-light whitespace-nowrap">{formatDate(o.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── بطاقات (جوال) ── */}
          <div className="md:hidden flex flex-col gap-3">
            {orders.map((o) => (
              <Link
                key={o.id}
                href={`/admin/orders/${o.id}`}
                className="bg-white rounded-[var(--r)] border border-bord p-4 block"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-label font-bold text-dark" style={{ direction: "ltr" }}>
                    {o.order_number}
                  </span>
                  <OrderStatusBadge status={o.order_status} />
                </div>
                <div className="font-semibold text-dark text-body-sm">{o.customer_name}</div>
                <div className="text-micro text-light mb-2" style={{ direction: "ltr", textAlign: "right" }}>
                  {o.customer_phone}
                </div>
                <div className="text-body-sm text-mid truncate mb-2">{o.productSummary || "—"}</div>
                <div className="flex items-center justify-between">
                  <span className="font-label font-extrabold text-teal">{formatILS(o.total_amount)}</span>
                  <span className="text-micro text-light">{formatDate(o.created_at)}</span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="p-3.5 font-label font-bold text-micro">{children}</th>;
}

function EmptyState() {
  return (
    <div className="bg-white rounded-[var(--rl)] border border-bord py-16 text-center">
      <PackageOpen size={40} className="mx-auto text-light mb-3" strokeWidth={1.5} />
      <p className="text-mid text-body-sm">لا توجد طلبات مطابقة</p>
    </div>
  );
}
