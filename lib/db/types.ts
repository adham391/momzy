/**
 * أنواع صفوف Supabase — الطلبات والعناصر.
 * الحقول numeric تُعاد من Supabase كنصوص، لذا تُحوَّل لأرقام في mappers (lib/db/orders.ts).
 */

import type { GiftOptions } from "@/lib/store/cart";

export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type ProductType = "physical" | "digital" | "workshop";

/** صف order_items (بعد تحويل الأرقام) */
export interface OrderItemRow {
  id: string;
  order_id: string;
  product_slug: string;
  product_name: string;
  product_type: ProductType;
  quantity: number;
  unit_price: number;
  total_price: number;
  gift: GiftOptions | null;
  created_at: string;
}

/** صف orders (بعد تحويل الأرقام) */
export interface OrderRow {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  customer_city: string;
  customer_building: string | null;
  customer_postal_code: string | null;
  /** لغة العميلة — null للطلبات السابقة لهجرة 0017 (تُعامَل بالعربية) */
  locale: string | null;
  subtotal: number;
  shipping_cost: number;
  discount_amount: number;
  total_amount: number;
  coupon_id: string | null;
  coupon_code: string | null;
  payment_status: PaymentStatus;
  payment_method: string | null;
  payment_ref: string | null;
  order_status: OrderStatus;
  shipping_company: string | null;
  tracking_number: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  has_marketing_consent: boolean;
  notes: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

/** طلب كامل مع عناصره — لصفحة التأكيد وتفاصيل الأدمن */
export interface OrderWithItems extends OrderRow {
  items: OrderItemRow[];
}

/** مدخلات إنشاء طلب من الـ checkout (الأسعار تُحسب على السيرفر من Sanity) */
export interface CreateOrderInput {
  customer: {
    name: string;
    email: string;
    phone: string;
    city: string;
    address: string;
    building?: string;
    postalCode?: string;
  };
  items: { slug: string; quantity: number; gift?: GiftOptions | null }[];
  couponCode?: string | null;
  hasMarketingConsent: boolean;
  notes?: string;
  /** لغة الصفحة وقت الطلب — تحدّد لغة كل إيميل يصل العميلة لاحقًا */
  locale?: string;
  utm?: { source?: string; medium?: string; campaign?: string } | null;
}
