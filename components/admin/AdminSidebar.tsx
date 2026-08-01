"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  CalendarDays,
  Package,
  Ticket,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { logoutAction } from "@/app/admin/actions";

/** عنصر تنقّل في السايدبار */
interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin",           label: "الرئيسية",  icon: LayoutDashboard },
  { href: "/admin/orders",    label: "الطلبات",   icon: ShoppingBag },
  { href: "/admin/bookings",  label: "الحجوزات",  icon: CalendarDays },
  { href: "/admin/products",  label: "المنتجات",  icon: Package },
  { href: "/admin/coupons",   label: "الكوبونات", icon: Ticket },
  { href: "/admin/analytics", label: "التحليلات", icon: BarChart3 },
  { href: "/admin/customers", label: "العملاء",   icon: Users },
  { href: "/admin/settings",  label: "الإعدادات", icon: Settings },
];

/** تسمية الدور بالعربية */
const ROLE_LABEL: Record<string, string> = {
  super_admin: "مدير عام",
  admin: "مدير",
};

/**
 * سايدبار لوحة الأدمن — ثابت يمين (RTL)، داكن، روابط بيضاء، النشط وردي.
 * على الجوال: شريط علوي + قائمة منزلقة فوق طبقة معتمة.
 */
export default function AdminSidebar({
  adminName,
  role,
}: {
  adminName: string;
  role: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // الرئيسية تطابق تامّ؛ البقية تطابق البادئة (تشمل صفحات التفاصيل)
  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <>
      {/* ── شريط علوي (جوال فقط) ── */}
      <header className="md:hidden fixed top-0 inset-x-0 h-14 bg-dark z-30 flex items-center justify-between px-4">
        <button
          onClick={() => setOpen(true)}
          aria-label="فتح القائمة"
          className="text-white p-1"
        >
          <Menu size={22} />
        </button>
        <span className="font-heading text-white text-xl">Momzy</span>
        <span className="w-8" aria-hidden />
      </header>
      {/* فراغ يعوّض الشريط العلوي الثابت على الجوال */}
      <div className="md:hidden h-14" aria-hidden />

      {/* ── طبقة معتمة خلف السايدبار (جوال) ── */}
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {/* ── السايدبار ── */}
      <aside
        className={cn(
          "fixed top-0 right-0 h-screen w-64 bg-dark text-white z-50 flex flex-col",
          "transition-transform duration-300 [transition-timing-function:var(--ease-out)] md:translate-x-0",
          open ? "translate-x-0" : "translate-x-full md:translate-x-0"
        )}
      >
        {/* اللوقو + زر إغلاق (جوال) */}
        <div className="flex items-center justify-between px-6 h-20 border-b border-white/10 shrink-0">
          <div>
            <div className="font-heading text-2xl leading-none">Momzy</div>
            <div className="text-micro text-white/50 mt-1 font-label">لوحة التحكم</div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="md:hidden text-white/70 p-1"
            aria-label="إغلاق القائمة"
          >
            <X size={20} />
          </button>
        </div>

        {/* روابط التنقّل */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                // اللون inline لأن قاعدة globals العامة `a { color: inherit }`
                // (غير مُطبَّقة في layer) تتفوّق على أدوات Tailwind اللونية
                style={{ color: active ? "var(--dark)" : "rgba(255,255,255,0.75)" }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-body-sm transition-colors",
                  active ? "bg-rose font-bold" : "hover:bg-white/10"
                )}
              >
                <Icon size={19} strokeWidth={active ? 2.4 : 2} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* أسفل — الأدمن الحالي + خروج */}
        <div className="border-t border-white/10 p-3 shrink-0">
          <div className="flex items-center gap-3 px-3 py-2">
            <span className="w-9 h-9 rounded-full bg-rose text-dark flex items-center justify-center font-label font-extrabold shrink-0">
              {adminName?.charAt(0) ?? "؟"}
            </span>
            <div className="min-w-0">
              <div className="text-body-sm font-bold truncate">{adminName}</div>
              <div className="text-micro text-white/50">{ROLE_LABEL[role] ?? role}</div>
            </div>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              style={{ color: "rgba(255,255,255,0.75)" }}
              className="w-full mt-1 flex items-center gap-3 px-3 py-2.5 rounded-xl text-body-sm hover:bg-white/10 transition-colors"
            >
              <LogOut size={19} />
              <span>تسجيل الخروج</span>
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
