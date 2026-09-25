import { createAdminClient } from "@/lib/supabase/admin";
import { getService } from "@/lib/services/getService";
import { checkBabyAge, hasAgeGate } from "@/lib/utils/age";
import { isBookingTopicValid, normalizeBookingTopic } from "@/lib/utils/bookingTopic";
import { isBookingCityValid, normalizeBookingCity } from "@/lib/utils/bookingCity";
import { isBabyBorn, isBabyNameValid, normalizeBabyName } from "@/lib/utils/babyName";
import { israelTodayISO } from "@/lib/sessions/time";
import { DOMESTIC_ONLY_CODE } from "@/lib/geo/country";
import { ilsToUsd, orderUsdRate, type Currency } from "@/lib/currency";
import { isOnlineSession } from "@/lib/services/session";
import { toLatinDigits } from "@/lib/utils/format";
import { isHypConfigured } from "@/lib/hyp/client";
import { forceSeat, reacquireSeat, releaseExpiredSeatHolds, releaseSeat, seatHoldExpiry } from "@/lib/bookings/seatHold";
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
  /** سبب الحجب — يُعرض في لوحة المواعيد فقط */
  block_reason: string | null;
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
  /** بلدة الأم — null للحجوزات السابقة لهجرة 0025 */
  city: string | null;
  service_slug: string | null;
  service_name: string | null;
  availability_id: string | null;
  date: string;
  start_time: string;
  end_time: string | null;
  status: BookingStatus;
  payment_status: PaymentStatus;
  amount: number;
  /** عملة الخصم — الدولار من خارج البلاد */
  currency: Currency;
  /** المبلغ المخصوم بعملة currency — null للحجوزات القديمة (= amount بالشيكل) */
  charged_amount: number | null;
  /** ₪ لكل $1 وقت الحجز — للحجوزات بالدولار */
  exchange_rate: number | null;
  notes: string | null;
  admin_notes: string | null;
  /** موضوع اللقاء كما كتبته الأم — للخدمات التي تسأل عنه (askTopic) فقط */
  topic: string | null;
  /** تاريخ ميلاد الطفل — للورشات ذات الفئة العمرية فقط */
  baby_birth_date: string | null;
  /** اسم الطفل الكامل — مع تاريخ ميلاده؛ فارغ لطفل لم يُولد بعد أو لحجز سابق لهجرة 0020 */
  baby_name?: string | null;
  /** لغة العميلة — null للحجوزات السابقة لهجرة 0017 (تُعامَل بالعربية) */
  locale: string | null;
  created_at: string;
  updated_at: string;
  /** من الفتحة — رابط اللقاء (أونلاين). يُقرأ وقت العرض لا وقت الحجز
   *  كي تلتقط رابطًا أضافته هبة لاحقًا. */
  meeting_link?: string | null;
  /** من الفتحة — مكان اللقاء (حضوري) */
  location?: string | null;
}

export function toSlot(r: Record<string, unknown>): SlotRow {
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
    city: row.city ? toLatinDigits(row.city) : null,
    service_name: row.service_name ? toLatinDigits(row.service_name) : null,
    notes: row.notes ? toLatinDigits(row.notes) : null,
    admin_notes: row.admin_notes ? toLatinDigits(row.admin_notes) : null,
    topic: row.topic ? toLatinDigits(row.topic) : null,
    amount: Number(r.amount ?? 0),
    currency: (r.currency as Currency | undefined) ?? "ILS",
    charged_amount: r.charged_amount == null ? null : Number(r.charged_amount),
    exchange_rate: r.exchange_rate == null ? null : Number(r.exchange_rate),
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

/** الفتحات القادمة (للأدمن) — من اليوم فصاعدًا */
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

/**
 * كل الجلسات القادمة لخدمة — **بما فيها المكتملة**: غير المحجوبة، من اليوم فصاعدًا.
 * للرزنامة (تعرض المكتملة رمادية ولا تحجزها) ولعدّاد المقاعد في صفحة الورشة.
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
  /** بلدة الأم — إلزامية لكل تسجيل */
  city?: string | null;
  notes?: string;
  /** موضوع اللقاء — إلزامي للخدمات التي تسأل عنه (askTopic)، ويُتجاهل في غيرها */
  topic?: string | null;
  /** تاريخ ميلاد الطفل (أو الموعد المتوقّع) — إلزامي للورشات ذات فئة عمرية */
  babyBirthDate?: string | null;
  /** اسم الطفل الكامل — إلزامي مع تاريخ ميلاد (مولود)، ويُتجاهل خارج الورشات ذات الفئة العمرية */
  babyName?: string | null;
  /** لغة الصفحة وقت التسجيل — تحدّد لغة إيميل التأكيد */
  locale?: string;
  /** هل الزائرة داخل البلاد؟ يُحسب في الـ route من ترويسات Vercel — اللقاء الحضوري يُحجز من داخلها فقط؛ غيابه = داخل البلاد */
  domestic?: boolean;
  /** عملة الخصم — الدولار من خارج البلاد (يحدّدها الـ route من موقع الزائرة) */
  currency?: Currency;
}

