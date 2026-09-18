"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { currentAdminId } from "@/lib/admin/currentAdmin";
import { getService } from "@/lib/services/getService";
import {
  cancelSession,
  createSessions,
  deleteSession,
  setSessionBlocked,
  shiftDaySessions,
  updateSession,
  type SessionInput,
} from "@/lib/db/sessions";
import { notifySessionCancelled, notifySessionRescheduled } from "@/lib/notifications/sessionChange";

/**
 * أفعال صفحة إدارة المواعيد. كل فعل ينتهي بالعودة إلى الصفحة برسالة في أعلاها
 * (نجاح أو خطأ) — فلا تظهر لهبة شاشة خطأ تقنية، ولا تضيع نتيجة ما فعلت.
 */

const PAGE = "/admin/bookings/availability";
/** حدّ الإضافة الواحدة — يحمي من خطأ في التكرار ينشئ مئات الجلسات */
const MAX_SESSIONS_PER_CREATE = 60;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
function num(fd: FormData, key: string, fallback: number): number {
  const raw = str(fd, key);
  if (raw === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

/** نتيجة فعل: رسالة، واليوم الذي تُفتح عليه الرزنامة بعده (اليوم الذي انتقلت إليه الجلسة مثلًا) */
type Outcome = string | { notice: string; day?: string };

/** يعود إلى الصفحة برسالة واليوم المختار — redirect يرمي داخليًا فلا يُستدعى داخل try */
function finish(notice: string, tone: "ok" | "error", day: string): never {
  revalidatePath(PAGE);
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
  const dayParam = DATE_RE.test(day) ? `&day=${day}` : "";
  redirect(`${PAGE}?notice=${encodeURIComponent(notice)}&tone=${tone}${dayParam}`);
}

/** يشغّل عملية ويحوّل خطأها إلى رسالة في الصفحة؛ اليوم المختار يبقى كما كان ما لم يُحدَّد غيره */
async function attempt(formData: FormData, run: () => Promise<Outcome>): Promise<never> {
  let notice: string;
  let day = str(formData, "day");
  let tone: "ok" | "error" = "ok";
  try {
    const outcome = await run();
    if (typeof outcome === "string") notice = outcome;
    else {
      notice = outcome.notice;
      if (outcome.day) day = outcome.day;
    }
  } catch (err) {
    notice = err instanceof Error ? err.message : "حدث خطأ غير متوقّع";
    tone = "error";
  }
  return finish(notice, tone, day);
}

const count = (n: number, one: string, many: string) => (n === 1 ? one : `${n} ${many}`);

/** إضافة موعد واحد أو عدّة مواعيد (متتالية أو أسبوعية) — القائمة تأتي جاهزة من النموذج */
export async function createSessionsAction(formData: FormData) {
  await attempt(formData, async () => {
    const serviceSlug = str(formData, "service");
    const service = serviceSlug ? await getService(serviceSlug) : null;
    if (!service) throw new Error("اختاري الخدمة أولًا");

    let times: unknown;
    try {
      times = JSON.parse(str(formData, "sessions") || "[]");
    } catch {
      throw new Error("قائمة المواعيد غير مقروءة — حدّثي الصفحة وحاولي مجددًا");
    }
    if (!Array.isArray(times) || times.length === 0) throw new Error("لا مواعيد لإضافتها — تحقّقي من الوقت من/إلى");
    if (times.length > MAX_SESSIONS_PER_CREATE) throw new Error(`حدّ الإضافة الواحدة ${MAX_SESSIONS_PER_CREATE} موعدًا`);

    const capacity = Math.max(1, Math.floor(num(formData, "capacity", 1)));
    const price = Math.max(0, num(formData, "price", service.price ?? 0));
    const meetingLink = str(formData, "meeting_link") || null;
    const location = str(formData, "location") || null;
    const notes = str(formData, "notes") || null;
    const createdBy = await currentAdminId();

    const inputs: SessionInput[] = times.map((t) => {
      const { date, start, end } = t as { date?: unknown; start?: unknown; end?: unknown };
      if (typeof date !== "string" || !DATE_RE.test(date)) throw new Error("تاريخ غير صالح");
      if (typeof start !== "string" || !TIME_RE.test(start) || typeof end !== "string" || !TIME_RE.test(end)) {
        throw new Error("وقت غير صالح");
      }
      return {
        date,
        startTime: start,
        endTime: end,
        serviceSlug,
        serviceName: service.title,
        price,
        capacity,
        meetingLink,
        location,
        notes,
        createdBy,
      };
    });

    const n = await createSessions(inputs);
    return { notice: `أُضيف ${count(n, "موعد واحد", "مواعيد")} ✓`, day: inputs[0].date };
  });
}

/** تعديل جلسة — تغيير الموعد يُبلّغ المسجِّلات بالبريد تلقائيًا */
export async function updateSessionAction(formData: FormData) {
  await attempt(formData, async () => {
    const id = str(formData, "id");
    const date = str(formData, "date");
    const startTime = str(formData, "start_time");
    const endTime = str(formData, "end_time");
    if (!DATE_RE.test(date) || !TIME_RE.test(startTime) || !TIME_RE.test(endTime)) {
      throw new Error("التاريخ أو الوقت غير صالح");
    }
    const change = await updateSession(id, {
      date,
      startTime,
      endTime,
      capacity: Math.max(1, Math.floor(num(formData, "capacity", 1))),
      price: Math.max(0, num(formData, "price", 0)),
      meetingLink: str(formData, "meeting_link") || null,
      location: str(formData, "location") || null,
      notes: str(formData, "notes") || null,
    });
    if (!change.timeChanged) return "حُفظ التعديل ✓";
    const sent = await notifySessionRescheduled(change);
    const notice =
      sent > 0
        ? `حُفظ الموعد الجديد، وأُبلغت ${count(sent, "أم واحدة", "أمهات")} بالبريد ✓`
        : "حُفظ الموعد الجديد ✓ — لا مسجِّلات مؤكَّدات لإبلاغهن";
    // الرزنامة تنتقل إلى اليوم الجديد كي ترى هبة الجلسة حيث صارت
    return { notice, day: change.after.date };
  });
}

/** حجب/إظهار جلسة — المحجوبة تختفي عن العميلات وتبقى حجوزاتها */
export async function toggleSessionBlockedAction(formData: FormData) {
  await attempt(formData, async () => {
    const id = str(formData, "id");
    const block = str(formData, "block") === "1";
    await setSessionBlocked(id, block, str(formData, "reason") || null);
    return block ? "حُجبت الجلسة — لم تعد تظهر للعميلات ✓" : "أُعيد إظهار الجلسة ✓";
  });
}

/** تحريك كل جلسات يوم — إلى تاريخ آخر و/أو بدقائق تقديمًا أو تأخيرًا */
export async function shiftDayAction(formData: FormData) {
  await attempt(formData, async () => {
    const date = str(formData, "date");
    const newDate = str(formData, "new_date");
    if (!DATE_RE.test(date)) throw new Error("تاريخ غير صالح");
    if (newDate && !DATE_RE.test(newDate)) throw new Error("التاريخ الجديد غير صالح");
    const deltaMinutes = Math.round(num(formData, "delta_minutes", 0));

    const changes = await shiftDaySessions(date, {
      newDate: newDate && newDate !== date ? newDate : undefined,
      deltaMinutes,
    });
    let sent = 0;
    for (const change of changes) sent += await notifySessionRescheduled(change);
    const moved = count(changes.length, "جلسة واحدة", "جلسات");
    const notice = sent > 0 ? `حُرّكت ${moved}، وأُبلغت ${count(sent, "أم واحدة", "أمهات")} بالبريد ✓` : `حُرّكت ${moved} ✓`;
    return { notice, day: changes[0].after.date };
  });
}

/** إلغاء جلسة فيها تسجيلات — تُلغى حجوزاتها وتُبلَّغ الأمهات، ومن دفعت تُعاد لها أموالها يدويًا */
export async function cancelSessionAction(formData: FormData) {
  await attempt(formData, async () => {
    const id = str(formData, "id");
    const note = str(formData, "note") || null;
    const { slot, bookings } = await cancelSession(id, await currentAdminId(), note);
    const sent = await notifySessionCancelled(slot, bookings);
    const paid = bookings.filter((b) => b.payment_status === "paid" && b.amount > 0).length;
    const parts = [`أُلغيت الجلسة`];
    if (bookings.length > 0) parts.push(`وأُلغي ${count(bookings.length, "تسجيل واحد", "تسجيلات")}`);
    if (sent > 0) parts.push(`وأُبلغت ${count(sent, "أم واحدة", "أمهات")} بالبريد`);
    if (paid > 0) parts.push(`— ${count(paid, "أم واحدة دفعت", "دفعن")}: أعيدي المبالغ من لوحة HYP`);
    return `${parts.join(" ")} ✓`;
  });
}

/** حذف جلسة بلا تسجيلات */
export async function deleteSessionAction(formData: FormData) {
  await attempt(formData, async () => {
    await deleteSession(str(formData, "id"));
    return "حُذفت الجلسة ✓";
  });
}
