import { cn } from "@/lib/utils/cn";

/** خصائص عنوان القسم */
interface SectionLabelProps {
  children: React.ReactNode;
  color: "rose" | "teal" | "yellow";
  centered?: boolean;
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
}: SectionLabelProps) {
  const { text, bar } = COLOR_MAP[color];

  return (
    <div
      className={cn(
        "font-label text-base font-bold tracking-[3px] uppercase flex items-center gap-2 mb-3",
        text,
        centered && "justify-center"
      )}
    >
      {/* الشريط الملون — يختفي عند التوسيط */}
      {!centered && (
        <span className={cn("w-[22px] h-[2.5px] rounded-sm", bar)} />
      )}
      <span>{children}</span>
    </div>
  );
}
