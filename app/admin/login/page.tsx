import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AdminAuthCard from "@/components/admin/AdminAuthCard";
import LoginForm from "./LoginForm";

export const metadata = {
  title: "دخول — لوحة Momzy",
};

/**
 * صفحة دخول الأدمن — بلا chrome الموقع (خارج مجموعة panel).
 * لو المستخدم مسجّل دخول بالفعل → توجيه مباشر للوحة.
 */
export default async function AdminLoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/admin");

  return (
    <AdminAuthCard
      title="تسجيل الدخول"
      footer={<p className="text-center text-micro text-light mt-5">الدخول للمصرّح لهم فقط</p>}
    >
      <LoginForm />

      {/* نسيت كلمة المرور — اللون inline: قاعدة `a { color: inherit }` تتفوّق على Tailwind */}
      <div className="text-center mt-4">
        <Link
          href="/admin/forgot"
          className="text-body-sm font-bold underline underline-offset-4"
          style={{ color: "var(--mid)" }}
        >
          نسيت كلمة المرور؟
        </Link>
      </div>
    </AdminAuthCard>
  );
}
