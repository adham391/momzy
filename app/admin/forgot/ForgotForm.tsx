"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestAdminResetAction, type ForgotPasswordState } from "./actions";

const INITIAL: ForgotPasswordState = { status: "idle", message: null };

/** نموذج «نسيت كلمة المرور» — بعد الإرسال يحلّ محلّه تأكيد موحّد */
export default function ForgotForm() {
  const [state, formAction, pending] = useActionState(requestAdminResetAction, INITIAL);

  if (state.status === "sent") {
    return (
      <div className="space-y-4 text-center">
        <p role="status" className="text-body-sm text-dark bg-tealpale rounded-xl px-4 py-3 leading-relaxed">
          {state.message}
        </p>
        <BackToLogin />
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-body-sm font-bold text-dark mb-1.5">
          إيميل حساب الأدمن
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          dir="ltr"
          placeholder="admin@momzyworld.com"
          className="w-full px-4 py-2.5 rounded-xl border border-bord bg-offwh text-body text-dark text-left placeholder:text-light focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/30 transition"
        />
      </div>

      {state.status === "error" && state.message && (
        <p role="alert" className="text-body-sm text-rose bg-rosepale rounded-xl px-4 py-2.5 text-center">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full py-3 rounded-xl bg-rose text-dark font-bold text-btn hover:brightness-105 disabled:opacity-60 disabled:cursor-not-allowed transition"
      >
        {pending ? "جارٍ الإرسال..." : "أرسلي رابط إعادة الضبط"}
      </button>

      <BackToLogin />
    </form>
  );
}

/**
 * رابط العودة. اللون inline لأن قاعدة globals العامة `a { color: inherit }`
 * تتفوّق على أدوات Tailwind اللونية (انظر AdminSidebar).
 */
function BackToLogin() {
  return (
    <div className="text-center">
      <Link
        href="/admin/login"
        className="text-body-sm font-bold underline underline-offset-4"
        style={{ color: "var(--mid)" }}
      >
        العودة لتسجيل الدخول
      </Link>
    </div>
  );
}
