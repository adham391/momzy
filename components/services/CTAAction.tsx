"use client";

/**
 * زرّ التسجيل — نفس الشكل، ثلاث حالات.
 *
 * أربعة مواضع في الموقع تعرض زرّ تسجيل بتنسيقات مختلفة، وكلّها تحتاج أن
 * تتحوّل إلى رابط واتساب حين تكون الخدمة «واتساب فقط»، وأن تظهر معطّلة
 * حين لا يكون الرقم مضبوطًا بعد. هذا المكوّن يفصل *الشكل* (يأتي من الموضع)
 * عن *الوجهة* — فلا يتكرّر الشرط أربع مرات ولا يُنسى في أحدها.
 */
export default function CTAAction({
  href,
  disabled,
  onClick,
  className,
  style,
  ariaLabel,
  children,
}: {
  /** وجودُه يجعله رابطًا خارجيًا؛ غيابه يجعله زرًّا */
  href?: string | null;
  /** زرّ ظاهر بنصّه لكنّه لا يستجيب — بانتظار رقم الواتساب */
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
  children: React.ReactNode;
}) {
  if (href) {
    // تبويب جديد فلا تفقد العميلة الصفحة وهي في منتصف قراءتها
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel}
        className={className}
        style={style}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-disabled={disabled}
      aria-label={ariaLabel}
      className={className}
      style={disabled ? { ...style, opacity: 0.55, cursor: "not-allowed", boxShadow: "none" } : style}
    >
      {children}
    </button>
  );
}
