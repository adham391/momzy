import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils/cn";

/** خصائص الزر */
interface ButtonProps {
  variant: "rose" | "teal" | "white" | "outline-white" | "outline-rose";
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  icon?: React.ReactNode;
}

/** أنماط المتغيرات */
const VARIANT_STYLES: Record<ButtonProps["variant"], string> = {
  rose:  "bg-rose text-white shadow-[0_4px_16px_rgba(217,105,122,0.35)] hover:shadow-[0_8px_24px_rgba(217,105,122,0.45)]",
  teal:  "bg-teal text-white shadow-[0_4px_16px_rgba(79,168,166,0.3)] hover:shadow-[0_8px_24px_rgba(79,168,166,0.4)]",
  white: "bg-white text-teal shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.16)]",
  "outline-white":
    "border-[2.5px] border-white/50 text-white hover:bg-white/10 hover:border-white",
  "outline-rose":
    "border-2 border-rose text-rose hover:bg-rosepale",
};

/** الأنماط المشتركة لكل الأزرار */
const BASE_STYLES =
  "btn-wobble inline-flex items-center gap-2 px-7 py-3 rounded-full text-[13px] md:text-[16px] font-bold cursor-pointer hover:-translate-y-0.5 [transition:transform_160ms_ease-out,box-shadow_200ms_ease-out,opacity_75ms_ease]";

/** زر متعدد الأنماط — يرندر Link أو button حسب الـ props */
export default function Button({
  variant,
  children,
  href,
  onClick,
  className,
  icon,
}: ButtonProps) {
  const styles = cn(BASE_STYLES, VARIANT_STYLES[variant], className);

  if (href) {
    return (
      <Link href={href} className={styles}>
        {icon}
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={styles}>
      {icon}
      {children}
    </button>
  );
}
