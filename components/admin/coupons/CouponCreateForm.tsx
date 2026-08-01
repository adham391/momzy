"use client";

import { useEffect, useRef } from "react";
import { useActionState } from "react";
import { createCouponAction, type CouponFormState } from "@/app/admin/(panel)/coupons/actions";

const INITIAL: CouponFormState = { error: null, success: false };

/** نموذج إنشاء كوبون — يُفرَّغ تلقائياً بعد النجاح */
export default function CouponCreateForm() {
  const [state, formAction, pending] = useActionState(createCouponAction, INITIAL);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state]);

  const inputCls =
    "w-full px-3 py-2.5 rounded-xl border border-bord bg-offwh text-body-sm text-dark placeholder:text-light focus:outline-none focus:border-rose";

  return (
    <form
      ref={formRef}
      action={formAction}
      className="bg-white rounded-[var(--rl)] border border-bord p-5 mb-6"
    >
      <h2 className="font-heading font-bold text-dark text-body mb-4">كوبون جديد</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <Field label="الكود">
          <input name="code" placeholder="SALE20" dir="ltr" className={`${inputCls} text-left uppercase`} required />
        </Field>
        <Field label="النوع">
          <select name="type" defaultValue="percentage" className={inputCls}>
            <option value="percentage">نسبة %</option>
            <option value="fixed">مبلغ ثابت ₪</option>
          </select>
        </Field>
        <Field label="القيمة">
          <input name="value" type="number" min={1} placeholder="20" className={inputCls} required />
        </Field>
        <Field label="حد أدنى للطلب (₪)">
          <input name="min_order" type="number" min={0} placeholder="0" className={inputCls} />
        </Field>
        <Field label="أقصى استخدامات (اختياري)">
          <input name="max_uses" type="number" min={1} placeholder="بلا حد" className={inputCls} />
        </Field>
        <Field label="تاريخ الانتهاء (اختياري)">
          <input name="expires_at" type="date" className={inputCls} />
        </Field>
      </div>

      {state.error && (
        <p className="text-body-sm text-rose bg-rosepale rounded-lg px-3 py-2 mt-3">{state.error}</p>
      )}
      {state.success && (
        <p className="text-body-sm rounded-lg px-3 py-2 mt-3" style={{ background: "#DCFCE7", color: "#166534" }}>
          ✓ تم إنشاء الكوبون
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-4 px-6 py-2.5 rounded-xl bg-dark text-white text-body-sm font-bold hover:brightness-125 disabled:opacity-60 transition"
      >
        {pending ? "جارٍ الإنشاء..." : "إنشاء الكوبون"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-micro text-light font-label">{label}</span>
      {children}
    </label>
  );
}
