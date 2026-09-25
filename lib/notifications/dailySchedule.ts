import { listUpcomingSlots } from "@/lib/db/bookings";
import { getActiveBookingsForSlots } from "@/lib/db/sessions";
import { canFulfill } from "@/lib/orders/fulfillment";
import { babyAgeDetailedLabel, correctedAgeLabel } from "@/lib/utils/age";
import { israelTodayISO, shortTime, weekdayAr } from "@/lib/sessions/time";
import { notifyHebaDailySchedule, type DailyScheduleParams } from "@/lib/whatsapp/notify";

/**
 * جدول اليوم — رسالة واتساب واحدة لهبة كل صباح، فيها جلسات اليوم ومن ستحضر.
 *
 * يُستدعى من `/api/cron/reminders` (Vercel Cron يوميًا 06:00 UTC) مع تذكيرات الأمهات،
 * فلا يحتاج مهمة مجدولة ثانية — وخطة Hobby لا تسمح بأكثر من مهمتين يوميًا أصلًا.
 *
 * **يسكت في اليوم الفارغ**: رسالة تصل كل صباح بلا محتوى تُتجاهَل، فيضيع معها اليوم المهمّ.
 * وبارامترات قوالب واتساب لا تقبل أسطرًا جديدة، فالجلسات كلّها في سطر واحد بفواصل.
 */

/** أمّ مسجَّلة — ما تحتاج هبة معرفته عنها قبل الجلسة */
export interface ScheduleAttendee {
  name: string;
  phone: string;
  /** بلدتها — فارغة للحجوزات السابقة لهجرة 0025 */
  city: string | null;
  babyName: string | null;
  babyBirthDate: string | null;
  /** أسبوع ولادة الخديج — عمره المصحَّح هو ما يعني هبة */
  gestationalWeeks: number | null;
  /** موضوع اللقاء كما كتبته — للّقاءات الفردية التي تسأل عنه فقط */
  topic: string | null;
}

/** جلسة واحدة كما تدخل الرسالة — مُعطاة صراحةً كي تبقى الصياغة دالةً صافية */
export interface ScheduleSession {
  startTime: string;
  serviceName: string;
  /** من ستحضر فعلًا — المدفوعة (أو المجانية) غير الملغاة */
  attendees: ScheduleAttendee[];
}

/** أكثر ما يُذكر من الأمهات في جلسة، والباقي «+٣» — كي لا يصير السطر كتلة */
const MAX_NAMES = 6;

/**
 * أقصى طول للبارامتر الواحد — حدّ جسم قالب واتساب 1024 حرفًا، فنترك متّسعًا
 * للنصّ الثابت وباقي البارامترات. يوم مزدحم يتجاوزه، فتسقط التفاصيل أولًا
 * وتبقى الأسماء — الأسماء بلا تفاصيل خيرٌ من رسالة يرفضها Meta.
 */
const MAX_PARAM_LENGTH = 850;

/**
 * أطول ما يُذكر من موضوع اللقاء — تكتبه الأم حتى 500 حرف، والجدول تذكيرٌ لا نصّ كامل.
 * الموضوع كاملًا في `/admin/bookings` وفي إيميل الحجز.
 */
const MAX_TOPIC_LENGTH = 70;

/** صيغ العدد بالعربية — المفرد والمثنّى وجمع القلّة (٣–١٠) وتمييز الكثرة (١١+) */
interface CountForms {
  zero: string;
  one: string;
  two: string;
  few: string;
  many: string;
}

const SESSIONS: CountForms = { zero: "لا جلسات", one: "جلسة واحدة", two: "جلستان", few: "جلسات", many: "جلسة" };
const ATTENDEES: CountForms = { zero: "بلا مسجّلات", one: "مسجّلة واحدة", two: "مسجّلتان", few: "مسجّلات", many: "مسجّلة" };

function countAr(n: number, forms: CountForms): string {
  if (n === 0) return forms.zero;
  if (n === 1) return forms.one;
  if (n === 2) return forms.two;
  return `${n} ${n <= 10 ? forms.few : forms.many}`;
}

/** موضوع اللقاء مختصرًا — سطر في جدول، لا نصّها كاملًا */
function shortTopic(topic: string | null): string | null {
  const text = topic?.replace(/\s+/g, " ").trim();
  if (!text) return null;
  return `📝 ${text.length > MAX_TOPIC_LENGTH ? `${text.slice(0, MAX_TOPIC_LENGTH).trimEnd()}…` : text}`;
}

