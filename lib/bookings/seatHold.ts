import { createAdminClient } from "@/lib/supabase/admin";

/**
 * الحجز المؤقت للمقعد أثناء الدفع.
 *
 * التسجيل في ورشة مدفوعة يأخذ مقعدًا لمدة قصيرة فقط (SEAT_HOLD_MINUTES) — تكفي لإتمام الدفع،
 * ولا يبقى مقعد محجوزًا لمن تركت صفحة الدفع. بعد المدة يتحرّر المقعد تلقائيًا (releaseExpiredSeatHolds)
 * قبل أي عرض للمواعيد أو تسجيل جديد. كل فتح لصفحة الدفع يمدّ الحجز (الأم تدفع الآن)، أو يأخذ المقعد
 * من جديد إن تحرّر — وإن اكتمل العدد في الأثناء فلا دفع (ensureSeatForPayment).
 *
 * `bookings.seat_held` يقول هل يُحسب لهذا الحجز مقعد في `availability.booked_count`؛ كل تغيير فيه
 * ذرّي (شرط على قيمته الحالية) فلا يتحرّر مقعد مرتين ولا يُؤخذ مرتين. هجرة 0022.
 */

/** مدة الحجز المؤقت للمقعد أثناء الدفع — بالدقائق */
export const SEAT_HOLD_MINUTES = 3;

/** سقف الحجوزات المنتهية في مسحة واحدة */
const MAX_RELEASES_PER_SWEEP = 50;

/** موعد انتهاء حجز مؤقت يبدأ الآن */
export function seatHoldExpiry(): string {
  return new Date(Date.now() + SEAT_HOLD_MINUTES * 60_000).toISOString();
}

/** يحرّر مقعد حجز واحد إن كان يحجز مقعدًا — الختم أولًا ثم التحرير، فلا يتحرّر مرتين */
export async function releaseSeat(bookingId: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("bookings")
    .update({ seat_held: false, hold_expires_at: null })
    .eq("id", bookingId)
    .eq("seat_held", true)
    .select("availability_id")
    .maybeSingle();
  if (!data?.availability_id) return false;
  await supabase.rpc("unbook_slot", { slot_id: data.availability_id });
  return true;
}

/** يحرّر مقاعد الحجوزات المؤقتة المنتهية بلا دفع — يُستدعى قبل عرض المواعيد وقبل أي تسجيل */
export async function releaseExpiredSeatHolds(): Promise<number> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("bookings")
    .select("id")
    .eq("seat_held", true)
    .neq("payment_status", "paid")
    .not("hold_expires_at", "is", null)
    .lt("hold_expires_at", new Date().toISOString())
    .limit(MAX_RELEASES_PER_SWEEP);

  let released = 0;
  for (const row of (data ?? []) as { id: string }[]) {
    // الشروط كلها في التحديث نفسه: دفعٌ يكتمل في اللحظة ذاتها يمسح hold_expires_at فلا يتحرّر مقعدها
    const { data: claimed } = await supabase
      .from("bookings")
      .update({ seat_held: false, hold_expires_at: null })
      .eq("id", row.id)
      .eq("seat_held", true)
      .neq("payment_status", "paid")
      .lt("hold_expires_at", new Date().toISOString())
      .select("availability_id")
      .maybeSingle();
    if (!claimed?.availability_id) continue;
    await supabase.rpc("unbook_slot", { slot_id: claimed.availability_id });
    released++;
  }
  return released;
}

/**
 * يأخذ مقعدًا لحجز لا يحجز مقعدًا الآن — ذرّيًا من السعة المتاحة (book_slot).
 * `holdUntil` = انتهاء الحجز المؤقت، أو null لمقعد ثابت (بعد الدفع). false إن اكتمل العدد.
 */
export async function reacquireSeat(bookingId: string, availabilityId: string, holdUntil: string | null): Promise<boolean> {
  const supabase = createAdminClient();
  const { data: booked } = await supabase.rpc("book_slot", { slot_id: availabilityId });
  if (!booked) return false;

  const { data } = await supabase
    .from("bookings")
    .update({ seat_held: true, hold_expires_at: holdUntil })
    .eq("id", bookingId)
    .eq("seat_held", false)
    .select("id")
    .maybeSingle();
  // مسار آخر أخذ له مقعدًا في اللحظة نفسها — أعيدي ما أخذناه كي لا يُحسب مرتين
  if (!data) await supabase.rpc("unbook_slot", { slot_id: availabilityId });
  return true;
}

/**
 * قبل فتح صفحة الدفع: يمدّ الحجز المؤقت، أو يأخذ المقعد من جديد إن تحرّر.
 * "taken" = اكتمل العدد قبل الدفع — لا تُفتح صفحة الدفع.
 */
export async function ensureSeatForPayment(bookingId: string): Promise<"held" | "taken"> {
  const supabase = createAdminClient();
  const { data: booking } = await supabase
    .from("bookings")
    .select("availability_id, seat_held")
    .eq("id", bookingId)
    .maybeSingle();
  if (!booking?.availability_id) return "taken";

  if (booking.seat_held) {
    await supabase.from("bookings").update({ hold_expires_at: seatHoldExpiry() }).eq("id", bookingId).eq("seat_held", true);
    return "held";
  }
  return (await reacquireSeat(bookingId, String(booking.availability_id), seatHoldExpiry())) ? "held" : "taken";
}

/**
 * مقعد لحجز دُفع بعد انتهاء حجزه المؤقت واكتمل العدد في الأثناء: دفعت، فلها مقعدها —
 * والجلسة تتجاوز سعتها بواحد (ليست ذرّية: مسار نادر، وهبة تُنبَّه له في ملاحظة الحجز).
 */
export async function forceSeat(bookingId: string, availabilityId: string): Promise<void> {
  const supabase = createAdminClient();
  const { data: slot } = await supabase.from("availability").select("booked_count").eq("id", availabilityId).single();
  await supabase
    .from("availability")
    .update({ booked_count: Number(slot?.booked_count ?? 0) + 1 })
    .eq("id", availabilityId);
  await supabase.from("bookings").update({ seat_held: true, hold_expires_at: null }).eq("id", bookingId);
}
