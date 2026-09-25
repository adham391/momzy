import { createAdminClient } from "@/lib/supabase/admin";
import { toSlot, updateBookingStatus, type SlotRow } from "./bookings";
import type { Currency } from "@/lib/currency";
import { addMinutesToTime, isValidRange } from "@/lib/sessions/time";

/**
 * إدارة الجلسات من لوحة الأدمن — تعديل وتحريك وحجب وإلغاء.
 *
 * الحجز يحفظ نسخة من الموعد (date/start_time/end_time) وقت التسجيل، فكل تغيير
 * في وقت الجلسة يُنسخ إلى حجوزاتها غير الملغاة — وإلا بقيت الأم على الموعد القديم
 * في صفحتها وإيميلاتها. الإشعارات في lib/notifications/sessionChange.ts.
 */

/** المسجِّلة في جلسة — ما تحتاجه اللوحة والإشعارات */
export interface SessionBooking {
  id: string;
  booking_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  status: string;
  payment_status: string;
  amount: number;
  currency: Currency;
  charged_amount: number | null;
  /** لغة الأم — تحدّد لغة إيميل التغيير */
  locale: string | null;
  /** بلدة الأم — null للحجوزات السابقة لهجرة 0025 */
  city: string | null;
  /** تاريخ ميلاد الطفل — للورشات ذات الفئة العمرية فقط */
  baby_birth_date: string | null;
  /** اسم الطفل — مع تاريخ الميلاد، وفارغ لمن لم يُولد بعد */
  baby_name: string | null;
  /** موضوع اللقاء كما كتبته الأم — للخدمات التي تسأل عنه (askTopic) فقط */
  topic: string | null;
  /** أسبوع ولادة الخديج — منه العمر المصحَّح */
  gestational_weeks: number | null;
}

const BOOKING_FIELDS =
  "id, booking_number, customer_name, customer_phone, customer_email, status, payment_status, amount, currency, charged_amount, locale, city, baby_birth_date, baby_name, topic, gestational_weeks, availability_id";

function toSessionBooking(r: Record<string, unknown>): SessionBooking {
  return {
    id: String(r.id),
    booking_number: String(r.booking_number),
    customer_name: String(r.customer_name ?? ""),
    customer_phone: String(r.customer_phone ?? ""),
    customer_email: String(r.customer_email ?? ""),
    status: String(r.status ?? "pending"),
    payment_status: String(r.payment_status ?? "pending"),
    amount: Number(r.amount ?? 0),
    currency: (r.currency as Currency | undefined) ?? "ILS",
    charged_amount: r.charged_amount == null ? null : Number(r.charged_amount),
    locale: (r.locale as string | null) ?? null,
    city: (r.city as string | null) ?? null,
    baby_birth_date: (r.baby_birth_date as string | null) ?? null,
    baby_name: (r.baby_name as string | null) ?? null,
    topic: (r.topic as string | null) ?? null,
    gestational_weeks: r.gestational_weeks == null ? null : Number(r.gestational_weeks),
  };
}

/** الحجوزات غير الملغاة لعدّة جلسات — خريطة id الجلسة ← حجوزاتها */
export async function getActiveBookingsForSlots(slotIds: string[]): Promise<Map<string, SessionBooking[]>> {
  const map = new Map<string, SessionBooking[]>();
  if (slotIds.length === 0) return map;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("bookings")
    .select(BOOKING_FIELDS)
    .in("availability_id", slotIds)
    .neq("status", "cancelled")
    .order("created_at", { ascending: true });
  for (const row of data ?? []) {
    const r = row as Record<string, unknown>;
    const slotId = String(r.availability_id);
    map.set(slotId, [...(map.get(slotId) ?? []), toSessionBooking(r)]);
  }
  return map;
}