/** الأم بتفاصيلها: الاسم · البلدة · الهاتف · الطفل وعمره · موضوع لقائها — الموجود منها فقط */
function attendeeText(attendee: ScheduleAttendee, date: string): string {
  // الخديج بعمره المصحَّح — هو ما يحدّد ما يقدر عليه في الجلسة
  const corrected = attendee.babyBirthDate
    ? correctedAgeLabel(attendee.babyBirthDate, date, attendee.gestationalWeeks)
    : null;
  const baby = attendee.babyBirthDate
    ? `${attendee.babyName ?? "الطفل"} ${corrected ?? babyAgeDetailedLabel(attendee.babyBirthDate, date)}${corrected ? " (مصحَّح)" : ""}`
    : attendee.babyName;
  return [attendee.name, attendee.city, attendee.phone, baby, shortTopic(attendee.topic)]
    .filter(Boolean)
    .join(" · ");
}

/** سطر جلسة: الساعة · الورشة · من ستحضر — بالتفاصيل أو بالأسماء وحدها */
function sessionLine(session: ScheduleSession, date: string, detailed: boolean): string {
  const shown = session.attendees.slice(0, MAX_NAMES);
  const hidden = session.attendees.length - shown.length;
  const who =
    session.attendees.length === 0
      ? ATTENDEES.zero
      : `${countAr(session.attendees.length, ATTENDEES)}: ` +
        shown.map((a) => (detailed ? `▪ ${attendeeText(a, date)}` : a.name)).join(detailed ? " " : "، ") +
        (hidden > 0 ? ` +${hidden}` : "");
  return `⏰ ${shortTime(session.startTime)} ${session.serviceName} — ${who}`;
}

/** يصوغ بارامترات القالب — `null` ليوم بلا جلسة (فلا تُرسَل رسالة أصلًا) */
export function buildDailySchedule(date: string, sessions: ScheduleSession[]): DailyScheduleParams | null {
  if (sessions.length === 0) return null;

  const [year, month, day] = date.split("-").map(Number);
  const attendees = sessions.reduce((total, s) => total + s.attendees.length, 0);

  const compose = (detailed: boolean) => sessions.map((s) => sessionLine(s, date, detailed)).join("  ");
  const detailed = compose(true);
  // يوم مزدحم: التفاصيل أولًا، ثم الأسماء، ثم قصّ — حدّ Meta يرفض الرسالة كلّها لا يقصّها
  const text = detailed.length <= MAX_PARAM_LENGTH ? detailed : compose(false);

  return {
    dateLabel: `${weekdayAr(date)} ${day}/${month}/${year}`,
    summary: `${countAr(sessions.length, SESSIONS)} · ${countAr(attendees, ATTENDEES)}`,
    sessions: text.length <= MAX_PARAM_LENGTH ? text : `${text.slice(0, MAX_PARAM_LENGTH - 1).trimEnd()}…`,
  };
}

/** يجمع جلسات اليوم ويرسل الجدول — الجلسة المحجوبة ليست قائمة فلا تُذكر */
export async function sendHebaDailySchedule(today = israelTodayISO()): Promise<{ sessions: number; sent: boolean }> {
  const slots = (await listUpcomingSlots()).filter((slot) => slot.date === today && !slot.is_blocked);
  if (slots.length === 0) return { sessions: 0, sent: false };

  const bookings = await getActiveBookingsForSlots(slots.map((slot) => slot.id));
  const sessions: ScheduleSession[] = slots.map((slot) => ({
    startTime: slot.start_time,
    serviceName: slot.service_name ?? "جلسة",
    // من لم تُكمل دفعها ليست قادمة — نفس قاعدة التأكيد والتسليم في كل الموقع
    attendees: (bookings.get(slot.id) ?? [])
      .filter((b) => canFulfill(b.payment_status, b.amount, b.status === "cancelled"))
      .map((b) => ({
        name: b.customer_name,
        phone: b.customer_phone,
        city: b.city,
        babyName: b.baby_name,
        babyBirthDate: b.baby_birth_date,
        gestationalWeeks: b.gestational_weeks,
        topic: b.topic,
      })),
  }));

  const message = buildDailySchedule(today, sessions);
  if (!message) return { sessions: 0, sent: false };

  return { sessions: sessions.length, sent: await notifyHebaDailySchedule(message) };
}
