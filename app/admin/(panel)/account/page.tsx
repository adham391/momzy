import { createClient } from "@/lib/supabase/server";
import ChangePasswordForm from "./ChangePasswordForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "حسابي — لوحة Momzy" };

/** اسم الدور كما يُعرض */
const ROLE_LABEL: Record<string, string> = {
  super_admin: "مدير عام",
  admin: "أدمن",
};

/**
 * «حسابي» — بيانات دخول الأدمن الحالي وتغيير كلمة مروره.
 * الـ layout يضمن مسبقًا أنّ الزائر أدمن نشط؛ هنا نقرأ بياناته فقط.
 */
export default async function AdminAccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: admin } = user
    ? await supabase.from("admins").select("name, email, role").eq("id", user.id).single()
    : { data: null };

  return (
    <div className="max-w-xl">
      <h1 className="font-heading text-h2 font-bold text-dark mb-1">حسابي</h1>
      <p className="text-mid text-body-sm mb-6">بيانات دخولك إلى لوحة التحكم.</p>

      <div className="grid grid-cols-1 gap-5">
        {/* ── بيانات الحساب ── */}
        <section className="bg-white rounded-[var(--rl)] border border-bord p-5 md:p-6">
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-body-sm">
            <dt className="text-light">الاسم</dt>
            <dd className="font-bold text-dark">{admin?.name ?? "—"}</dd>
            <dt className="text-light">الإيميل</dt>
            <dd className="font-bold text-dark" dir="ltr" style={{ textAlign: "right" }}>
              {admin?.email ?? user?.email ?? "—"}
            </dd>
            <dt className="text-light">الدور</dt>
            <dd className="font-bold text-dark">{ROLE_LABEL[admin?.role ?? ""] ?? admin?.role ?? "—"}</dd>
          </dl>
        </section>

        {/* ── تغيير كلمة المرور ── */}
        <section className="bg-white rounded-[var(--rl)] border border-bord p-5 md:p-6">
          <h2 className="font-heading font-bold text-dark text-body mb-1">تغيير كلمة المرور</h2>
          <p className="text-mid text-body-sm mb-5 leading-relaxed">
            اكتبي كلمتك الحالية، ثم الجديدة مرتين. إن نسيتِ كلمتك الحالية فلا تُغيَّر من هنا —
            تواصلي مع المسؤول التقني لإعادة ضبطها.
          </p>
          <ChangePasswordForm />
        </section>
      </div>
    </div>
  );
}
