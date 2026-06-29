"use client";

interface QuantityInputProps {
  value: number;
  onChange: (value: number) => void;
  /** حجم صغير = في السلة، عادي = في صفحة المنتج */
  size?: "sm" | "md";
  /** الحد الأدنى للكمية — 0 يسمح بالحذف عند الوصول لصفر */
  min?: number;
}

/** زر +/− للكمية */
export default function QuantityInput({
  value,
  onChange,
  size = "md",
  min = 1,
}: QuantityInputProps) {
  const btnSize = size === "sm" ? 28 : 36;
  const fontSize = size === "sm" ? 13 : 15;

  function decrement() {
    if (value > min) onChange(value - 1);
  }

  function increment() {
    if (value < 99) onChange(value + 1);
  }

  return (
    <div
      className="inline-flex items-center border border-bord rounded-full overflow-hidden bg-white"
      style={{ gap: 0 }}
    >
      <button
        onClick={decrement}
        disabled={value <= min}
        aria-label="تقليل الكمية"
        className="flex items-center justify-center font-label font-bold text-mid transition-colors hover:bg-rosepale disabled:opacity-40"
        style={{
          width: btnSize,
          height: btnSize,
          border: "none",
          background: "transparent",
          cursor: value <= min ? "not-allowed" : "pointer",
          fontSize: fontSize + 2,
        }}
      >
        −
      </button>

      <span
        className="font-label font-bold text-dark text-center select-none"
        style={{ width: 36, fontSize }}
      >
        {value}
      </span>

      <button
        onClick={increment}
        disabled={value >= 99}
        aria-label="زيادة الكمية"
        className="flex items-center justify-center font-label font-bold text-mid transition-colors hover:bg-tealpale disabled:opacity-40"
        style={{
          width: btnSize,
          height: btnSize,
          border: "none",
          background: "transparent",
          cursor: value >= 99 ? "not-allowed" : "pointer",
          fontSize: fontSize + 2,
        }}
      >
        +
      </button>
    </div>
  );
}
