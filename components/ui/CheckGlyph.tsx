/**
 * علامة ✓ مرسومة لا نصّية — للشارات الزخرفية (توثيق هبة، نقاط القيمة).
 * الحرف «✓» نصًّا كان يدخل مقتطف Google («✓استشارات ✓منتجات…»)؛ الرسم لا يُقرأ نصًّا.
 * اللون من currentColor — يتبع لون الشارة.
 */
export default function CheckGlyph({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}
