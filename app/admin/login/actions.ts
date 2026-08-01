"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** حالة نموذج الدخول — تُعاد لـ useActionState */
export interface LoginState {
  error: string | null;
}

/**
 * إجراء تسجيل الدخول — Supabase Auth (signInWithPassword).
 * عند النجاح يضبط كوكيز الجلسة ثم redirect للوحة.
 */
export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "أدخلي الإيميل وكلمة المرور" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "الإيميل أو كلمة المرور غير صحيحة" };
  }

  // نجاح — للوحة. redirect يرمي NEXT_REDIRECT، لذا يجب أن يكون خارج أي try/catch.
  redirect("/admin");
}
