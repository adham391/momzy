import { createAdminClient } from "@/lib/supabase/admin";
import { getService } from "@/lib/services/getService";
import { checkBabyAge, hasAgeGate } from "@/lib/utils/age";
import { toLatinDigits } from "@/lib/utils/format";
import type { PaymentStatus } from "./types";
import type { StatusHistoryRow } from "./orders";

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

/** فتحة إتاحة (availability) — خدمة + وقت + سعة */
export interface SlotRow {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  service_slug: string | null;
  service_name: string | null;
  price: number;
  capacity: number;
  booked_count: number;
  is_blocked: boolean;
  /** رابط اللقاء للورشات الأونلاين — يُكشف بعد تأكيد الدفع فقط */
  meeting_link: string | null;
  /** مكان اللقاء للورشات الحضورية */
  location: string | null;
  notes: string | null;
  created_at: string;
}

/** صف حجز (booking) */
export interface BookingRow {
  id: string;
  booking_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service_slug: string | null;
  service_name: string | null;
  availability_id: string | null;
  date: string;
  start_time: string;
  end_time: string | null;
  status: BookingStatus;
  payment_status: PaymentStatus;
  amount: number;
  notes: string | null;
  admin_notes: string | null;
  /** تاريخ ميلاد الطفل — للورشات ذات الفئة العمرية فقط */
  baby_birth_date: string | null;
  created_at: string;
  updated_at: string;
  /** من الفتحة — رابط اللقاء (أونلاين). يُقرأ وقت العرض لا وقت الحجز
   *  كي تلتقط رابطًا أضافته هبة لاحقًا. */
  meeting_link?: string | null;
  /** من الفتحة — مكان اللقاء (حضوري) */
  location?: string | null;
}

function toSlot(r: Record<string, unknown>): SlotRow {
  return {
    ...(r as unknown as SlotRow),
    price: Number(r.price ?? 0),
    capacity: Number(r.capacity ?? 1),
    booked_count: Number(r.booked_count ?? 0),
  };
}

function toBooking(r: Record<string, unknown>): BookingRow {
  const row = r as unknown as BookingRow;
  return {
    ...row,
    customer_name: toLatinDigits(row.customer_name),
    customer_phone: toLatinDigits(row.customer_phone),
    service_name: row.service_name ? toLatinDigits(row.service_name) : null,
    notes: row.notes ? toLatinDigits(row.notes) : null,
    admin_notes: row.admin_notes ? toLatinDigits(row.admin_notes) : null,
    amount: Number(r.amount ?? 0),
  };
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/* ── إدارة الفتحات (availability) ── */

export interface CreateSlotInput {
  date: string;
  startTime: string;
  endTime: string;
  serviceSlug: string;
  serviceName: string;
  price: number;
  capacity: number;
  /** رابط اللقاء للورشة الأونلاين (اختياري) */
  meetingLink?: string | null;
  /** مكان اللقاء للورشة الحضورية (اختياري) */
  location?: string | null;
  createdBy?: string | null;
}

/** ينشئ فتحة إتاحة جديدة */
export async function createSlot(input: CreateSlotInput): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("availability").insert({
    date: input.date,
    start_time: input.startTime,
    end_time: input.endTime,
    service_slug: input.serviceSlug,
    service_name: input.serviceName,
    price: input.price,
    capacity: input.capacity,
    meeting_link: input.meetingLink || null,
    location: input.location || null,
    created_by: input.createdBy ?? null,
  });
  if (error) throw new Error(error.message);
}

/** الفتحات القادمة (للأدمن) — من اليوم فصاعداً */
export async function listUpcomingSlots(): Promise<SlotRow[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("availability")
    .select("*")
    .gte("date", todayISO())
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });
  return (data ?? []).map(toSlot);
}

/** حذف فتحة */
export async function deleteSlot(id: string): Promise<void> {
  const supabase = createAdminClient();
  await supabase.from("availability").delete().eq("id", id);
}

/** الفتحات المتاحة لخدمة (للعميل) — قادمة، غير محجوبة، فيها متسع */
export async function getAvailableSlots(serviceSlug: string): Promise<SlotRow[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("availability")
    .select("*")
    .eq("service_slug", serviceSlug)
    .eq("is_blocked", false)
    .gte("date", todayISO())
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });
  return (data ?? []).map(toSlot).filter((s) => s.booked_count < s.capacity);
}

