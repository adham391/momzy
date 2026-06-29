/** عدد النقاط على الموبايل */
const MOBILE_COUNT = 8;

/** خصائص مكوّن النقاط الديكورية */
interface PolkaDotsProps {
  colors?: string[];
  opacity?: number;
  count?: number;
  duration?: string;
}

/** بيانات كل نقطة — مواضع ثابتة لضمان التوافق مع SSR */
const DOT_PRESETS = [
  { top: "6%",  left: "8%",  size: "w-14 h-14",   delay: "0s"    },
  { top: "12%", left: "72%", size: "w-10 h-10",   delay: "0.3s"  },
  { top: "18%", left: "38%", size: "w-16 h-16",   delay: "0.6s"  },
  { top: "22%", left: "90%", size: "w-14 h-14",   delay: "0.9s"  },
  { top: "32%", left: "55%", size: "w-10 h-10",   delay: "1.2s"  },
  { top: "38%", left: "20%", size: "w-16 h-16",   delay: "1.5s"  },
  { top: "44%", left: "83%", size: "w-10 h-10",   delay: "1.8s"  },
  { top: "48%", left: "5%",  size: "w-14 h-14",   delay: "2.1s"  },
  // ── النقاط 9-18: مخفية على الموبايل، ظاهرة على الديسكتوب فقط ──
  { top: "54%", left: "45%", size: "w-10 h-10",   delay: "0.0s"  },
  { top: "60%", left: "68%", size: "w-16 h-16",   delay: "0.3s"  },
  { top: "66%", left: "28%", size: "w-14 h-14",   delay: "0.6s"  },
  { top: "70%", left: "92%", size: "w-10 h-10",   delay: "0.9s"  },
  { top: "74%", left: "15%", size: "w-16 h-16",   delay: "1.2s"  },
  { top: "80%", left: "60%", size: "w-10 h-10",   delay: "1.5s"  },
  { top: "84%", left: "34%", size: "w-14 h-14",   delay: "1.8s"  },
  { top: "88%", left: "80%", size: "w-16 h-16",   delay: "2.1s"  },
  { top: "92%", left: "48%", size: "w-10 h-10",   delay: "0.0s"  },
  { top: "96%", left: "10%", size: "w-14 h-14",   delay: "0.3s"  },
] as const;

/** ألوان Momzy الافتراضية للنقاط */
const DEFAULT_COLORS = ["#F2A7B5", "#82C9C4", "#F7DF98", "#A8D8D5"];

/** نقاط ديكورية متحركة كخلفية للأقسام
 *  - موبايل: أول 8 نقاط فقط
 *  - ديسكتوب: كل النقاط (count)
 */
export default function PolkaDots({
  colors = DEFAULT_COLORS,
  opacity = 0.3,
  count = 18,
  duration = "2.5s",
}: PolkaDotsProps) {
  const dots = DOT_PRESETS.slice(0, Math.min(count, DOT_PRESETS.length));

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none"
    >
      {dots.map((dot, i) => (
        <span
          key={i}
          className={`absolute rounded-full animate-ping ${dot.size} ${
            i >= MOBILE_COUNT ? "hidden sm:block" : ""
          }`}
          style={{
            top: dot.top,
            left: dot.left,
            background: colors[i % colors.length],
            opacity,
            animationDelay: dot.delay,
            animationDuration: duration,
          }}
        />
      ))}
    </div>
  );
}
