/**
 * منطق الطلبات — تخزين مؤقت في localStorage
 * مصمم بحيث يمكن استبدال saveOrder/getOrder لاحقاً بـ Supabase calls
 * بدون لمس المكونات.
 */

import type { CartItem } from "@/lib/store/cart";

/* ── الأنواع ─────────────────────────────────────────── */

/** بيانات العميل (تُحفظ مع الطلب لأن الشراء مجهول) */
export interface OrderCustomer {
  name:    string;
  email:   string;
  phone:   string;
  city:    string;
  address: string;
}

/** حالة الطلب الكلية */
export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

/** حالة الدفع */
export type OrderPaymentStatus = "pending" | "paid" | "failed" | "refunded";

/** الطلب الكامل */
export interface Order {
  orderNumber:          string;            // MZ-XXXXX
  createdAt:            string;            // ISO timestamp
  customer:             OrderCustomer;
  items:                CartItem[];
  subtotal:             number;
  shippingCost:         number;
  discount:             number;
  total:                number;
  status:               OrderStatus;
  paymentStatus:        OrderPaymentStatus;
  hasMarketingConsent:  boolean;
  notes:                string;
}

/* ── الثوابت ─────────────────────────────────────────── */

const ORDER_STORAGE_PREFIX = "momzy-order-";
const ORDER_NUMBER_PREFIX  = "MZ-";

/* ── دوال مساعدة ─────────────────────────────────────── */

/**
 * يُولّد رقم طلب فريد عالمياً بصيغة MZ-XXXXXXXX
 * يستخدم crypto.randomUUID() — معيار W3C مدعوم في كل المتصفحات الحديثة
 * احتمال التكرار: 1 من 5.3 × 10^36 (مستحيل عملياً)
 */
export function generateOrderNumber(): string {
  const uuid  = crypto.randomUUID();          // xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  const short = uuid.replace(/-/g, "").slice(0, 8).toUpperCase(); // أول 8 أحرف
  return `${ORDER_NUMBER_PREFIX}${short}`;    // مثال: MZ-A3F7B2C1
}

/** يحفظ الطلب في localStorage */
export function saveOrder(order: Order): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      `${ORDER_STORAGE_PREFIX}${order.orderNumber}`,
      JSON.stringify(order)
    );
  } catch (err) {
    console.error("فشل حفظ الطلب في localStorage:", err);
  }
}

/** يقرأ الطلب من localStorage برقم الطلب */
export function getOrder(orderNumber: string): Order | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${ORDER_STORAGE_PREFIX}${orderNumber}`);
    if (!raw) return null;
    return JSON.parse(raw) as Order;
  } catch (err) {
    console.error("فشل قراءة الطلب من localStorage:", err);
    return null;
  }
}
