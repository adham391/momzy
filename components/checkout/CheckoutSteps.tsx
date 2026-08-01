/**
 * شريط تقدّم المراحل — التوصيل ← الدفع ← التأكيد.
 * مكوّن عرض بحت (server component) — يُستخدم في /checkout و /order،
 * وبتسميات الحجوزات في /booking (التسجيل بدل التوصيل).
 */

interface CheckoutStepsProps {
  /** المرحلة الحالية: 1 توصيل/تسجيل · 2 دفع · 3 تأكيد */
  current: 1 | 2 | 3;
  /** تسميات المراحل الثلاث — الافتراضي للمتجر */
  labels?: readonly [string, string, string];
}

/** تسميات مراحل تسجيل الورشات — نفس التجربة بمفردات الحجز */
export const BOOKING_STEP_LABELS = ["التسجيل", "الدفع", "التأكيد"] as const;

const DEFAULT_LABELS = ["التوصيل", "الدفع", "التأكيد"] as const;

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function CheckoutSteps({ current, labels = DEFAULT_LABELS }: CheckoutStepsProps) {
  return (
    <div className="flex items-start justify-center mx-auto" style={{ maxWidth: 440 }}>
      {labels.map((label, i) => {
        const step = { n: i + 1, label };
        const done = step.n < current;
        const active = step.n === current;
        const isLast = i === labels.length - 1;
        return (
          <div key={step.n} className="flex items-start" style={{ flex: isLast ? "0 0 auto" : 1 }}>
            {/* الدائرة + التسمية */}
            <div className="flex flex-col items-center gap-2 shrink-0" style={{ width: 64 }}>
              <div
                className="rounded-full flex items-center justify-center font-label font-bold"
                style={{
                  width: 34,
                  height: 34,
                  fontSize: 14,
                  background: done ? "var(--teal)" : active ? "var(--rose)" : "var(--offwh)",
                  color: done || active ? "white" : "var(--light)",
                  border: done || active ? "none" : "1.5px solid var(--bord)",
                  boxShadow: active ? "0 4px 12px rgba(242,167,181,0.4)" : "none",
                  transition: "background-color 200ms ease, color 200ms ease, box-shadow 200ms ease",
                }}
              >
                {done ? <CheckIcon /> : step.n}
              </div>
              <span
                className="font-label text-[12px] whitespace-nowrap"
                style={{ color: active ? "var(--dark)" : "var(--light)", fontWeight: active ? 700 : 500 }}
              >
                {step.label}
              </span>
            </div>
            {/* الخط الواصل — يُحاذي مركز الدائرة */}
            {!isLast && (
              <div
                className="flex-1"
                style={{
                  height: 2,
                  marginTop: 16,
                  background: done ? "var(--teal)" : "var(--bord)",
                  transition: "background-color 200ms ease",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
