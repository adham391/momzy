interface PageHeaderWaveProps {
  /** لون الـ wave — يجب أن يطابق خلفية القسم التالي */
  fillColor?: string;
}

/** موجة ناعمة في نهاية كل هيدر صفحة */
export default function PageHeaderWave({ fillColor = "#FDFAF5" }: PageHeaderWaveProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
      <svg
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        className="block w-full h-[60px]"
        aria-hidden="true"
      >
        <path
          d="M0,20 C240,60 480,0 720,30 C960,60 1200,0 1440,20 L1440,60 L0,60 Z"
          fill={fillColor}
        />
      </svg>
    </div>
  );
}