/** فشل الحجز — status يميّز سبب الرفض (400 بيانات · 403 من خارج البلاد · 409 امتلاء)، وcode تقرأه الواجهة */
type BookingError = { error: string; status?: number; code?: string };

/**
 * ينشئ حجزًا — يتحقق من أن اللقاء الحضوري من داخل البلاد، ومن الفئة العمرية وموضوع اللقاء، ثم يحجز الفتحة ذرّيًا
 * (يمنع تجاوز السعة) ثم يُدرج الحجز.
 * التحقق هنا لا في الواجهة فقط — الواجهة قابلة للتجاوز.
 */
export async function createBooking(
  input: CreateBookingInput
): Promise<{ id: string; bookingNumber: string; amount: number; currency: Currency; chargedAmount: number } | BookingError> {
  const supabase = createAdminClient();

  const { data: slotRaw } = await supabase
    .from("availability")
    .select("*")
    .eq("id", input.slotId)
    .single();
  if (!slotRaw) return { error: "الموعد غير موجود", status: 404 };
  const slot = toSlot(slotRaw);

  const service = slot.service_slug ? await getService(slot.service_slug) : null;

  // ── القواعد قبل حجز المقعد — كي لا نحجز ثم نتراجع ──
  // اللقاء الحضوري (الناصرة أو بيت الأم) من داخل البلاد فقط
  if (!isOnlineSession(slot, service?.type) && input.domestic === false) {
    return { error: "اللقاء الحضوري يُحجز من داخل البلاد فقط", status: 403, code: DOMESTIC_ONLY_CODE };
  }

  // البلدة تُسأل في كل تسجيل — هبة تحتاج أن تعرف من أين تأتي المسجِّلات
  const city = normalizeBookingCity(input.city);
  if (!isBookingCityValid(city)) {
    return { error: "اكتبي اسم بلدتك", status: 400 };
  }

  /** يُحفظ فقط للخدمات التي تسأل عنه — فلا تلمس حجوزاتُ غيرها عمودَ topic */
  let topic: string | null = null;
  /** اسم الطفل — للخدمات ذات الفئة العمرية فقط، وكالموضوع لا يُكتب حين يغيب */
  let babyName: string | null = null;
  if (service && hasAgeGate(service)) {
    if (!input.babyBirthDate) {
      return { error: "تاريخ ميلاد الطفل مطلوب لهذه الورشة", status: 400 };
    }
    const check = checkBabyAge(input.babyBirthDate, slot.date, service);
    if (!check.ok) {
      return { error: check.message ?? "عمر الطفل خارج الفئة العمرية للورشة", status: 400 };
    }
    // الاسم للمولود فقط وإلزامي له — الموعد المتوقّع (حامل) بلا اسم
    if (isBabyBorn(input.babyBirthDate, israelTodayISO())) {
      babyName = normalizeBabyName(input.babyName);
      if (!isBabyNameValid(babyName)) {
        return { error: "اكتبي اسم الطفل الكامل", status: 400 };
      }
    }
  }
  if (service?.askTopic) {
    topic = normalizeBookingTopic(input.topic);
    if (!isBookingTopicValid(topic)) {
      return { error: "اكتبي موضوع اللقاء", status: 400 };
    }
  }

  // عملة الخصم: الدولار من خارج البلاد بسعر الخدمة الثابت بالدولار — يُحفظ ليثبت المبلغ
  const currency: Currency = input.currency ?? "ILS";
  // سعر الدولار الثابت للخدمة (Studio) — كل جلساتها بالسعر نفسه من خارج البلاد
  const exchangeRate =
    currency === "USD" ? orderUsdRate([{ ils: slot.price, usd: service?.priceUsd, quantity: 1 }]) : null;
  const chargedAmount = exchangeRate ? ilsToUsd(slot.price, exchangeRate) : slot.price;

  // مقاعد من تركت الدفع وانتهى حجزها المؤقت تعود أولًا — كي لا تُرفض أم على مقعد متاح فعلًا
  await releaseExpiredSeatHolds();

  // حجز ذرّي — يعيد false لو امتلأت أو محجوبة. الجلسة المدفوعة: حجز مؤقت ينتهي إن لم يتم الدفع
  const holdUntil = slot.price > 0 && isHypConfigured() ? seatHoldExpiry() : null;
  const { data: booked } = await supabase.rpc("book_slot", { slot_id: input.slotId });
  if (!booked) return { error: "عذرًا، هذا الموعد لم يعد متاحًا", status: 409 };

  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      customer_name: input.customer.name,
      customer_email: input.customer.email,
      customer_phone: input.customer.phone,
      city,
      service_slug: slot.service_slug,
      service_name: slot.service_name,
      availability_id: slot.id,
      date: slot.date,
      start_time: slot.start_time,
      end_time: slot.end_time,
      amount: slot.price,
      currency,
      charged_amount: chargedAmount,
      exchange_rate: exchangeRate,
      notes: input.notes ?? null,
      ...(topic ? { topic } : {}),
      baby_birth_date: input.babyBirthDate || null,
      ...(babyName ? { baby_name: babyName } : {}),
      seat_held: true,
      hold_expires_at: holdUntil,
      locale: input.locale === "ar" || input.locale === "he" || input.locale === "en" ? input.locale : null,
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
    currency,
    chargedAmount,
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
): Promise<{ id: string; firstPayment: boolean } | null> {
  const supabase = createAdminClient();
  // الانتقال الأول إلى «مدفوع» فقط — إعادة فتح عنوان العودة لا تكرّر الإشعارات؛ والمقعد يصير ثابتًا
  const { data } = await supabase
    .from("bookings")
    .update({
      payment_status: "paid",
      status: "confirmed",
      payment_method: "HYP",
      payment_ref: paymentRef,
      hold_expires_at: null,
    })
    .eq("booking_number", bookingNumber)
    .neq("payment_status", "paid")
    .select("id, seat_held, availability_id")
    .maybeSingle();

  if (!data) {
    const id = await getBookingIdByNumber(bookingNumber);
    return id ? { id, firstPayment: false } : null;
  }

  // دفعت بعد انتهاء حجزها المؤقت: تأخذ مقعدًا ثابتًا — وإن اكتمل العدد في الأثناء فلها مقعدها وتُنبَّه هبة
  if (!data.seat_held && data.availability_id) {
    const id = String(data.id), slotId = String(data.availability_id);
    if (!(await reacquireSeat(id, slotId, null))) {
      await forceSeat(id, slotId);
      await supabase.from("bookings").update({ admin_notes: OVERBOOKED_NOTE }).eq("id", id);
    }
  }
  return { id: String(data.id), firstPayment: true };
}

