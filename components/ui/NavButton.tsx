"use client";

/** خصائص زر التنقّل الدائري */
interface NavButtonProps {
  label: string;
  onClick: () => void;
  disabled: boolean;
  icon: React.ReactNode;
  /** قطر الزر بالبكسل — 48 افتراضيًا */
  size?: number;
}

/**
 * زر تنقّل دائري موحّد (carousel التقييمات + قارئ الكتيب) —
 * أبيض مع ظل، يرتفع عند التحويم، ويبهت ويتعطّل عند الحواف.
 */
export default function NavButton({ label, onClick, disabled, icon, size = 48 }: NavButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="rounded-full flex items-center justify-center [transition:transform_180ms_ease,opacity_180ms_ease,box-shadow_180ms_ease] hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgba(0,0,0,0.18)] active:translate-y-0 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
      style={{
        width: size,
        height: size,
        background: "white",
        color: "var(--dark)",
        border: "1.5px solid var(--bord)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {icon}
    </button>
  );
}