/**
 * كل الجلسات القادمة لخدمة — **بما فيها المكتملة** (بعكس getAvailableSlots).
 * تُعرض في صفحة الورشة كي ترى الأم المواعيد وحالة كل جلسة («اكتمل العدد»).
 */
export async function getUpcomingSlotsForService(serviceSlug: string): Promise<SlotRow[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("availability")
    .select("*")
    .eq("service_slug", serviceSlug)
    .eq("is_blocked", false)
    .gte("date", todayISO())
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });
  return (data ?? []).map(toSlot);
}

/**
 * المقاعد المتاحة لكل خدمة — مجموع (السعة − المحجوز) لكل الفتحات القادمة.
 * تُستخدم في قائمة الخدمات لعرض «بقي N مقاعد» أو «اكتمل العدد».
 */
export async function getAvailableSeatsBySlug(): Promise<Record<string, number>> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("availability")
    .select("service_slug, capacity, booked_count")
    .eq("is_blocked", false)
    .gte("date", todayISO());

  const seats: Record<string, number> = {};
  for (const r of data ?? []) {
    const slug = r.service_slug as string | null;
    if (!slug) continue;
    const left = Math.max(0, Number(r.capacity ?? 0) - Number(r.booked_count ?? 0));
    seats[slug] = (seats[slug] ?? 0) + left;
  }
  return seats;
}

/* ── الحجوزات ── */

export interface CreateBookingInput {
  slotId: string;
  customer: { name: string; email: string; phone: string };
  notes?: string;
  /** تاريخ ميلاد الطفل (أو الموعد المتوقّع) — إلزامي للورشات ذات فئة عمرية */
  babyBirthDate?: string | null;
}

/** فشل الحجز — status يميّز سبب الرفض (400 بيانات · 409 امتلاء) */
type BookingError = { error: string; status?: number };

/**
 * ينشئ حجزاً — يتحقق من الفئة العمرية، ثم يحجز الفتحة ذرّياً
 * (يمنع تجاوز السعة) ثم يُدرج الحجز.
 * التحقق العمري هنا لا في الواجهة فقط — الواجهة قابلة للتجاوز.
 */
export async function createBooking(
  input: CreateBookingInput
): Promise<{ id: string; bookingNumber: string; amount: number } | BookingError> {
  const supabase = createAdminClient();

  const { data: slotRaw } = await supabase
    .from("availability")
    .select("*")
    .eq("id", input.slotId)
    .single();
  if (!slotRaw) return { error: "الموعد غير موجود", status: 404 };
  const slot = toSlot(slotRaw);

  // ── الفئة العمرية — قبل حجز المقعد كي لا نحجز ثم نتراجع ──
  if (slot.service_slug) {
    const service = await getService(slot.service_slug);
    if (service && hasAgeGate(service)) {
      if (!input.babyBirthDate) {
        return { error: "تاريخ ميلاد الطفل مطلوب لهذه الورشة", status: 400 };
      }
      const check = checkBabyAge(input.babyBirthDate, slot.date, service);
      if (!check.ok) {
        return { error: check.message ?? "عمر الطفل خارج الفئة العمرية للورشة", status: 400 };
      }
    }
  }

  // حجز ذرّي — يعيد false لو امتلأت أو محجوبة
  const { data: booked } = await supabase.rpc("book_slot", { slot_id: input.slotId });
  if (!booked) return { error: "عذراً، هذا الموعد لم يعد متاحاً", status: 409 };

  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      customer_name: input.customer.name,
      customer_email: input.customer.email,
      customer_phone: input.customer.phone,
      service_slug: slot.service_slug,
      service_name: slot.service_name,
      availability_id: slot.id,
      date: slot.date,
      start_time: slot.start_time,
      end_time: slot.end_time,
      amount: slot.price,
      notes: input.notes ?? null,
      baby_birth_date: input.babyBirthDate || null,
    })
    .select("id, booking_number")
    .single();

  if (error || !booking) {
    // تراجع: حرّر الفتحة كي لا تبقى محجوزة بلا حجز
    await supabase.rpc("unbook_slot", { slot_id: input.slotId });
    return { error: error?.message ?? "فشل إنشاء الحجز" };
  }

  return {
    id: booking.id as string,
    bookingNumber: booking.booking_number as string,
    amount: slot.price,
  };
}

