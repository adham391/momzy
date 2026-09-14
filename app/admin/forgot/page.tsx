import AdminAuthCard from "@/components/admin/AdminAuthCard";
import ForgotForm from "./ForgotForm";

export const metadata = {
  title: "نسيت كلمة المرور — لوحة Momzy",
};

/**
 * «نسيت كلمة المرور» — خارج مجموعة panel فتُفتح بلا دخول.
 * لا تكشف إن كان الإيميل لأدمن: الرد واحد دائمًا (انظر actions.ts).
 */
export default function AdminForgotPasswordPage() {
  return (
    <AdminAuthCard
      title="نسيت كلمة المرور؟"
      subtitle="اكتبي إيميل حسابك وسنرسل إليه رابطًا لاختيار كلمة جديدة."
    >
      <ForgotForm />
    </AdminAuthCard>
  );
}