/** الحجوزات غير الملغاة لجلسة واحدة */
export async function getActiveBookingsForSlot(slotId: string): Promise<SessionBooking[]> {
  return (await getActiveBookingsForSlots([slotId])).get(slotId) ?? [];
}

async function getSlot(id: string): Promise<SlotRow> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("availability").select("*").eq("id", id).maybeSingle();
  if (!data) throw new Error("الجلسة غير موجودة — ربما حُذفت");
  return toSlot(data as Record<string, unknown>);
}

/* ── الإنشاء ── */

export interface SessionInput {
  date: string;
  startTime: string;
  endTime: string;
  serviceSlug: string;
  serviceName: string;
  price: number;
  capacity: number;
  meetingLink: string | null;
  location: string | null;
  notes: string | null;
  createdBy: string | null;
}

/** ينشئ عدّة جلسات دفعة واحدة (جلسة واحدة، أو متتالية، أو تكرار أسبوعي) */
export async function createSessions(inputs: SessionInput[]): Promise<number> {
  if (inputs.length === 0) return 0;
  for (const s of inputs) {
    if (!isValidRange(s.startTime, s.endTime)) throw new Error(`وقت غير صالح: ${s.startTime}–${s.endTime}`);
  }
  const supabase = createAdminClient();
  const { error, data } = await supabase
    .from("availability")
    .insert(
      inputs.map((s) => ({
        date: s.date,
        start_time: s.startTime,
        end_time: s.endTime,
        service_slug: s.serviceSlug,
        service_name: s.serviceName,
        price: s.price,
        capacity: s.capacity,
        meeting_link: s.meetingLink,
        location: s.location,
        notes: s.notes,
        created_by: s.createdBy,
      }))
    )
    .select("id");
  if (error) throw new Error(error.message);
  return data?.length ?? 0;
}

/* ── التعديل ── */

export interface SessionPatch {
  date?: string;
  startTime?: string;
  endTime?: string;
  capacity?: number;
  price?: number;
  meetingLink?: string | null;
  location?: string | null;
  notes?: string | null;
}

/** نتيجة تعديل جلسة — ما قبل وما بعد، والمسجِّلات اللواتي يهمّهن التغيير */
export interface SessionChange {
  before: SlotRow;
  after: SlotRow;
  bookings: SessionBooking[];
  /** تغيّر التاريخ أو الوقت — ما يستدعي إبلاغ المسجِّلات */
  timeChanged: boolean;
}

/**
 * يعدّل جلسة. تغيير الموعد يُنسخ إلى حجوزاتها غير الملغاة.
 * السعة لا تنزل تحت المحجوز فعلًا.
 */