/* ── الدفع ── */

/**
 * يُعلّم الحجز مدفوعًا ويؤكّده (من HYP callback). يعيد UUID الحجز أو null.
 * يُطابق نمط markOrderPaid — التعريف برقم الحجز (BK-…) لأن Fild1 غير موثوق.
 */
export async function markBookingPaid(
  bookingNumber: string,
  paymentRef: string
): Promise<string | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("bookings")
    .update({
      payment_status: "paid",
      status: "confirmed",
      payment_method: "HYP",
      payment_ref: paymentRef,
    })
    .eq("booking_number", bookingNumber)
    .select("id")
    .single();
  return (data?.id as string | undefined) ?? null;
}

/** يعيد UUID الحجز برقمه (BK-…) — لتوجيه callback عند فشل الدفع */
export async function getBookingIdByNumber(bookingNumber: string): Promise<string | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("bookings")
    .select("id")
    .eq("booking_number", bookingNumber)
    .single();
  return (data?.id as string | undefined) ?? null;
}

/**
 * حجز واحد بالـ UUID، مع بيانات الجلسة (رابط اللقاء/المكان) من الفتحة.
 * تُقرأ وقت العرض لا وقت الحجز، كي تلتقط رابطًا أضافته هبة بعد التسجيل.
 */
export async function getBookingById(id: string): Promise<BookingRow | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("bookings")
    .select("*, availability(meeting_link, location)")
    .eq("id", id)
    .single();
  if (!data) return null;

  const session = data.availability as { meeting_link: string | null; location: string | null } | null;
  return {
    ...toBooking(data),
    meeting_link: session?.meeting_link ?? null,
    location: session?.location ?? null,
  };
}

export interface BookingListFilters {
  status?: BookingStatus | "all";
  date?: string;
  serviceSlug?: string;
}

/** قائمة الحجوزات للأدمن — فلترة بالحالة/التاريخ/الخدمة */
export async function listBookings(filters: BookingListFilters = {}): Promise<BookingRow[]> {
  const supabase = createAdminClient();
  let query = supabase.from("bookings").select("*").order("created_at", { ascending: false });

  if (filters.status && filters.status !== "all") query = query.eq("status", filters.status);
  if (filters.date) query = query.eq("date", filters.date);
  if (filters.serviceSlug) query = query.eq("service_slug", filters.serviceSlug);

  const { data } = await query;
  return (data ?? []).map(toBooking);
}

/** تغيير حالة الحجز + تسجيلها؛ الإلغاء يحرّر الفتحة */
export async function updateBookingStatus(
  id: string,
  newStatus: BookingStatus,
  note: string | null,
  adminId: string | null
): Promise<void> {
  const supabase = createAdminClient();

  const { data: current } = await supabase
    .from("bookings")
    .select("status, availability_id")
    .eq("id", id)
    .single();
  const oldStatus = (current?.status as string | undefined) ?? null;

  const { error } = await supabase.from("bookings").update({ status: newStatus }).eq("id", id);
  if (error) throw new Error(error.message);

  // إلغاء → حرّر الفتحة
  if (newStatus === "cancelled" && oldStatus !== "cancelled" && current?.availability_id) {
    await supabase.rpc("unbook_slot", { slot_id: current.availability_id });
  }

  await supabase.from("booking_status_history").insert({
    booking_id: id,
    old_status: oldStatus,
    new_status: newStatus,
    note,
    changed_by: adminId,
  });
}

/** سجلّ تغيّر حالة الحجز */
export async function getBookingStatusHistory(bookingId: string): Promise<StatusHistoryRow[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("booking_status_history")
    .select("*")
    .eq("booking_id", bookingId)
    .order("created_at", { ascending: false });

  return (data ?? []).map((r) => ({
    id: String(r.id),
    old_status: (r.old_status as string | null) ?? null,
    new_status: String(r.new_status),
    note: (r.note as string | null) ?? null,
    created_at: String(r.created_at),
  }));
}
