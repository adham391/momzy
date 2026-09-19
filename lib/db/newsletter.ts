import { createAdminClient } from "@/lib/supabase/admin";

/**
 * يشترك إيميلًا في النشرة (upsert — إعادة الاشتراك تُعيد التفعيل).
 * يُبقي البريد فريدًا، ويعيده منظَّفًا كي تُزامَن القائمة في Resend بالعنوان نفسه.
 * `isNew`: لم تكن مشتركة نشطة قبلها — فرسالة الترحيب لا تتكرّر بإعادة إرسال النموذج.
 */
export async function subscribeNewsletter(
  email: string,
  source = "footer"
): Promise<{ ok: true; email: string; isNew: boolean } | { ok: false; error: string }> {
  const supabase = createAdminClient();
  const clean = email.trim().toLowerCase();

  const { data: before } = await supabase
    .from("newsletter_subscribers")
    .select("is_active")
    .eq("email", clean)
    .maybeSingle();

  const { error } = await supabase.from("newsletter_subscribers").upsert(
    { email: clean, source, is_active: true, unsubscribed_at: null },
    { onConflict: "email" }
  );

  if (error) return { ok: false, error: error.message };
  return { ok: true, email: clean, isNew: !before?.is_active };
}

/** يُعلّم المشتركة ملغاة الاشتراك (من صفحة إلغاء الاشتراك) — الصفّ يبقى سجلًّا */
export async function unsubscribeNewsletter(email: string): Promise<{ ok: boolean }> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("newsletter_subscribers")
    .update({ is_active: false, unsubscribed_at: new Date().toISOString() })
    .eq("email", email.trim().toLowerCase());
  return { ok: !error };
}

/** قائمة المشتركين النشطين (للأدمن/التصدير لاحقًا) */
export async function listSubscribers(): Promise<{ email: string; source: string | null; subscribed_at: string }[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("newsletter_subscribers")
    .select("email, source, subscribed_at")
    .eq("is_active", true)
    .order("subscribed_at", { ascending: false });
  return (data ?? []).map((r) => ({
    email: String(r.email),
    source: (r.source as string | null) ?? null,
    subscribed_at: String(r.subscribed_at),
  }));
}
