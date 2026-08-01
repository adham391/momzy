import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata = {
  title: "لوحة تحكم Momzy",
};

/**
 * layout لوحة الأدمن — يغلّف كل صفحات (panel).
 * يتحقّق أن الزائر مسجّل دخول **وأدمن نشط** (طبقة تفويض ثانية بعد middleware)،
 * ثم يعرض السايدبار + منطقة المحتوى.
 */
export default async function AdminPanelLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();

  // مصادقة — من هو المستخدم؟
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  // تفويض — هل هو أدمن نشط؟ (سياسة RLS: كل أدمن يقرأ صفّه فقط)
  const { data: admin } = await supabase
    .from("admins")
    .select("name, role, is_active")
    .eq("id", user.id)
    .single();

  if (!admin || !admin.is_active) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-cream">
      <AdminSidebar adminName={admin.name} role={admin.role} />

      {/* المحتوى — هامش يمين على الديسكتوب ليفسح للسايدبار الثابت */}
      <main className="md:mr-64 min-h-screen">
        <div className="max-w-6xl mx-auto p-5 md:p-8">{children}</div>
      </main>
    </div>
  );
}
