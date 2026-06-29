interface SectionWaveProps {
  /** لون الـ wave — يجب أن يطابق خلفية القسم الحالي */
  fill: string;
}

/** موجة ناعمة فاصلة بين الأقسام — تُستخدم كأول child لكل section */
export default function SectionWave({ fill }: SectionWaveProps) {
  return (
    <svg
      viewBox="0 0 1440 60"
      preserveAspectRatio="none"
      style={{ display: "block", width: "100%", height: 60 }}
      aria-hidden="true"
    >
      <path
        d="M0,20 C240,60 480,0 720,30 C960,60 1200,0 1440,20 L1440,60 L0,60 Z"
        fill={fill}
      />
    </svg>
  );
}