export async function updateSession(id: string, patch: SessionPatch): Promise<SessionChange> {
  const before = await getSlot(id);
  const date = patch.date ?? before.date;
  const startTime = patch.startTime ?? before.start_time;
  const endTime = patch.endTime ?? before.end_time;
  const capacity = patch.capacity ?? before.capacity;

  if (!isValidRange(startTime, endTime)) throw new Error("وقت النهاية يجب أن يكون بعد البداية");
  if (capacity < before.booked_count) {
    throw new Error(`لا يمكن تقليل المقاعد إلى ${capacity} — المحجوز فعلًا ${before.booked_count}`);
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("availability")
    .update({
      date,
      start_time: startTime,
      end_time: endTime,
      capacity,
      price: patch.price ?? before.price,
      meeting_link: patch.meetingLink === undefined ? before.meeting_link : patch.meetingLink,
      location: patch.location === undefined ? before.location : patch.location,
      notes: patch.notes === undefined ? before.notes : patch.notes,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  const after = await getSlot(id);
  const bookings = await getActiveBookingsForSlot(id);
  const timeChanged =
    after.date !== before.date || after.start_time !== before.start_time || after.end_time !== before.end_time;

  // الحجوزات تحمل نسخة من الموعد — تُحدَّث معه كي تراه الأم صحيحًا في صفحتها وإيميلاتها،
  // ويُعاد ضبط علامة التذكير كي يصلها تذكير اليوم السابق للموعد الجديد (برابط اللقاء/المكان)
  if (timeChanged && bookings.length > 0) {
    const { error: bookingsError } = await supabase
      .from("bookings")
      .update({ date: after.date, start_time: after.start_time, end_time: after.end_time, reminder_24h_sent: false })
      .in(
        "id",
        bookings.map((b) => b.id)
      );
    if (bookingsError) throw new Error(bookingsError.message);
  }

  return { before, after, bookings, timeChanged };
}

/** حجب/إظهار جلسة — المحجوبة لا تظهر للعميلات ولا تُحجز، وحجوزاتها الحالية تبقى */
export async function setSessionBlocked(id: string, blocked: boolean, reason: string | null): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("availability")
    .update({ is_blocked: blocked, block_reason: blocked ? reason : null })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

/** تحريك يوم كامل: كل جلسات التاريخ تنتقل إلى تاريخ آخر و/أو تتقدّم/تتأخّر بدقائق */
export async function shiftDaySessions(
  date: string,
  move: { newDate?: string; deltaMinutes?: number }
): Promise<SessionChange[]> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("availability").select("*").eq("date", date).order("start_time");
  const slots = (data ?? []).map((r) => toSlot(r as Record<string, unknown>));
  if (slots.length === 0) throw new Error("لا جلسات في هذا اليوم");

  const delta = move.deltaMinutes ?? 0;
  const newDate = move.newDate ?? date;
  if (newDate === date && delta === 0) throw new Error("لم يتغيّر شيء — اختاري تاريخًا جديدًا أو دقائق للتحريك");

  // التحقق أولًا على كل الجلسات — كي لا يتحرّك نصف اليوم ويتعثّر النصف الآخر
  const moved = slots.map((slot) => {
    const startTime = addMinutesToTime(slot.start_time, delta);
    const endTime = addMinutesToTime(slot.end_time, delta);
    if (!startTime || !endTime) {
      throw new Error(`تحريك ${delta} دقيقة يُخرج جلسة ${slot.start_time.slice(0, 5)} من حدود اليوم`);
    }
    return { id: slot.id, startTime, endTime };
  });

  const changes: SessionChange[] = [];
  for (const m of moved) {
    changes.push(await updateSession(m.id, { date: newDate, startTime: m.startTime, endTime: m.endTime }));
  }
  return changes;
}

/* ── الإلغاء والحذف ── */

/**
 * يلغي جلسة: يلغي حجوزاتها غير الملغاة (فيتحرّر مقعدها ويُسجَّل في تاريخ الحجز)
 * ثم يحذفها. يعيد الجلسة ومسجِّلاتها — للإشعارات ولقائمة الاسترداد.
 */
export async function cancelSession(
  id: string,
  adminId: string | null,
  note: string | null
): Promise<{ slot: SlotRow; bookings: SessionBooking[] }> {
  const slot = await getSlot(id);
  const bookings = await getActiveBookingsForSlot(id);
  for (const b of bookings) {
    await updateBookingStatus(b.id, "cancelled", note ?? "أُلغيت الجلسة من لوحة المواعيد", adminId);
  }
  const supabase = createAdminClient();
  const { error } = await supabase.from("availability").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { slot, bookings };
}

/** حذف جلسة بلا حجوزات — الجلسة التي فيها مسجِّلات تُلغى بـ cancelSession لا تُحذف صامتةً */
export async function deleteSession(id: string): Promise<void> {
  const bookings = await getActiveBookingsForSlot(id);
  if (bookings.length > 0) {
    throw new Error(`في هذه الجلسة ${bookings.length} تسجيل — استعملي «إلغاء الجلسة» كي تُبلَّغ المسجِّلات`);
  }
  const supabase = createAdminClient();
  const { error } = await supabase.from("availability").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