/** ملاحظة لهبة: دفعت بعد انتهاء الحجز المؤقت والجلسة ممتلئة */
const OVERBOOKED_NOTE =
  "دفعت بعد انتهاء حجز المقعد المؤقت، وكانت الجلسة قد اكتملت في الأثناء — المقاعد الآن أكثر من السعة بواحد.";

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

  // إلغاء → حرّر مقعدها إن كانت تحجز مقعدًا (الحجز المؤقت المنتهي تحرّر مقعده من قبل)
  if (newStatus === "cancelled" && oldStatus !== "cancelled") {
    await releaseSeat(id);
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

/* ── تذكير اليوم السابق ── */

/** حجوزات موعدها بين تاريخين (اليوم وغدًا) ولم يصلها التذكير بعد — مع رابط/مكان جلستها الحاليَّين */
export async function listBookingsAwaitingReminder(fromDate: string, toDate: string): Promise<BookingRow[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("bookings")
    .select("*, availability(meeting_link, location)")
    .eq("reminder_24h_sent", false)
    .neq("status", "cancelled")
    .gte("date", fromDate)
    .lte("date", toDate);
  return (data ?? []).map((row) => {
    const session = (row as { availability?: { meeting_link: string | null; location: string | null } | null }).availability;
    return {
      ...toBooking(row as Record<string, unknown>),
      meeting_link: session?.meeting_link ?? null,
      location: session?.location ?? null,
    };
  });
}

/** يُعلّم الحجز بأن تذكير اليوم السابق أُرسل (أو لم يعد لازمًا) */
export async function markReminderSent(id: string): Promise<void> {
  const supabase = createAdminClient();
  await supabase.from("bookings").update({ reminder_24h_sent: true }).eq("id", id);
}
