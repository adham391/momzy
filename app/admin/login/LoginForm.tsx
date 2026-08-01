"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

const INITIAL: LoginState = { error: null };

/** نموذج تسجيل الدخول — يستخدم useActionState لعرض الأخطاء وحالة الانتظار */
export default function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, INITIAL);

  return (
    <form action={formAction} className="space-y-4">
      {/* الإيميل */}
      <div>
        <label htmlFor="email" className="block text-body-sm font-bold text-dark mb-1.5">
          الإيميل
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

      {/* كلمة المرور */}
      <div>
        <label htmlFor="password" className="block text-body-sm font-bold text-dark mb-1.5">
          كلمة المرور
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          dir="ltr"
          placeholder="••••••••"
          className="w-full px-4 py-2.5 rounded-xl border border-bord bg-offwh text-body text-dark text-left placeholder:text-light focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/30 transition"
        />
      </div>

      {/* رسالة الخطأ */}
      {state.error && (
        <p className="text-body-sm text-rose bg-rosepale rounded-xl px-4 py-2.5 text-center">
          {state.error}
        </p>
      )}

      {/* زر الدخول */}
      <button
        type="submit"
        disabled={pending}
        className="w-full py-3 rounded-xl bg-rose text-dark font-bold text-btn hover:brightness-105 disabled:opacity-60 disabled:cursor-not-allowed transition"
      >
        {pending ? "جارٍ الدخول..." : "دخول"}
      </button>
    </form>
  );
}
