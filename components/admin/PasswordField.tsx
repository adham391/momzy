/**
 * حقل كلمة مرور — LTR، بنمط حقول صفحة الدخول.
 * مشترك بين «حسابي» (تغيير الكلمة) وصفحة الكلمة الجديدة بعد النسيان.
 */
export default function PasswordField({
  name,
  label,
  hint,
  autoComplete,
  minLength,
}: {
  name: string;
  label: string;
  /** توضيح صغير بجوار العنوان — مثل الحدّ الأدنى */
  hint?: string;
  autoComplete: "current-password" | "new-password";
  minLength?: number;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-body-sm font-bold text-dark">
        {label}
        {hint && <span className="font-normal text-light"> — {hint}</span>}
      </span>
      <input
        name={name}
        type="password"
        required
        minLength={minLength}
        autoComplete={autoComplete}
        dir="ltr"
        className="w-full px-4 py-2.5 rounded-xl border border-bord bg-offwh text-body text-dark text-left placeholder:text-light focus:outline-none focus:border-rose focus:ring-2 focus:ring-rose/30 transition"
      />
    </label>
  );
}
