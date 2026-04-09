import { cn } from "@/lib/utils/cn";

/** خصائص الحاوية الرئيسية */
interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

/** حاوية المحتوى — max-width 1200px مع padding متجاوب */
export default function Container({
  children,
  className,
  as: Component = "div",
}: ContainerProps) {
  return (
    <Component
      className={cn(
        "mx-auto w-full max-w-[1200px] px-5 sm:px-8 md:px-14",
        className
      )}
    >
      {children}
    </Component>
  );
}
