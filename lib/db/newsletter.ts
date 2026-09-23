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

/** مشتركة كما تُعرض في لوحة الأدمن */
export interface SubscriberRow {
  email: string;
  /** من أين اشتركت: نموذج الفوتر أو خانة الموافقة في الدفع */
  source: string | null;
  isActive: boolean;
  subscribedAt: string;
  unsubscribedAt: string | null;
}

/**
 * كل المشتركات للوحة الأدمن — **بمن ألغت اشتراكها** (الصفّ يبقى سجلًّا).
 * الأحدث أولًا، والبحث على البريد. تختلف عن `listSubscribers` التي تخدم
 * الإرسال فلا تعيد إلا النشطات.
 */
export async function getSubscribers(search?: string): Promise<SubscriberRow[]> {
  const supabase = createAdminClient();
  let query = supabase
    .from("newsletter_subscribers")
    .select("email, source, is_active, subscribed_at, unsubscribed_at")
    .order("subscribed_at", { ascending: false });

  const term = search?.trim();
  if (term) query = query.ilike("email", `%${term}%`);

  const { data } = await query;
  return (data ?? []).map((r) => ({
    email: String(r.email),
    source: (r.source as string | null) ?? null,
    isActive: Boolean(r.is_active),
    subscribedAt: String(r.subscribed_at),
    unsubscribedAt: (r.unsubscribed_at as string | null) ?? null,
  }));
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
