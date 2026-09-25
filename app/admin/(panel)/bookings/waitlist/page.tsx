import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { listWaitlist, type WaitlistRow } from "@/lib/db/waitlist";
import { siteOrigin } from "@/lib/resend/emails/brand";
import { notifyWaitlistAction, removeWaitlistAction } from "../actions";
import { formatDate } from "@/lib/utils/format";
import { babyAgeDetailedLabel, correctedAgeLabel } from "@/lib/utils/age";
import { pregnancyWeekAt } from "@/lib/utils/pregnancy";
import { israelTodayISO } from "@/lib/sessions/time";
import WaitlistEntries, { type WaitlistEntryView } from "@/components/admin/bookings/WaitlistEntries";

export const dynamic = "force-dynamic";
export const metadata = { title: "قائمة الانتظار — لوحة Momzy" };

/**
 * رسالة الواتساب الجاهزة للمنتظِرة — **إعلان لا سؤال**.
 *
 * كانت تسأل «هل ما زلتِ مهتمة؟» فتفتح حديثًا يحتاج ردًّا ومتابعة من هبة.
 * صارت تخبرها أن التسجيل فُتح وتدلّها على صفحة الورشة، فتسجّل بنفسها
 * كأي أم أخرى — بلا محادثة ولا حجز يدوي.
 */
function waitlistMessage(entry: WaitlistRow): string {
  const service = entry.service_name ?? "الورشة";
  const link = `${siteOrigin()}/services/${entry.service_slug}`;
  return `مرحبًا ${entry.customer_name} 🌸\nالتسجيل لـ«${service}» مفتوح الآن — تجدين المواعيد المتاحة والتسجيل على الموقع:\n${link}`;
}

/** صفّ القاعدة ← ما تعرضه الواجهة (روابط ونصوص جاهزة — مكوّن العميل لا يحسب شيئًا) */
function toView(entry: WaitlistRow): WaitlistEntryView {
  return {
    id: entry.id,
    name: entry.customer_name,
    service: entry.service_name ?? entry.service_slug,
    phone: entry.customer_phone,
    email: entry.customer_email,
    joined: formatDate(entry.created_at),
    // عمر الطفل اليوم — لا يوم انضمامها: الشهر يمرّ فيتغيّر
    babyAge: entry.baby_birth_date ? babyAgeDetailedLabel(entry.baby_birth_date, israelTodayISO()) : null,
    // العمر المصحَّح للخديج — وهو ما تُقاس به الفئة العمرية
    correctedAge: entry.baby_birth_date
      ? correctedAgeLabel(entry.baby_birth_date, israelTodayISO(), entry.gestational_weeks)
      : null,
    // أسبوع الحمل يوم الانضمام محفوظ، وأسبوعها اليوم يُحسب منه (يتقدّم مع الوقت)
    pregnancyWeek:
      entry.pregnancy_week === null
        ? null
        : (pregnancyWeekAt(entry.pregnancy_week, entry.created_at.slice(0, 10), israelTodayISO()) ??
          entry.pregnancy_week),
    notes: entry.notes,
    isNotified: entry.is_notified,
    waHref: `https://wa.me/${entry.customer_phone.replace(/\D/g, "")}?text=${encodeURIComponent(waitlistMessage(entry))}`,
  };
}

export default async function WaitlistPage() {
  const entries = await listWaitlist();
  const waitingCount = entries.filter((e) => !e.is_notified).length;

  return (
    <div>
      <Link
        href="/admin/bookings/availability"
        className="inline-flex items-center gap-1.5 text-body-sm text-mid hover:text-dark mb-4"
      >
        <ArrowRight size={16} /> إتاحة المواعيد
      </Link>

      <h1 className="font-heading text-h2 font-bold text-dark mb-1">قائمة الانتظار</h1>
      <p className="text-mid text-body-sm mb-6">
        الأمهات اللواتي سجّلن عند اكتمال المقاعد — بترتيب الأسبقية (الأقدم أولًا).
        {waitingCount > 0 && <> بانتظار الإشعار: <strong className="text-dark">{waitingCount}</strong></>}
      </p>

      {entries.length === 0 ? (
        <p className="text-light text-body-sm bg-white rounded-[var(--rl)] border border-bord py-10 text-center">
          لا أحد في قائمة الانتظار حاليًا.
        </p>
      ) : (
        <WaitlistEntries
          entries={entries.map(toView)}
          notifyAction={notifyWaitlistAction}
          removeAction={removeWaitlistAction}
        />
      )}
    </div>
  );
}
