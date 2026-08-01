import { createAdminClient } from "@/lib/supabase/admin";

/**
 * يشترك إيميلاً في النشرة (upsert — إعادة الاشتراك تُعيد التفعيل).
 * يُبقي البريد فريدًا.
 */
export async function subscribeNewsletter(
  email: string,
  source = "footer"
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createAdminClient();
  const clean = email.trim().toLowerCase();

  const { error } = await supabase.from("newsletter_subscribers").upsert(
    { email: clean, source, is_active: true, unsubscribed_at: null },
    { onConflict: "email" }
  );

  if (error) return { ok: false, error: error.message };
  return { ok: true };
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
