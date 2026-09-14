import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/resend/client";
import { siteOrigin } from "@/lib/resend/emails/brand";
import { adminResetEmailHtml, adminResetEmailSubject } from "@/lib/resend/emails/adminResetEmail";

/**
 * إعادة ضبط كلمة مرور الأدمن عبر البريد — لمن نسيها ولا تستطيع الدخول.
 *
 * ثلاثة قرارات أمان:
 *
 * ١. الرابط يُبنى من NEXT_PUBLIC_SITE_URL (siteOrigin) لا من ترويسة Host.
 *    الترويسة يتحكّم بها الطالب، ولو بُني منها لأمكن إرسال رابط إلى نطاق
 *    المهاجم يسرّب الرمز حين تضغطه الأدمن (password reset poisoning).
 *
 * ٢. الرابط يحمل token_hash يُتحقَّق منه عند **إرسال** الكلمة الجديدة لا عند
 *    فتح الصفحة: برامج البريد تفتح الروابط آليًا لفحصها، ولو تحقّقنا عند
 *    الفتح لاستهلكت الرمز ذا الاستعمال الواحد قبل أن تضغطه الأدمن.
 *
 * ٣. نولّد الرابط بـ generateLink (service role) ونرسله عبر Resend — نطاقه
 *    موثَّق — لا عبر بريد Supabase المدمج المحدود الإرسال.
 */

/** صفّ أدمن كما يُقرأ هنا */
interface AdminRow {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
}

/**
 * لا يُرسل رابط ثانٍ قبل مرور دقيقة — فلا يُقصف بريد الأدمن بطلبات متكرّرة.
 * best-effort: يعتمد على recovery_sent_at الذي يضبطه Supabase عند توليد رابط.
 */
const RESEND_COOLDOWN_MS = 60_000;

/**
 * يرسل رابط إعادة الضبط إن كان الإيميل لأدمن نشط، ويصمت في غير ذلك.
 * يُستدعى بعد الرد (after) — فلا يكشف زمنُه إن كان الإيميل لأدمن.
 */
export async function sendAdminResetLink(email: string): Promise<void> {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("admins")
    .select("id, name, email, is_active")
    .eq("email", email)
    .maybeSingle();
  const admin = data as AdminRow | null;
  if (!admin?.is_active) return;

  const { data: authUser } = await supabase.auth.admin.getUserById(admin.id);
  const sentAt = authUser.user?.recovery_sent_at;
  if (sentAt && Date.now() - new Date(sentAt).getTime() < RESEND_COOLDOWN_MS) return;

  const { data: link, error } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email: admin.email,
  });
  const tokenHash = link?.properties?.hashed_token;
  if (error || !tokenHash) {
    console.error("[admin-reset] تعذّر توليد رابط إعادة الضبط:", error?.message);
    return;
  }

  const resetUrl = `${siteOrigin()}/admin/reset-password?token_hash=${encodeURIComponent(tokenHash)}`;
  await sendEmail({
    to: admin.email,
    subject: adminResetEmailSubject,
    html: adminResetEmailHtml({ name: admin.name, resetUrl }),
  });
}
