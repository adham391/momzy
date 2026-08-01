"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const STATUSES = [
  { value: "all",       label: "الكل" },
  { value: "pending",   label: "قيد الانتظار" },
  { value: "confirmed", label: "مؤكّد" },
  { value: "shipped",   label: "تم الشحن" },
  { value: "delivered", label: "تم التوصيل" },
  { value: "cancelled", label: "ملغى" },
];

/** شريط فلاتر الطلبات — يحدّث معاملات الـ URL (تقرأها صفحة السيرفر) */
export default function OrdersFilterBar({
  status,
  search,
}: {
  status: string;
  search: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(search);

  function apply(next: { status?: string; q?: string }) {
    const nextStatus = next.status ?? status;
    const nextQ = next.q ?? q;
    const params = new URLSearchParams();
    if (nextStatus && nextStatus !== "all") params.set("status", nextStatus);
    if (nextQ && nextQ.trim()) params.set("q", nextQ.trim());
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="flex flex-col gap-3 mb-5">
      {/* أزرار الحالة */}
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => {
          const active = status === s.value;
          return (
            <button
              key={s.value}
              onClick={() => apply({ status: s.value })}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-body-sm font-label transition-colors",
                active
                  ? "bg-dark text-white"
                  : "bg-white border border-bord text-mid hover:text-dark"
              )}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* بحث */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          apply({ q });
        }}
        className="relative max-w-md"
      >
        <Search
          size={17}
          className="absolute top-1/2 -translate-y-1/2 right-3.5 text-light pointer-events-none"
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="بحث برقم الطلب أو الاسم أو الهاتف أو الإيميل"
          className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-bord bg-white text-body-sm text-dark placeholder:text-light focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/20 transition"
        />
      </form>
    </div>
  );
}
