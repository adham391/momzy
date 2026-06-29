import { cn } from "@/lib/utils/cn";

/** خصائص عنوان القسم */
interface SectionLabelProps {
  children: React.ReactNode;
  color: "rose" | "teal" | "yellow";
  centered?: boolean;
  noDash?: boolean;
  className?: string;
}

/** ألوان العنوان والشريط */
const COLOR_MAP: Record<SectionLabelProps["color"], { text: string; bar: string }> = {
  rose: { text: "text-rose", bar: "bg-rose" },
  teal: { text: "text-teal", bar: "bg-teal" },
  yellow: { text: "text-[#C09420]", bar: "bg-yellow" },
};

/** عنوان القسم — شريط ملون + نص بخط Nunito */
export default function SectionLabel({
  children,
  color,
  centered = false,
  noDash = false,
  className,
}: SectionLabelProps) {
  const { text } = COLOR_MAP[color];

  return (
    <p
      className={cn(
        "font-label text-base font-bold tracking-[3px] uppercase flex items-center gap-2 mb-3",
        text,
        centered && "justify-center",
        className
      )}
    >
      <span>{noDash ? children : `- ${children} -`}</span>
    </p>
  );
}
