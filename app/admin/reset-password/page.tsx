import Link from "next/link";
import AdminAuthCard from "@/components/admin/AdminAuthCard";
import ResetPasswordForm from "./ResetPasswordForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "كلمة مرور جديدة — لوحة Momzy",
  // الرمز في عنوان الصفحة — لا يُمرَّر في ترويسة Referer لأي مورد خارجي
  referrer: "no-referrer",
};

/**
 * صفحة الرابط الذي يصل بالبريد.
 * تعرض النموذج فقط ولا تتحقّق من الرمز عند الفتح — فبرامج فحص الروابط في
 * البريد لا تستهلكه قبل أن تضغطه الأدمن. التحقّق عند الإرسال (actions.ts).
 */
export default async function AdminResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token_hash?: string }>;
}) {
  const { token_hash: tokenHash } = await searchParams;

  if (!tokenHash) {
    return (
      <AdminAuthCard title="الرابط ناقص" subtitle="افتحي الرابط كاملًا من البريد، أو اطلبي رابطًا جديدًا.">
        <div className="text-center">
          <Link
            href="/admin/forgot"
            className="text-body-sm font-bold underline underline-offset-4"
            style={{ color: "var(--mid)" }}
          >
            اطلبي رابطًا جديدًا
          </Link>
        </div>
      </AdminAuthCard>
    );
  }

  return (
    <AdminAuthCard title="اختاري كلمة مرور جديدة" subtitle="ستدخلين إلى اللوحة مباشرة بعد الحفظ.">
      <ResetPasswordForm tokenHash={tokenHash} />
    </AdminAuthCard>
  );
}
