/**
 * عناصر واجهة المكتبة المشتركة — نمط الحقول والبطاقة.
 * كانت مكرَّرة حرفيًا في ثلاثة مكوّنات، فتغييرُ مظهرِ حقلٍ كان يتطلّب
 * تعديل ثلاثة ملفات وينسى أحدُها.
 */

/** نمط حقل الإدخال — موحّد لكل نماذج المكتبة */
export const fieldStyle: React.CSSProperties = {
  width: "100%",
  border: "1.5px solid var(--bord)",
  borderRadius: 14,
  padding: "13px 16px",
  fontSize: 14.5,
  background: "var(--offwh)",
  outline: "none",
  fontFamily: "inherit",
  textAlign: "start",
};

/** نمط حقل مضغوط — للوحة تغيير كلمة المرور داخل شريط الحساب */
export const compactFieldStyle: React.CSSProperties = {
  ...fieldStyle,
  borderRadius: 12,
  padding: "11px 14px",
  fontSize: 14,
};

/** نمط تسمية الحقل */
export const fieldLabelStyle: React.CSSProperties = {
  display: "block",
  fontWeight: 700,
  fontSize: 13.5,
  color: "var(--dark)",
  marginBottom: 7,
};

/** بطاقة نماذج المكتبة (دخول · إنشاء كلمة مرور) */
export function LibraryCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mx-auto bg-white"
      style={{
        maxWidth: 440,
        borderRadius: 22,
        border: "1.5px solid var(--bord)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        padding: "32px 28px",
      }}
    >
      {children}
    </div>
  );
}

/** رسالة خطأ داخل نموذج */
export function FormError({ message }: { message: string }) {
  return (
    <p
      className="font-label font-bold rounded-[12px]"
      style={{ background: "var(--rosepale)", color: "#D9697A", fontSize: 13, padding: "11px 14px" }}
      role="alert"
    >
      {message}
    </p>
  );
}

/** زر الإجراء الأساسي في نماذج المكتبة */
export function SubmitButton({
  busy,
  children,
}: {
  busy: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="font-label font-bold text-white active:scale-[0.98] [transition:transform_160ms_var(--ease-out)]"
      style={{
        background: "var(--rose)",
        border: "none",
        borderRadius: 50,
        padding: "14px",
        fontSize: 15,
        cursor: busy ? "wait" : "pointer",
        opacity: busy ? 0.75 : 1,
      }}
    >
      {children}
    </button>
  );
}
