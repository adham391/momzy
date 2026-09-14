"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { passwordUpdateErrorMessage, validateNewAdminPassword } from "@/lib/admin/passwordPolicy";

/** حالة نموذج الكلمة الجديدة — تُعاد لـ useActionState */
export interface ResetPasswordState {
  error: string | null;
}

/**
 * يضبط كلمة الأدمن الجديدة من رابط البريد.
 *
 * الترتيب مقصود:
 *  ١. قواعد الكلمة أولًا — الرمز يُستعمل مرة واحدة، فلا نستهلكه على كلمة ستُرفض.
 *  ٢. التحقّق من الرمز (verifyOtp) — هو ما يُثبت ملكية البريد، ويفتح جلسة.
 *  ٣. التفويض — الرابط لا يُولَّد إلا لأدمن نشط، لكنّ الحساب قد يُوقَف
 *     بين طلب الرابط والضغط عليه.
 *  ٤. التغيير، ثم الدخول إلى اللوحة مباشرة.
 */
export async function resetAdminPasswordAction(
  _prev: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const tokenHash = String(formData.get("token_hash") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!tokenHash) return { error: "الرابط ناقص — اطلبي رابطًا جديدًا." };

  const invalid = validateNewAdminPassword(next, confirm);
  if (invalid) return { error: invalid };

  const supabase = await createClient();

  const { data, error } = await supabase.auth.verifyOtp({ type: "recovery", token_hash: tokenHash });
  if (error || !data.user) {
    return { error: "انتهت صلاحية الرابط أو سبق استعماله — اطلبي رابطًا جديدًا." };
  }

  const { data: admin } = await supabase
    .from("admins")
    .select("is_active")
    .eq("id", data.user.id)
    .single();
  if (!admin?.is_active) {
    await supabase.auth.signOut();
    return { error: "هذا الحساب غير مفوَّض." };
  }

  const { error: updateError } = await supabase.auth.updateUser({ password: next });
  if (updateError) {
    // الرمز استُهلك — نُنهي جلسة الاستعادة كي لا يبقى دخول نصف مكتمل
    await supabase.auth.signOut();
    return { error: `${passwordUpdateErrorMessage(updateError.code)}. اطلبي رابطًا جديدًا وجرّبي من جديد.` };
  }

  // redirect يرمي NEXT_REDIRECT، فيبقى خارج أي try/catch
  redirect("/admin");
}
