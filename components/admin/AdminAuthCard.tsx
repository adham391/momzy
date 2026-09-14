import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * بطاقة صفحات الدخول في لوحة الأدمن — الدخول، ونسيت كلمة المرور، والكلمة
 * الجديدة. هذه الصفحات خارج مجموعة panel فلا سايدبار لها، وتشترك في هوية
 * واحدة بدل ثلاث نسخ من الغلاف نفسه.
 */
export default function AdminAuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  /** سطر شرح تحت العنوان */
  subtitle?: string;
  children: ReactNode;
  /** ما يظهر تحت البطاقة */
  footer?: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-cream flex items-center justify-center p-5">
      <div className="w-full max-w-sm">
        {/* اللوقو */}
        <div className="text-center mb-6">
          <div className="font-heading text-4xl text-dark">Momzy</div>
          <div className="text-body-sm text-light mt-1">لوحة التحكم</div>
        </div>

        {/* البطاقة */}
        <div className="bg-white rounded-[var(--rl)] border border-bord p-7 shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
          <h1 className={cn("font-heading text-h4 text-dark text-center", subtitle ? "mb-2" : "mb-5")}>
            {title}
          </h1>
          {subtitle && (
            <p className="text-body-sm text-mid text-center mb-5 leading-relaxed">{subtitle}</p>
          )}
          {children}
        </div>

        {footer}
      </div>
    </main>
  );
}
