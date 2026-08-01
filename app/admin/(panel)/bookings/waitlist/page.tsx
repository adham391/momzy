import Link from "next/link";
import { ArrowRight, Check, Trash2, MessageCircle } from "lucide-react";
import { listWaitlist } from "@/lib/db/waitlist";
import { notifyWaitlistAction, removeWaitlistAction } from "../actions";
import { formatDate } from "@/lib/utils/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "قائمة الانتظار — لوحة Momzy" };

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
        الأمهات اللواتي سجّلن عند اكتمال المقاعد — بترتيب الأسبقية (الأقدم أولاً).
        {waitingCount > 0 && <> بانتظار الإشعار: <strong className="text-dark">{waitingCount}</strong></>}
      </p>

      {entries.length === 0 ? (
        <p className="text-light text-body-sm bg-white rounded-[var(--rl)] border border-bord py-10 text-center">
          لا أحد في قائمة الانتظار حاليًا.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map((e, i) => {
            const waDigits = e.customer_phone.replace(/\D/g, "");
            const waText = encodeURIComponent(
              `مرحباً ${e.customer_name} 🌸\nتوفّر مقعد في «${e.service_name ?? "الورشة"}» — هل ما زلتِ مهتمة بالتسجيل؟`
            );

            return (
              <div
                key={e.id}
                className="bg-white rounded-[var(--r)] border border-bord p-4 flex flex-wrap items-center gap-4"
                style={{ opacity: e.is_notified ? 0.6 : 1 }}
              >
                {/* الترتيب */}
                <div className="w-7 h-7 rounded-full bg-offwh border border-bord flex items-center justify-center text-micro font-bold text-mid shrink-0">
                  {i + 1}
                </div>

                {/* البيانات */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-dark text-body-sm truncate">
                    {e.customer_name}
                    {e.is_notified && <span className="text-micro text-teal font-normal"> · أُشعِرت</span>}
                  </div>
                  <div className="text-micro text-light truncate">
                    {e.service_name ?? e.service_slug} · انضمّت {formatDate(e.created_at)}
                  </div>
                  <div className="text-micro text-light truncate" dir="ltr">
                    {e.customer_phone} · {e.customer_email}
                  </div>
                </div>

                {/* إجراءات */}
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`https://wa.me/${waDigits}?text=${waText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-body-sm font-bold text-teal border border-bord hover:bg-tealpale transition"
                  >
                    <MessageCircle size={15} /> راسليها
                  </a>

                  {!e.is_notified && (
                    <form action={notifyWaitlistAction}>
                      <input type="hidden" name="id" value={e.id} />
                      <button
                        type="submit"
                        title="تعليمها كمُشعَرة"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-body-sm font-bold text-dark border border-bord hover:bg-offwh transition"
                      >
                        <Check size={15} /> أُشعِرت
                      </button>
                    </form>
                  )}

                  <form action={removeWaitlistAction}>
                    <input type="hidden" name="id" value={e.id} />
                    <button
                      type="submit"
                      title="حذف من القائمة"
                      className="px-2.5 py-1.5 rounded-lg text-rose border border-bord hover:bg-rosepale transition"
                    >
                      <Trash2 size={15} />
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
