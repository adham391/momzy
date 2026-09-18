import type { ReactNode } from "react";

/**
 * تنبيه «من داخل البلاد فقط» — يحلّ محلّ النموذج حين تكون الزائرة خارج البلاد:
 * للصندوق في الدفع، وللقاء الحضوري في التسجيل. `action` زرّ اختياري (مثل إزالة الصندوق من السلة).
 */
export default function AbroadNotice({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div
      role="alert"
      className="rounded-xl px-4 py-3.5"
      style={{ background: "#FEF5F7", border: "1.5px solid var(--roselt)" }}
    >
      <p className="text-[13.5px] font-bold mb-1" style={{ color: "var(--dark)", fontFamily: "'Tajawal', sans-serif" }}>
        {title}
      </p>
      <p className="text-[13px] leading-[1.8]" style={{ color: "var(--mid)", fontFamily: "'Tajawal', sans-serif" }}>
        {body}
      </p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
