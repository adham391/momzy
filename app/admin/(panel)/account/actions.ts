"use server";

import { createClient } from "@/lib/supabase/server";
import { passwordUpdateErrorMessage, validateNewAdminPassword } from "@/lib/admin/passwordPolicy";

/** حالة نموذج تغيير كلمة المرور — تُعاد لـ useActionState */
export interface ChangePasswordState {
  status: "idle" | "success" | "error";
  message: string | null;
}

/**
 * يغيّر كلمة مرور الأدمن المسجَّل حاليًا.
 *
 * الكلمة الحالية مطلوبة ويُتحقَّق منها قبل التغيير: جلسة بقيت مفتوحة على
 * جهاز منسيّ لا ينبغي أن تكفي لإقصاء صاحب الحساب بتغيير كلمته.
 *
 * التفويض يُعاد هنا ولا يُكتفى بالـ layout: الـ server action يمكن
 * استدعاؤه بطلب POST مباشر دون أن تُرسَم الصفحة أصلًا.
 */
export async function changePasswordAction(
  _prev: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  const fail = (message: string): ChangePasswordState => ({ status: "error", message });

  if (!current) return fail("أدخلي كلمة المرور الحالية");
  const invalid = validateNewAdminPassword(next, confirm, current);
  if (invalid) return fail(invalid);

  const supabase = await createClient();

  // مصادقة — من صاحب الجلسة؟
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return fail("انتهت الجلسة — سجّلي الدخول من جديد");

  // تفويض — أدمن نشط فقط
  const { data: admin } = await supabase
    .from("admins")
    .select("is_active")
    .eq("id", user.id)
    .single();
  if (!admin?.is_active) return fail("هذا الحساب غير مفوَّض");

  // التحقّق من الكلمة الحالية — دخول بالجلسة نفسها، فلا يتغيّر صاحبها
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: current,
  });
  if (verifyError) return fail("كلمة المرور الحالية غير صحيحة");

  const { error } = await supabase.auth.updateUser({ password: next });
  if (error) return fail(passwordUpdateErrorMessage(error.code));

  return { status: "success", message: "تغيّرت كلمة المرور ✓ — استعمليها في الدخول القادم" };
}
