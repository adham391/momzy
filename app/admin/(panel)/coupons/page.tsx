import { Ticket } from "lucide-react";
import { listCoupons } from "@/lib/db/coupons";
import type { CouponRow } from "@/lib/db/coupons";
import CouponCreateForm from "@/components/admin/coupons/CouponCreateForm";
import { toggleCouponAction, deleteCouponAction } from "./actions";
import { formatILS, formatDate } from "@/lib/utils/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "الكوبونات — لوحة Momzy" };

export default async function AdminCouponsPage() {
  const coupons = await listCoupons();

  return (
    <div>
      <h1 className="font-heading text-h2 font-bold text-dark mb-1">الكوبونات</h1>
      <p className="text-mid text-body-sm mb-6">أنشئي أكواد خصم وتابعي استخدامها.</p>

      <CouponCreateForm />

      {coupons.length === 0 ? (
        <div className="bg-white rounded-[var(--rl)] border border-bord py-16 text-center">
          <Ticket size={40} className="mx-auto text-light mb-3" strokeWidth={1.5} />
          <p className="text-mid text-body-sm">لا توجد كوبونات بعد</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {coupons.map((c) => (
            <CouponRow key={c.id} coupon={c} />
          ))}
        </div>
      )}
    </div>
  );
}

function CouponRow({ coupon: c }: { coupon: CouponRow }) {
  const expired = c.expires_at ? new Date(c.expires_at) < new Date() : false;
  const valueLabel = c.type === "percentage" ? `${c.value}%` : formatILS(c.value);

  return (
    <div className="bg-white rounded-[var(--rl)] border border-bord p-4 flex flex-col sm:flex-row sm:items-center gap-4">
      {/* الكود + القيمة */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span className="w-11 h-11 rounded-xl bg-rosepale flex items-center justify-center shrink-0">
          <Ticket size={20} className="text-rose" />
        </span>
        <div className="min-w-0">
          <div className="font-label font-extrabold text-dark" style={{ direction: "ltr", textAlign: "right" }}>
            {c.code}
          </div>
          <div className="text-micro text-light">
            خصم {valueLabel}
            {c.min_order_amount > 0 ? ` · حد أدنى ${formatILS(c.min_order_amount)}` : ""}
          </div>
        </div>
      </div>

      {/* إحصائيات */}
      <div className="flex items-center gap-4 text-body-sm">
        <div className="text-center">
          <div className="font-bold text-dark">
            {c.used_count}
            {c.max_uses != null ? <span className="text-light">/{c.max_uses}</span> : ""}
          </div>
          <div className="text-micro text-light">استُخدم</div>
        </div>
        <div className="text-center">
          <div className={expired ? "text-rose font-bold" : "text-dark"}>
            {c.expires_at ? formatDate(c.expires_at) : "دائم"}
          </div>
          <div className="text-micro text-light">الانتهاء</div>
        </div>
      </div>

      {/* إجراءات */}
      <div className="flex items-center gap-2 shrink-0">
        <form action={toggleCouponAction}>
          <input type="hidden" name="id" value={c.id} />
          <input type="hidden" name="isActive" value={(!c.is_active).toString()} />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg text-body-sm font-bold border transition"
            style={
              c.is_active
                ? { background: "#DCFCE7", color: "#166534", borderColor: "#BBF7D0" }
                : { background: "#F3F4F6", color: "#6B7280", borderColor: "var(--bord)" }
            }
          >
            {c.is_active ? "مفعّل ✓" : "معطّل"}
          </button>
        </form>

        <form action={deleteCouponAction}>
          <input type="hidden" name="id" value={c.id} />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg text-body-sm font-bold text-rose border border-bord hover:bg-rosepale transition"
          >
            حذف
          </button>
        </form>
      </div>
    </div>
  );
}
