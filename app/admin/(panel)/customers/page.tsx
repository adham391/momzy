import { Users } from "lucide-react";
import { getCustomers } from "@/lib/db/customers";
import SearchInput from "@/components/admin/SearchInput";
import { formatILS, formatDate } from "@/lib/utils/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "العملاء — لوحة Momzy" };

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function AdminCustomersPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const customers = await getCustomers(q);

  return (
    <div>
      <h1 className="font-heading text-h2 font-bold text-dark mb-1">العملاء</h1>
      <p className="text-mid text-body-sm mb-6">
        {customers.length} عميل — مُجمَّعون من الطلبات
      </p>

      <SearchInput defaultValue={q ?? ""} placeholder="بحث بالاسم أو الإيميل أو الهاتف" />

      {customers.length === 0 ? (
        <div className="bg-white rounded-[var(--rl)] border border-bord py-16 text-center">
          <Users size={40} className="mx-auto text-light mb-3" strokeWidth={1.5} />
          <p className="text-mid text-body-sm">لا يوجد عملاء بعد</p>
        </div>
      ) : (
        <>
          {/* جدول (ديسكتوب) */}
          <div className="hidden md:block bg-white rounded-[var(--rl)] border border-bord overflow-hidden">
            <table className="w-full text-body-sm">
              <thead>
                <tr className="text-right text-light border-b border-bord bg-cream/50">
                  <th className="p-3.5 font-label font-bold text-micro">الاسم</th>
                  <th className="p-3.5 font-label font-bold text-micro">الإيميل</th>
                  <th className="p-3.5 font-label font-bold text-micro">الهاتف</th>
                  <th className="p-3.5 font-label font-bold text-micro">الطلبات</th>
                  <th className="p-3.5 font-label font-bold text-micro">إجمالي الإنفاق</th>
                  <th className="p-3.5 font-label font-bold text-micro">آخر طلب</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.email} className="border-b border-bord last:border-0 hover:bg-cream/40 transition-colors">
                    <td className="p-3.5 font-semibold text-dark">{c.name}</td>
                    <td className="p-3.5 text-mid" style={{ direction: "ltr", textAlign: "right" }}>{c.email}</td>
                    <td className="p-3.5 text-mid" style={{ direction: "ltr", textAlign: "right" }}>{c.phone}</td>
                    <td className="p-3.5 text-dark font-bold">{c.orderCount}</td>
                    <td className="p-3.5 font-label font-extrabold text-teal">{formatILS(c.totalSpent)}</td>
                    <td className="p-3.5 text-light whitespace-nowrap">{formatDate(c.lastOrderAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* بطاقات (جوال) */}
          <div className="md:hidden flex flex-col gap-3">
            {customers.map((c) => (
              <div key={c.email} className="bg-white rounded-[var(--r)] border border-bord p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-dark">{c.name}</span>
                  <span className="font-label font-extrabold text-teal text-body-sm">{formatILS(c.totalSpent)}</span>
                </div>
                <div className="text-micro text-light mb-0.5" style={{ direction: "ltr", textAlign: "right" }}>{c.email}</div>
                <div className="text-micro text-light mb-2" style={{ direction: "ltr", textAlign: "right" }}>{c.phone}</div>
                <div className="flex items-center justify-between text-micro text-mid">
                  <span>{c.orderCount} طلب</span>
                  <span className="text-light">{formatDate(c.lastOrderAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
