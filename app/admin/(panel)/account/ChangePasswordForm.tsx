"use client";

import { useActionState } from "react";
import { changePasswordAction, type ChangePasswordState } from "./actions";
import { MIN_ADMIN_PASSWORD_LENGTH } from "@/lib/admin/passwordPolicy";

const INITIAL: ChangePasswordState = { status: "idle", message: null };

/**
 * نموذج تغيير كلمة المرور.
 * React يُفرغ حقول النموذج بعد كل إرسال — مقصود هنا: لا تبقى كلمة مرور
 * معروضة في الصفحة بعد النجاح ولا بعد الخطأ.
 */
export default function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, INITIAL);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <PasswordField name="current" label="كلمة المرور الحالية" autoComplete="current-password" />
      <PasswordField
        name="next"
        label="كلمة المرور الجديدة"
        hint={`${MIN_ADMIN_PASSWORD_LENGTH} حرفًا على الأقل`}
        autoComplete="new-password"
        minLength={MIN_ADMIN_PASSWORD_LENGTH}
      />
      <PasswordField
        name="confirm"
        label="أعيدي كتابة الكلمة الجديدة"
        autoComplete="new-password"
        minLength={MIN_ADMIN_PASSWORD_LENGTH}
      />

      {state.message && (
        <p
          role={state.status === "error" ? "alert" : "status"}
          className={
            state.status === "error"
              ? "text-body-sm text-rose bg-rosepale rounded-xl px-4 py-2.5"
              : "text-body-sm text-teald bg-tealpale rounded-xl px-4 py-2.5"
          }
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-start px-6 py-2.5 rounded-xl bg-dark text-white text-body-sm font-bold hover:brightness-125 disabled:opacity-60 disabled:cursor-not-allowed transition"
      >
        {pending ? "جارٍ الحفظ..." : "تغيير كلمة المرور"}
      </button>
    </form>
  );
}

/** حقل كلمة مرور — LTR، بنمط حقول صفحة الدخول */
function PasswordField({
  name,
  label,
  hint,
  autoComplete,
  minLength,
}: {
  name: string;
  label: string;
  hint?: string;
  autoComplete: "current-password" | "new-password";
  minLength?: number;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-body-sm font-bold text-dark">
        {label}
        {hint && <span className="font-normal text-light"> — {hint}</span>}
      </span>
      <input
        name={name}
        type="password"
        required
        minLength={minLength}
        autoComplete={autoComplete}
        dir="ltr"
        className="w-full px-4 py-2.5 rounded-xl border border-bord bg-offwh text-body text-dark text-left placeholder:text-light focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/30 transition"
      />
    </label>
  );
}
