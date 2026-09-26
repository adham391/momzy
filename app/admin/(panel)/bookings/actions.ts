"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { collectBookingRemainder, updateBookingDetails, updateBookingStatus } from "@/lib/db/bookings";
import type { BookingStatus } from "@/lib/db/bookings";
import { markWaitlistNotified, removeFromWaitlist } from "@/lib/db/waitlist";

async function currentAdminId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/** تغيير حالة الحجز (الإلغاء يحرّر الفتحة) */
export async function changeBookingStatusAction(formData: FormData) {
  const id = String(formData.get("bookingId"));
  const status = String(formData.get("status")) as BookingStatus;
  const note = String(formData.get("note") ?? "").trim() || null;

  await updateBookingStatus(id, status, note, await currentAdminId());
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
}

/** تصحيح بيانات مسجِّلة — الاسم والهاتف والبريد والمبلغ وما كُتب عن الطفل */
export async function updateBookingDetailsAction(formData: FormData) {
  const id = String(formData.get("bookingId"));
  const text = (key: string) => String(formData.get(key) ?? "").trim();
  const num = (key: string): number | null => {
    const n = Number(text(key));
    return Number.isInteger(n) && n > 0 ? n : null;
  };

  await updateBookingDetails(id, {
    customerName: text("customer_name"),
    customerPhone: text("customer_phone"),
    customerEmail: text("customer_email"),
    city: text("city") || null,
    notes: text("notes") || null,
    topic: text("topic") || null,
    babyBirthDate: /^\d{4}-\d{2}-\d{2}$/.test(text("baby_birth_date")) ? text("baby_birth_date") : null,
    babyName: text("baby_name") || null,
    gestationalWeeks: num("gestational_weeks"),
    pregnancyWeek: num("pregnancy_week"),
    received: Math.max(0, Number(text("received")) || 0),
  });
  revalidatePath("/admin/bookings");
  revalidatePath("/admin/bookings/availability");
}

/** تحصيل باقي المبلغ بعد العربون — يُساوي المقبوض بالمبلغ الكامل */
export async function collectRemainderAction(formData: FormData) {
  await collectBookingRemainder(String(formData.get("bookingId")));
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
}

/* ── قائمة الانتظار ── */

/** تعليم منتظِرة بأنها أُشعِرت بتوفّر مكان */
export async function notifyWaitlistAction(formData: FormData) {
  await markWaitlistNotified(String(formData.get("id")));
  revalidatePath("/admin/bookings/waitlist");
}

/** حذف من قائمة الانتظار */
export async function removeWaitlistAction(formData: FormData) {
  await removeFromWaitlist(String(formData.get("id")));
  revalidatePath("/admin/bookings/waitlist");
}

