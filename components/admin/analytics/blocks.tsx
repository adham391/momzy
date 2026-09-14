import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

/**
 * لبنات لوحة التحليلات — بطاقة رقم، وإطار قسم، وصف بشريط نسبي.
 * مشتركة بين كل التبويبات كي تُعرض الأرقام بشكل واحد.
 */

/** لون التمييز — وردي للرقم الأهمّ، وتركواز لما سواه */
type Tone = "rose" | "teal";

/** أقلّ عرض لشريط الصف — كي يبقى الشريط الصفري مرئيًا خطًّا رفيعًا */
const MIN_BAR_PERCENT = 4;

/** بطاقة رقم واحد، مع سطر توضيح اختياري */
export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "teal",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  tone?: Tone;
}) {
  const rose = tone === "rose";
  return (
    <div className="bg-white rounded-[var(--rl)] border border-bord p-4">
      <div className="flex items-center gap-2 mb-2">
        <span
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: rose ? "var(--rosepale)" : "var(--tealpale)" }}
        >
          <Icon size={16} className={rose ? "text-rose" : "text-teal"} />
        </span>
        <span className="text-micro text-light font-label">{label}</span>
      </div>
      <div className="font-label font-extrabold text-dark text-[22px]">{value}</div>
      {hint && <div className="text-micro text-light mt-1">{hint}</div>}
    </div>
  );
}

/** إطار قسم أبيض بعنوان */
export function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="bg-white rounded-[var(--rl)] border border-bord p-5 h-full">
      <h2 className="font-heading font-bold text-dark text-body mb-4">{title}</h2>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

/** صف بشريط نسبي — تسمية وقيمة، وسطر تفاصيل صغيرة اختياري */
export function BarRow({
  label,
  value,
  sub,
  ratio,
  tone = "rose",
  details,
}: {
  label: string;
  value: string;
  sub?: string;
  /** نسبة الشريط من 0 إلى 1 */
  ratio: number;
  tone?: Tone;
  details?: string[];
}) {
  const color = tone === "teal" ? "var(--teal)" : "var(--rose)";
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-body-sm text-dark font-semibold truncate">{label}</span>
        <span
          className="text-body-sm font-bold shrink-0 mr-2"
          style={{ color: tone === "teal" ? "var(--teal)" : "var(--dark)" }}
        >
          {value}
          {sub ? <span className="text-micro text-light font-normal"> · {sub}</span> : null}
        </span>
      </div>
      <div className="h-2 rounded-full bg-cream overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.max(MIN_BAR_PERCENT, ratio * 100)}%`, background: color }}
        />
      </div>
      {details && details.length > 0 && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-micro text-light">
          {details.map((detail, i) => (
            <span key={`${i}-${detail}`}>{detail}</span>
          ))}
        </div>
      )}
    </div>
  );
}

/** رسالة «لا بيانات» داخل قسم */
export function EmptyState({ text }: { text: string }) {
  return <p className="text-center text-light text-body-sm py-6">{text}</p>;
}

/** ملاحظة طريقة الحساب — تحت أرقام كل تبويب */
export function StatsNote({ children }: { children: ReactNode }) {
  return <p className="text-micro text-light mt-4 leading-relaxed">{children}</p>;
}

/** أعلى قيمة في قائمة — 1 على الأقل كي لا تُقسَم نسب الأشرطة على صفر */
export function maxOf<T>(rows: T[], pick: (row: T) => number): number {
  return Math.max(1, ...rows.map(pick));
}
