import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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
    <main className="min-h-screen bg-cream flex items-center justify-center p-5">
      <div className="w-full max-w-sm">
        {/* اللوقو */}
        <div className="text-center mb-6">
          <div className="font-heading text-4xl text-dark">Momzy</div>
          <div className="text-body-sm text-light mt-1">لوحة التحكم</div>
        </div>

        {/* البطاقة */}
        <div className="bg-white rounded-[var(--rl)] border border-bord p-7 shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
          <h1 className="font-heading text-h4 text-dark text-center mb-5">تسجيل الدخول</h1>
          <LoginForm />
        </div>

        <p className="text-center text-micro text-light mt-5">الدخول للمصرّح لهم فقط</p>
      </div>
    </main>
  );
}
