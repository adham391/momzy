"use client";

import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const STATUSES = [
  { value: "all",       label: "الكل" },
  { value: "pending",   label: "بانتظار التأكيد" },
  { value: "confirmed", label: "مؤكّد" },
  { value: "completed", label: "مكتمل" },
  { value: "cancelled", label: "ملغى" },
];

/** فلاتر الحجوزات — حالة + تاريخ (تحدّث الـ URL) */
export default function BookingsFilterBar({ status, date }: { status: string; date: string }) {
  const router = useRouter();
  const pathname = usePathname();

  function apply(next: { status?: string; date?: string }) {
    const s = next.status ?? status;
    const d = next.date ?? date;
    const params = new URLSearchParams();
    if (s && s !== "all") params.set("status", s);
    if (d) params.set("date", d);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => apply({ status: s.value })}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-body-sm font-label transition-colors",
              status === s.value ? "bg-dark text-white" : "bg-white border border-bord text-mid hover:text-dark"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
      <input
        type="date"
        defaultValue={date}
        onChange={(e) => apply({ date: e.target.value })}
        className="px-3 py-2 rounded-xl border border-bord bg-white text-body-sm text-dark focus:outline-none focus:border-rose"
      />
    </div>
  );
}
