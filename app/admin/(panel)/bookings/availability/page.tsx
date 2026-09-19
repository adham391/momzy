import Link from "next/link";
import { ArrowRight, Settings } from "lucide-react";
import { getServices } from "@/lib/services/getServices";
import { listUpcomingSlots } from "@/lib/db/bookings";
import { getActiveBookingsForSlots, type SessionBooking } from "@/lib/db/sessions";
import { getSessionDefaults } from "@/lib/db/settings";
import { israelTodayISO } from "@/lib/sessions/time";
import SessionsManager from "@/components/admin/sessions/SessionsManager";
import type { PageNotice, ServiceOption } from "@/components/admin/sessions/types";
import type { Service } from "@/lib/services/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "إدارة المواعيد — لوحة Momzy" };

/** مدّة الجلسة الافتراضية بالدقائق حين لا يُعرف غيرها — الورشة الجماعية أطول من اللقاء الفردي */
const DEFAULT_DURATION_MIN: Record<Service["type"], number> = { workshop: 120, individual: 60, online: 60, home: 90 };

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** ما يُعبَّأ تلقائيًا عند اختيار خدمة في نموذج الإضافة */
function toOption(service: Service, defaults: { zoomLink: string; venueAddress: string }): ServiceOption {
  const online = service.type === "online";
  return {
    slug: service.slug,
    title: service.title,
    online,
    price: service.price ?? 0,
    capacity: service.maxParticipants ?? 1,
    durationMin: DEFAULT_DURATION_MIN[service.type] ?? 60,
    meetingLink: online ? defaults.zoomLink : "",
    // الزيارة البيتية مكانها بيت الأم (نصّ الخدمة)؛ الحضوري في العنوان الثابت وإلا مدينة الخدمة
    location: online ? "" : service.type === "home" ? service.location : defaults.venueAddress || service.location,
  };
}

export default async function AvailabilityPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; tone?: string; day?: string }>;
}) {
  const sp = await searchParams;
  const notice: PageNotice | null = sp.notice ? { text: sp.notice, tone: sp.tone === "error" ? "error" : "ok" } : null;
  const initialDay = sp.day && DATE_RE.test(sp.day) ? sp.day : null;

  const [services, defaults, slots] = await Promise.all([getServices(), getSessionDefaults(), listUpcomingSlots()]);
  const bookingsMap = await getActiveBookingsForSlots(slots.map((s) => s.id));
  // كائن عادي لا Map — يعبر إلى المكوّن العميل
  const bookingsBySlot: Record<string, SessionBooking[]> = Object.fromEntries(bookingsMap);
  // الخدمات التي تُحجز عبر الموقع فقط — ما يُتَّفق عليه في واتساب لا مواعيد له هنا
  const options = services.filter((s) => !s.whatsappOnly).map((s) => toOption(s, defaults));
  const totalRegistered = [...bookingsMap.values()].reduce((n, list) => n + list.length, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Link href="/admin/bookings" className="inline-flex items-center gap-1.5 text-body-sm text-mid hover:text-dark">
          <ArrowRight size={16} /> الحجوزات
        </Link>
        <Link href="/admin/bookings/waitlist" className="text-body-sm font-bold text-teal hover:underline">
          قائمة الانتظار ←
        </Link>
      </div>

      <h1 className="font-heading text-h2 font-bold text-dark mb-1">إدارة المواعيد</h1>
      <p className="text-mid text-body-sm mb-5">
        {slots.length === 0
          ? "لا مواعيد قادمة بعد — اختاري يومًا من الرزنامة وأضيفي."
          : `${slots.length} ${slots.length === 1 ? "جلسة قادمة" : "جلسات قادمة"} · ${totalRegistered} ${totalRegistered === 1 ? "تسجيل" : "تسجيلات"}. اختاري يومًا من الرزنامة لتعديله. تغيير أي موعد فيه مسجِّلات يرسل لهنّ بريدًا تلقائيًا.`}
      </p>

      {notice && (
        <div
          role="status"
          className={`rounded-xl px-4 py-3 mb-5 text-body-sm font-bold ${
            notice.tone === "error" ? "bg-rosepale text-rose border border-roselt" : "bg-tealpale text-dark border border-mint"
          }`}
        >
          {notice.text}
        </div>
      )}

      {/* ── ثوابت ناقصة ── */}
      {(!defaults.zoomLink || !defaults.venueAddress) && (
        <p className="text-body-sm text-mid bg-yellowlt border border-yellow rounded-xl px-4 py-3 mb-5 flex flex-wrap items-center gap-2">
          <Settings size={15} />
          {!defaults.zoomLink && !defaults.venueAddress
            ? "اضبطي رابط زوم الثابت وعنوان اللقاءات الحضورية مرة واحدة"
            : !defaults.zoomLink
              ? "اضبطي رابط زوم الثابت مرة واحدة"
              : "اضبطي عنوان اللقاءات الحضورية مرة واحدة"}{" "}
          <Link href="/admin/settings" className="font-bold text-teal hover:underline">في الإعدادات ←</Link>{" "}
          فيُعبَّآن تلقائيًا في كل جلسة جديدة.
        </p>
      )}

      {options.length === 0 && (
        <p className="text-mid text-body-sm bg-white rounded-[var(--rl)] border border-bord p-5 mb-6">
          أضيفي خدمة في Studio أولًا كي تتمكّني من فتح مواعيد لها.
        </p>
      )}

      {/* key: تغيّر ?day= في الرابط يعيد تركيب المدير فيختار اليوم الجديد حتى في التنقّل الناعم */}
      <SessionsManager
        key={initialDay ?? "auto"}
        services={options}
        slots={slots}
        bookingsBySlot={bookingsBySlot}
        initialDay={initialDay}
        today={israelTodayISO()}
      />
    </div>
  );
}
