import { Mail } from "lucide-react";
import { getSubscribers, type SubscriberRow } from "@/lib/db/newsletter";
import SearchInput from "@/components/admin/SearchInput";
import { formatDate } from "@/lib/utils/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "النشرة البريدية — لوحة Momzy" };

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

/** اسم عربي لمصدر الاشتراك — المفتاح يُكتب في قاعدة البيانات بالإنجليزية */
const SOURCE_LABELS: Record<string, string> = {
  footer: "نموذج الموقع",
  checkout: "موافقة عند الدفع",
};

function sourceLabel(source: string | null): string {
  if (!source) return "غير معروف";
  return SOURCE_LABELS[source] ?? source;
}

/** شارة الحالة — نشطة أو ألغت اشتراكها */
function StatusBadge({ subscriber }: { subscriber: SubscriberRow }) {
  const active = subscriber.isActive;
  return (
    <span
      className="font-label text-micro font-bold rounded-full px-2.5 py-1 whitespace-nowrap"
      style={{
        background: active ? "var(--tealpale)" : "var(--cream)",
        color: active ? "var(--teal)" : "var(--light)",
      }}
    >
      {active ? "مشتركة" : "ألغت الاشتراك"}
    </span>
  );
}

export default async function AdminNewsletterPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const subscribers = await getSubscribers(q);
  const activeCount = subscribers.filter((s) => s.isActive).length;

  return (
    <div>
      <h1 className="font-heading text-h2 font-bold text-dark mb-1">النشرة البريدية</h1>
      <p className="text-mid text-body-sm mb-6">
        {activeCount} مشتركة نشطة
        {subscribers.length > activeCount && ` · ${subscribers.length - activeCount} ألغت اشتراكها`}
        {" — "}القائمة نفسها في Resend، ومنها تُرسَل النشرات
      </p>

      <SearchInput defaultValue={q ?? ""} placeholder="بحث بالإيميل" />

      {subscribers.length === 0 ? (
        <div className="bg-white rounded-[var(--rl)] border border-bord py-16 text-center">
          <Mail size={40} className="mx-auto text-light mb-3" strokeWidth={1.5} />
          <p className="text-mid text-body-sm">
            {q ? "لا نتيجة لهذا البحث" : "لا مشتركات بعد — تظهر الأم هنا فور اشتراكها"}
          </p>
        </div>
      ) : (
        <>
          {/* جدول (ديسكتوب) */}
          <div className="hidden md:block bg-white rounded-[var(--rl)] border border-bord overflow-hidden">
            <table className="w-full text-body-sm">
              <thead>
                <tr className="text-right text-light border-b border-bord bg-cream/50">
                  <th className="p-3.5 font-label font-bold text-micro">الإيميل</th>
                  <th className="p-3.5 font-label font-bold text-micro">من أين</th>
                  <th className="p-3.5 font-label font-bold text-micro">الحالة</th>
                  <th className="p-3.5 font-label font-bold text-micro">تاريخ الاشتراك</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((s) => (
                  <tr key={s.email} className="border-b border-bord last:border-0 hover:bg-cream/40 transition-colors">
                    <td className="p-3.5 font-semibold text-dark" style={{ direction: "ltr", textAlign: "right" }}>
                      {s.email}
                    </td>
                    <td className="p-3.5 text-mid">{sourceLabel(s.source)}</td>
                    <td className="p-3.5">
                      <StatusBadge subscriber={s} />
                    </td>
                    <td className="p-3.5 text-light whitespace-nowrap">{formatDate(s.subscribedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* بطاقات (جوال) */}
          <div className="md:hidden flex flex-col gap-3">
            {subscribers.map((s) => (
              <div key={s.email} className="bg-white rounded-[var(--r)] border border-bord p-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="font-semibold text-dark text-body-sm truncate" style={{ direction: "ltr" }}>
                    {s.email}
                  </span>
                  <StatusBadge subscriber={s} />
                </div>
                <div className="flex items-center justify-between text-micro text-mid">
                  <span>{sourceLabel(s.source)}</span>
                  <span className="text-light">{formatDate(s.subscribedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
