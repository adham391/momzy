"use client";

import { useActionState } from "react";
import PasswordField from "@/components/admin/PasswordField";
import { MIN_ADMIN_PASSWORD_LENGTH } from "@/lib/admin/passwordPolicy";
import { resetAdminPasswordAction, type ResetPasswordState } from "./actions";

const INITIAL: ResetPasswordState = { error: null };

/**
 * نموذج الكلمة الجديدة. الرمز حقل مخفي يُرسَل مع النموذج — التحقّق منه
 * يحدث عند الإرسال لا عند فتح الصفحة (انظر lib/admin/passwordReset.ts).
 */
export default function ResetPasswordForm({ tokenHash }: { tokenHash: string }) {
  const [state, formAction, pending] = useActionState(resetAdminPasswordAction, INITIAL);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="token_hash" value={tokenHash} />

      <PasswordField
        name="next"
        label="كلمة المرور الجديدة"
        hint={`${MIN_ADMIN_PASSWORD_LENGTH} حرفًا على الأقل`}
        autoComplete="new-password"
        minLength={MIN_ADMIN_PASSWORD_LENGTH}
      />
      <PasswordField
        name="confirm"
        label="أعيدي كتابتها"
        autoComplete="new-password"
        minLength={MIN_ADMIN_PASSWORD_LENGTH}
      />

      {state.error && (
        <p role="alert" className="text-body-sm text-rose bg-rosepale rounded-xl px-4 py-2.5 text-center leading-relaxed">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full py-3 rounded-xl bg-rose text-dark font-bold text-btn hover:brightness-105 disabled:opacity-60 disabled:cursor-not-allowed transition"
      >
        {pending ? "جارٍ الحفظ..." : "حفظ والدخول إلى اللوحة"}
      </button>
    </form>
  );
}
