"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { updateBookingStatus, createSlot, deleteSlot } from "@/lib/db/bookings";
import type { BookingStatus } from "@/lib/db/bookings";
import { markWaitlistNotified, removeFromWaitlist } from "@/lib/db/waitlist";
import { getService } from "@/lib/services/getService";

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

/** إنشاء فتحة إتاحة — يجلب اسم/سعر الخدمة من المصدر */
export async function createSlotAction(formData: FormData) {
  const serviceSlug = String(formData.get("service") ?? "");
  const date = String(formData.get("date") ?? "");
  const startTime = String(formData.get("start_time") ?? "");
  const endTime = String(formData.get("end_time") ?? "");
  const capacity = Number(formData.get("capacity")) || 1;
  const priceRaw = formData.get("price");

  if (!serviceSlug || !date || !startTime || !endTime) return;

  const service = await getService(serviceSlug);
  if (!service) return;

  const price =
    priceRaw && String(priceRaw).trim() ? Number(priceRaw) : service.price ?? 0;

  await createSlot({
    date,
    startTime,
    endTime,
    serviceSlug,
    serviceName: service.title,
    price: Number.isFinite(price) ? price : 0,
    capacity: Math.max(1, capacity),
    // أونلاين: رابط اللقاء · حضوري: المكان — يُكشف للمسجِّلة بعد الدفع
    meetingLink: String(formData.get("meeting_link") ?? "").trim() || null,
    location: String(formData.get("location") ?? "").trim() || null,
    createdBy: await currentAdminId(),
  });

  revalidatePath("/admin/bookings/availability");
  revalidatePath("/admin/bookings");
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

/** حذف فتحة إتاحة */
export async function deleteSlotAction(formData: FormData) {
  const id = String(formData.get("id"));
  await deleteSlot(id);
  revalidatePath("/admin/bookings/availability");
}
