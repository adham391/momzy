import type { OrderStatus, PaymentStatus } from "@/lib/db/types";
import type { BookingStatus } from "@/lib/db/bookings";

/** ألوان دلالية للحالات (خارج palette العلامة — الأخضر/الأحمر لهما معنى) */
interface BadgeStyle {
  label: string;
  bg: string;
  color: string;
}

const ORDER_STATUS: Record<OrderStatus, BadgeStyle> = {
  pending:   { label: "قيد الانتظار", bg: "#FEF3C7", color: "#92400E" },
  confirmed: { label: "مؤكّد",        bg: "#DBEAFE", color: "#1E40AF" },
  shipped:   { label: "تم الشحن",     bg: "#E0E7FF", color: "#3730A3" },
  delivered: { label: "تم التوصيل",   bg: "#DCFCE7", color: "#166534" },
  cancelled: { label: "ملغى",         bg: "#F3F4F6", color: "#6B7280" },
};

const PAYMENT_STATUS: Record<PaymentStatus, BadgeStyle> = {
  pending:  { label: "بانتظار الدفع", bg: "#FEF3C7", color: "#92400E" },
  paid:     { label: "مدفوع",         bg: "#DCFCE7", color: "#166534" },
  failed:   { label: "فشل الدفع",     bg: "#FEE2E2", color: "#991B1B" },
  refunded: { label: "مُسترجع",       bg: "#F3F4F6", color: "#6B7280" },
};

function Badge({ label, bg, color }: BadgeStyle) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-micro font-bold font-label whitespace-nowrap"
      style={{ background: bg, color }}
    >
      {label}
    </span>
  );
}

/** شارة حالة الطلب */
export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge {...(ORDER_STATUS[status] ?? ORDER_STATUS.pending)} />;
}

/** شارة حالة الدفع */
export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge {...(PAYMENT_STATUS[status] ?? PAYMENT_STATUS.pending)} />;
}

const BOOKING_STATUS: Record<BookingStatus, BadgeStyle> = {
  pending:   { label: "بانتظار التأكيد", bg: "#FEF3C7", color: "#92400E" },
  confirmed: { label: "مؤكّد",           bg: "#DCFCE7", color: "#166534" },
  completed: { label: "مكتمل",           bg: "#DBEAFE", color: "#1E40AF" },
  cancelled: { label: "ملغى",            bg: "#F3F4F6", color: "#6B7280" },
};

/** شارة حالة الحجز */
export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return <Badge {...(BOOKING_STATUS[status] ?? BOOKING_STATUS.pending)} />;
}
