"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { updateBookingStatus } from "@/lib/db/bookings";
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

