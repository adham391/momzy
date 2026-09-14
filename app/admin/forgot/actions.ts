"use server";

import { after } from "next/server";
import { isEmailConfigured } from "@/lib/resend/client";
import { sendAdminResetLink } from "@/lib/admin/passwordReset";

/** حالة نموذج «نسيت كلمة المرور» — تُعاد لـ useActionState */
export interface ForgotPasswordState {
  status: "idle" | "sent" | "error";
  message: string | null;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * يطلب رابط إعادة ضبط كلمة مرور الأدمن.
 *
 * الرد واحد دائمًا — سواء كان الإيميل لأدمن أم لا — والبحث والإرسال بعد
 * الرد: لو بقي أيٌّ منهما في مسار الاستجابة لفرّق زمنُها بين الحالتين.
 */
export async function requestAdminResetAction(
  _prev: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL_PATTERN.test(email)) {
    return { status: "error", message: "اكتبي إيميلًا صحيحًا" };
  }

  // بلا مزوّد بريد لا يصل الرابط أبدًا — نصارح بدل نجاح كاذب
  if (!isEmailConfigured()) {
    return { status: "error", message: "إرسال البريد غير مُهيّأ على الخادم — تواصلي مع المسؤول التقني" };
  }

  after(async () => {
    try {
      await sendAdminResetLink(email);
    } catch (err) {
      console.error("[admin-reset] فشل إرسال رابط إعادة الضبط:", err);
    }
  });

  return {
    status: "sent",
    message:
      "إن كان هذا الإيميل لحساب أدمن، فسيصله رابط لاختيار كلمة جديدة خلال دقائق. تفقّدي البريد والرسائل غير المرغوبة.",
  };
}
