/**
 * whatsapp-preview.ts
 * ───────────────────
 * يطبع رسالة واتساب التي تصل هبة — كما سيقرؤها هاتفها، بلا إرسال شيء.
 *
 * تشغيل:
 *   npm run whatsapp:preview
 *
 * الجدول يُبنى من **جلسات اليوم الحقيقية** في Supabase؛ فإن لم يكن اليوم جلسة
 * يُعرض مثال بأسماء مُتخيَّلة كي يُرى شكل الرسالة.
 *
 * يتطلب في .env.local: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 * (يُحمّله `--env-file` في السكربت لا dotenv: الاستيرادات تُنفَّذ قبل أي سطر،
 *  وبعض الوحدات تنشئ عملاءها لحظة تحميلها فتفشل على بيئة فارغة.)
 */

import { buildDailySchedule, type ScheduleSession } from "@/lib/notifications/dailySchedule";
import { listUpcomingSlots } from "@/lib/db/bookings";
import { getActiveBookingsForSlots } from "@/lib/db/sessions";
import { canFulfill } from "@/lib/orders/fulfillment";
import { israelTodayISO } from "@/lib/sessions/time";

/** اسم القالب ونصّه كما يُسجَّلان في Meta — يُطبَع ليُنسخ كما هو عند إنشائه */
const TEMPLATE_NAME = "momzy_daily_schedule";
const TEMPLATE_BODY = [
  "🌸 صباح الخير هبة — جدول اليوم",
  "",
  "🗓️ {{1}}",
  "📋 {{2}}",
  "",
  "{{3}}",
  "",
  "🔎 لرؤية موضوع اللقاء كاملًا وملاحظات الأمهات، اضغطي:",
  "momzyworld.com/admin/bookings",
].join("\n");

/** يملأ {{1}}, {{2}}… بالقيم — كما يفعل واتساب عند التسليم */
function render(params: string[]): string {
  return params.reduce((text, value, i) => text.replaceAll(`{{${i + 1}}}`, value), TEMPLATE_BODY);
}

function print(title: string, params: string[]): void {
  console.log(`\n──────── ${title} (قالب ${TEMPLATE_NAME}) ────────\n`);
  console.log(render(params));
  console.log("");
}

/** جلسات اليوم الحقيقية — نفس ما يقرؤه الكرون */
async function todaySessions(today: string): Promise<ScheduleSession[]> {
  const slots = (await listUpcomingSlots()).filter((slot) => slot.date === today && !slot.is_blocked);
  if (slots.length === 0) return [];
  const bookings = await getActiveBookingsForSlots(slots.map((slot) => slot.id));
  return slots.map((slot) => ({
    startTime: slot.start_time,
    serviceName: slot.service_name ?? "جلسة",
    attendees: (bookings.get(slot.id) ?? [])
      .filter((b) => canFulfill(b.payment_status, b.amount, b.status === "cancelled"))
      .map((b) => ({
        name: b.customer_name,
        phone: b.customer_phone,
        city: b.city,
        babyName: b.baby_name,
        babyBirthDate: b.baby_birth_date,
        topic: b.topic,
      })),
  }));
}

const EXAMPLE_SESSIONS: ScheduleSession[] = [
  {
    startTime: "10:00:00",
    serviceName: "الورشة الحسية",
    attendees: [
      { name: "سارة أحمد", phone: "0501234567", city: "الناصرة", babyName: "ليان", babyBirthDate: "2026-04-20", topic: null },
      { name: "ريم خالد", phone: "0509876543", city: "حيفا", babyName: "آدم", babyBirthDate: "2026-02-11", topic: null },
    ],
  },
  {
    startTime: "17:30:00",
    serviceName: "لقاء فردي",
    attendees: [
      {
        name: "هدى علي",
        phone: "0521112233",
        city: "أم الفحم",
        babyName: "سما",
        babyBirthDate: "2026-09-08",
        topic: "صعوبة في الرضاعة وألم عند الإرضاع، وأريد أن أفهم وضعيات أفضل",
      },
    ],
  },
];

async function main() {
  const today = israelTodayISO();

  const real = await todaySessions(today);
  const schedule = buildDailySchedule(today, real.length > 0 ? real : EXAMPLE_SESSIONS);
  if (!schedule) return;

  print(real.length > 0 ? `بيانات حقيقية (${today})` : "مثال — لا جلسات اليوم فعليًا", [
    schedule.dateLabel,
    schedule.summary,
    schedule.sessions,
  ]);

  if (real.length === 0) {
    console.log("ℹ️  لا جلسات اليوم — في يوم كهذا لا تُرسَل رسالة أصلًا.\n");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
