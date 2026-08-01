import { createAdminClient } from "@/lib/supabase/admin";
import { toLatinDigits } from "@/lib/utils/format";

/** صف في قائمة انتظار ورشة */
export interface WaitlistRow {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service_slug: string;
  service_name: string | null;
  availability_id: string | null;
  is_notified: boolean;
  notified_at: string | null;
  notes: string | null;
  created_at: string;
}

function toWaitlist(r: Record<string, unknown>): WaitlistRow {
  const row = r as unknown as WaitlistRow;
  return {
    ...row,
    customer_name: toLatinDigits(row.customer_name),
    customer_phone: toLatinDigits(row.customer_phone),
    service_name: row.service_name ? toLatinDigits(row.service_name) : null,
    notes: row.notes ? toLatinDigits(row.notes) : null,
  };
}

export interface JoinWaitlistInput {
  name: string;
  email: string;
  phone: string;
  serviceSlug: string;
  serviceName?: string | null;
  notes?: string;
}

/**
 * الانضمام لقائمة انتظار ورشة.
 *
 * إدراج ثم تحديث عند التكرار (بدل upsert/onConflict) — كي يعمل مع أي شكل
 * للفهرس الفريد (سواء `(service_slug, customer_email)` أو `lower(customer_email)`)،
 * فـ ON CONFLICT بقائمة أعمدة لا يطابق الفهارس الدالّية.
 */
export async function joinWaitlist(input: JoinWaitlistInput): Promise<{ ok: boolean; error?: string }> {
  const supabase = createAdminClient();
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  const phone = toLatinDigits(input.phone.trim());
  const notes = input.notes?.trim() || null;

  const { error } = await supabase.from("waitlist").insert({
    customer_name: name,
    customer_email: email,
    customer_phone: phone,
    service_slug: input.serviceSlug,
    service_name: input.serviceName ?? null,
    notes,
    is_notified: false,
  });

  if (!error) return { ok: true };

  // 23505 = مسجّلة مسبقًا لهذه الورشة → حدّثي بياناتها بدل الفشل
  if (error.code === "23505") {
    const { error: updateError } = await supabase
      .from("waitlist")
      .update({ customer_name: name, customer_phone: phone, notes })
      .eq("service_slug", input.serviceSlug)
      .eq("customer_email", email);
    return updateError ? { ok: false, error: updateError.message } : { ok: true };
  }

  return { ok: false, error: error.message };
}

/** قائمة الانتظار للأدمن — الأقدم أولاً (أسبقية عادلة) */
export async function listWaitlist(serviceSlug?: string): Promise<WaitlistRow[]> {
  const supabase = createAdminClient();
  let query = supabase.from("waitlist").select("*").order("created_at", { ascending: true });
  if (serviceSlug) query = query.eq("service_slug", serviceSlug);
  const { data } = await query;
  return (data ?? []).map(toWaitlist);
}

/** يعلّم منتظِرة بأنها أُشعِرت بتوفّر مكان */
export async function markWaitlistNotified(id: string): Promise<void> {
  const supabase = createAdminClient();
  await supabase
    .from("waitlist")
    .update({ is_notified: true, notified_at: new Date().toISOString() })
    .eq("id", id);
}

/** حذف من قائمة الانتظار */
export async function removeFromWaitlist(id: string): Promise<void> {
  const supabase = createAdminClient();
  await supabase.from("waitlist").delete().eq("id", id);
}
