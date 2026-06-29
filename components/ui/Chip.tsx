import { cn } from "@/lib/utils/cn";

/** خصائص الشارة */
interface ChipProps {
  children: React.ReactNode;
  variant: "rose" | "teal" | "yellow" | "gradient";
  className?: string;
}

/** أنماط الشارات */
const VARIANT_STYLES: Record<ChipProps["variant"], string> = {
  rose: "bg-rosepale text-rose",
  teal: "bg-tealpale text-teal",
  yellow: "bg-yellowlt text-[#9A7A10]",
  gradient: "bg-gradient-to-br from-rose to-teal text-white",
};

/** شارة صغيرة ملونة */
export default function Chip({ children, variant, className }: ChipProps) {
  return (
    <span
      className={cn(
        "inline-block px-3 py-1 rounded-xl font-label text-[10px] md:text-[12px] font-bold tracking-wider uppercase",
        VARIANT_STYLES[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
