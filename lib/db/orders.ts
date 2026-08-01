import { createAdminClient } from "@/lib/supabase/admin";
import { getProducts } from "@/lib/products/getProducts";
import { restoreStock } from "@/lib/products/stock";
import { getShippingConfig } from "./settings";
import { validateCoupon, incrementCouponUsage } from "./coupons";
import { computeShipping } from "@/lib/shipping";
import { toLatinDigits } from "@/lib/utils/format";
import type { GiftOptions } from "@/lib/store/cart";
import type {
  CreateOrderInput,
  OrderItemRow,
  OrderRow,
  OrderStatus,
  OrderWithItems,
} from "./types";

/* ── mappers: تحويل صفوف Supabase (numeric كنصوص) لأرقام ── */

/** يوحّد نصًا اختياريًا (يبقيه null إن كان فارغًا) */
const nz = (s: string | null | undefined) => (s ? toLatinDigits(s) : s ?? null);

function toOrderRow(r: Record<string, unknown>): OrderRow {
  const row = r as unknown as OrderRow;
  return {
    ...row,
    // توحيد الأرقام العربية-الهندية → لاتينية في كل ما يُعرض
    customer_name: toLatinDigits(row.customer_name),
    customer_phone: toLatinDigits(row.customer_phone),
    customer_address: toLatinDigits(row.customer_address),
    customer_city: toLatinDigits(row.customer_city),
    customer_building: nz(row.customer_building),
    customer_postal_code: nz(row.customer_postal_code),
    notes: nz(row.notes),
    admin_notes: nz(row.admin_notes),
    subtotal: Number(r.subtotal ?? 0),
    shipping_cost: Number(r.shipping_cost ?? 0),
    discount_amount: Number(r.discount_amount ?? 0),
    total_amount: Number(r.total_amount ?? 0),
  };
}

function toOrderItem(r: Record<string, unknown>): OrderItemRow {
  const row = r as unknown as OrderItemRow;
  return {
    ...row,
    product_name: toLatinDigits(row.product_name),
    gift: normalizeGift(row.gift),
    quantity: Number(r.quantity ?? 0),
    unit_price: Number(r.unit_price ?? 0),
    total_price: Number(r.total_price ?? 0),
  };
}

/** يوحّد أرقام حقول الهدية إلى لاتينية (للتوصيل) */
function normalizeGift(g: GiftOptions | null | undefined): GiftOptions | null {
  if (!g) return null;
  const L = (s?: string) => (s ? toLatinDigits(s) : s);
  return {
    ...g,
    recipientName: L(g.recipientName),
    recipientPhone: L(g.recipientPhone),
    recipientAddress: L(g.recipientAddress),
    recipientCity: L(g.recipientCity),
  };
}

/* ── إنشاء طلب ─────────────────────────────────────────── */

/**
 * ينشئ طلباً في Supabase. الأسعار تُحسب على السيرفر من مصدر المنتجات (Sanity)
 * لمنع التلاعب، والشحن من جدول settings. رقم الطلب يُولَّد بواسطة DB (sequence).
 */
export async function createOrder(
  input: CreateOrderInput
): Promise<{ id: string; orderNumber: string; total: number }> {
  const supabase = createAdminClient();

  // أسعار المنتجات من المصدر الموثوق (مرة واحدة)
  const allProducts = await getProducts();
  const bySlug = new Map(allProducts.map((p) => [p.slug, p]));

  let subtotal = 0;
  const lineItems = [];
  for (const item of input.items) {
    const product = bySlug.get(item.slug);
    if (!product) continue; // تجاهل منتجاً غير موجود
    const quantity = Math.max(1, Math.floor(item.quantity));
    const unitPrice = product.price;
    const linePrice = unitPrice * quantity;
    subtotal += linePrice;
    lineItems.push({
      product_slug: item.slug,
      product_name: product.title,
      product_type: "physical" as const,
      quantity,
      unit_price: unitPrice,
      total_price: linePrice,
      gift: normalizeGift(item.gift),
    });
  }

  if (lineItems.length === 0) {
    throw new Error("لا توجد عناصر صالحة في الطلب");
  }

  // الشحن من الإعدادات
  const shipping = await getShippingConfig();
  const shippingCost = computeShipping(subtotal, lineItems.length, shipping);

  // الكوبون — إعادة تحقّق على السيرفر (موثوق، لا نثق بقيمة العميل)
  let discount = 0;
  let couponCode: string | null = null;
  if (input.couponCode) {
    const v = await validateCoupon(input.couponCode, subtotal);
    if (v.valid) {
      discount = v.discount;
      couponCode = v.code ?? null;
    }
  }
  const total = subtotal + shippingCost - discount;

  // بيانات الطلب (رقم الطلب عشوائي — يُولَّد مع retry أدناه)
  const orderData = {
    customer_name: input.customer.name,
    customer_email: input.customer.email,
    customer_phone: toLatinDigits(input.customer.phone),
    customer_address: toLatinDigits(input.customer.address),
    customer_city: toLatinDigits(input.customer.city),
    customer_building: input.customer.building ? toLatinDigits(input.customer.building) : null,
    customer_postal_code: input.customer.postalCode ? toLatinDigits(input.customer.postalCode) : null,
    subtotal,
    shipping_cost: shippingCost,
    discount_amount: discount,
    total_amount: total,
    coupon_code: couponCode,
    has_marketing_consent: input.hasMarketingConsent,
    notes: input.notes ?? null,
    utm_source: input.utm?.source ?? null,
    utm_medium: input.utm?.medium ?? null,
    utm_campaign: input.utm?.campaign ?? null,
  };

  // رقم طلب عشوائي فريد بصيغة MZ-XXXXXX — إعادة المحاولة عند التصادم النادر (unique)
  let order: { id: string; order_number: string } | null = null;
  for (let attempt = 0; attempt < 6; attempt++) {
    const orderNumber = "MZ-" + String(Math.floor(100000 + Math.random() * 900000));
    const { data, error } = await supabase
      .from("orders")
      .insert({ ...orderData, order_number: orderNumber })
      .select("id, order_number")
      .single();

    if (!error && data) {
      order = data as { id: string; order_number: string };
      break;
    }
    // 23505 = تصادم على order_number → جرّب رقمًا آخر؛ غيره خطأ حقيقي
    if (error && error.code !== "23505") throw new Error(error.message);
  }

  if (!order) throw new Error("تعذّر توليد رقم طلب فريد، حاولي مجددًا");

  // إدراج العناصر
  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(lineItems.map((li) => ({ ...li, order_id: order.id })));

  if (itemsError) {
    // تراجع: احذف الطلب اليتيم كي لا يبقى بلا عناصر
    await supabase.from("orders").delete().eq("id", order.id);
    throw new Error(itemsError.message);
  }

  // زيادة عدّاد استخدام الكوبون بعد نجاح الطلب
  if (couponCode) await incrementCouponUsage(couponCode);

  return { id: order.id as string, orderNumber: order.order_number as string, total };
}

/** يُعلّم الطلب مدفوعًا (من HYP callback) — يعيد id الطلب أو null */
export async function markOrderPaid(orderNumber: string, paymentRef: string): Promise<string | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("orders")
    .update({
      payment_status: "paid",
      order_status: "confirmed",
      payment_method: "HYP",
      payment_ref: paymentRef,
    })
    .eq("order_number", orderNumber)
    .select("id")
    .single();
  return (data?.id as string | undefined) ?? null;
}

/**
 * يعيد UUID الطلب برقمه (MZ-…). يُستخدم في callback الدفع لأن HYP يستبدل
 * حقل Fild1 (الذي أرسلنا فيه الـ UUID) ببيانات العميل في ردّه عند MoreData=True.
 */
export async function getOrderIdByNumber(orderNumber: string): Promise<string | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("orders")
    .select("id")
    .eq("order_number", orderNumber)
    .single();
  return (data?.id as string | undefined) ?? null;
}

/* ── قراءة ─────────────────────────────────────────────── */

/** طلب واحد بالـ UUID مع عناصره — لصفحة التأكيد وتفاصيل الأدمن */
export async function getOrderById(id: string): Promise<OrderWithItems | null> {
  const supabase = createAdminClient();

  const { data: order } = await supabase.from("orders").select("*").eq("id", id).single();
  if (!order) return null;

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", id)
    .order("created_at", { ascending: true });

  return {
    ...toOrderRow(order),
    items: (items ?? []).map(toOrderItem),
  };
}

/** فلاتر قائمة الطلبات في الأدمن */
export interface OrderListFilters {
  status?: OrderStatus | "all";
  search?: string;
  limit?: number;
}

/** قائمة الطلبات للأدمن — فلترة بالحالة + بحث برقم/اسم/هاتف/إيميل */
export async function listOrders(filters: OrderListFilters = {}): Promise<OrderRow[]> {
  const supabase = createAdminClient();
  let query = supabase.from("orders").select("*").order("created_at", { ascending: false });

  if (filters.status && filters.status !== "all") {
    query = query.eq("order_status", filters.status);
  }
  if (filters.search && filters.search.trim()) {
    // تنظيف من رموز PostgREST الخاصة لمنع حقن الفلتر
    const s = filters.search.trim().replace(/[,()%*\\]/g, "");
    if (s) {
      query = query.or(
        `order_number.ilike.%${s}%,customer_name.ilike.%${s}%,customer_phone.ilike.%${s}%,customer_email.ilike.%${s}%`
      );
    }
  }
  if (filters.limit) query = query.limit(filters.limit);

  const { data } = await query;
  return (data ?? []).map(toOrderRow);
}

/** صف قائمة الأدمن — طلب + ملخّص عناصره */
export interface OrderListRow extends OrderRow {
  itemCount: number;
  productSummary: string;
}

/** قائمة الطلبات للأدمن مع ملخّص المنتجات (nested select — استعلام واحد) */
export async function listOrdersForAdmin(filters: OrderListFilters = {}): Promise<OrderListRow[]> {
  const supabase = createAdminClient();
  let query = supabase
    .from("orders")
    .select("*, order_items(product_name, quantity)")
    .order("created_at", { ascending: false });

  if (filters.status && filters.status !== "all") {
    query = query.eq("order_status", filters.status);
  }
  if (filters.search && filters.search.trim()) {
    const s = filters.search.trim().replace(/[,()%*\\]/g, "");
    if (s) {
      query = query.or(
        `order_number.ilike.%${s}%,customer_name.ilike.%${s}%,customer_phone.ilike.%${s}%,customer_email.ilike.%${s}%`
      );
    }
  }
  if (filters.limit) query = query.limit(filters.limit);

  const { data } = await query;
  return (data ?? []).map((row) => {
    const items =
      (row.order_items as { product_name: string; quantity: number }[] | null) ?? [];
    const itemCount = items.reduce((sum, i) => sum + Number(i.quantity), 0);
    const productSummary = toLatinDigits(
      items
        .map((i) => (Number(i.quantity) > 1 ? `${i.product_name} ×${i.quantity}` : i.product_name))
        .join("، ")
    );
    return { ...toOrderRow(row), itemCount, productSummary };
  });
}

/** صف تصدير الشحن — وجهة التوصيل (المستلِمة للهدايا، العميل لغيرها) */
export interface ShippingRow {
  orderNumber: string;
  recipientName: string;
  phone: string;
  city: string;
  address: string;
  building: string;
  postalCode: string;
  isGift: boolean;
  status: string;
  total: number;
  notes: string;
  createdAt: string;
}

/** صفوف عناوين التوصيل للتصدير CSV — تحترم فلاتر القائمة */
export async function getShippingRows(filters: OrderListFilters = {}): Promise<ShippingRow[]> {
  const supabase = createAdminClient();
  let query = supabase
    .from("orders")
    .select("*, order_items(gift)")
    .order("created_at", { ascending: false });

  if (filters.status && filters.status !== "all") query = query.eq("order_status", filters.status);
  if (filters.search && filters.search.trim()) {
    const s = filters.search.trim().replace(/[,()%*\\]/g, "");
    if (s) {
      query = query.or(
        `order_number.ilike.%${s}%,customer_name.ilike.%${s}%,customer_phone.ilike.%${s}%,customer_email.ilike.%${s}%`
      );
    }
  }

  const { data } = await query;

  return (data ?? []).map((o) => {
    const items = (o.order_items as { gift: GiftOptions | null }[] | null) ?? [];
    // أول عنصر هدية بعنوان مستلِمة → وجهة التوصيل هي المستلِمة
    const gift = items.find((it) => it.gift && (it.gift.recipientAddress || it.gift.recipientName))?.gift;

    if (gift) {
      return {
        orderNumber: String(o.order_number),
        recipientName: gift.recipientName || String(o.customer_name),
        phone: gift.recipientPhone || String(o.customer_phone),
        city: gift.recipientCity || "",
        address: gift.recipientAddress || "",
        building: "",
        postalCode: "",
        isGift: true,
        status: String(o.order_status),
        total: Number(o.total_amount ?? 0),
        notes: (o.notes as string | null) ?? "",
        createdAt: String(o.created_at),
      };
    }

    return {
      orderNumber: String(o.order_number),
      recipientName: String(o.customer_name),
      phone: String(o.customer_phone),
      city: String(o.customer_city),
      address: String(o.customer_address),
      building: (o.customer_building as string | null) ?? "",
      postalCode: (o.customer_postal_code as string | null) ?? "",
      isGift: false,
      status: String(o.order_status),
      total: Number(o.total_amount ?? 0),
      notes: (o.notes as string | null) ?? "",
      createdAt: String(o.created_at),
    };
  });
}

/** صف مبيعات مختصر — لتجميع لوحة التحكم */
export interface OrderSalesRow {
  total_amount: number;
  order_status: OrderStatus;
  created_at: string;
}

/** طلبات منذ تاريخ (ISO) — للمبيعات في لوحة التحكم */
export async function getOrdersSince(sinceISO: string): Promise<OrderSalesRow[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("orders")
    .select("total_amount, order_status, created_at")
    .gte("created_at", sinceISO);

  return (data ?? []).map((r) => ({
    total_amount: Number(r.total_amount ?? 0),
    order_status: String(r.order_status) as OrderStatus,
    created_at: String(r.created_at),
  }));
}

/** عدّ الطلبات حسب حالات معيّنة (أو الكل) */
export async function countOrders(statuses?: OrderStatus[]): Promise<number> {
  const supabase = createAdminClient();
  let query = supabase.from("orders").select("*", { count: "exact", head: true });
  if (statuses && statuses.length) query = query.in("order_status", statuses);
  const { count } = await query;
  return count ?? 0;
}

/* ── تحديثات الأدمن ─────────────────────────────────────── */

/** تغيير حالة الطلب + تسجيلها في order_status_history */
export async function updateOrderStatus(
  id: string,
  newStatus: OrderStatus,
  note: string | null,
  adminId: string | null
): Promise<void> {
  const supabase = createAdminClient();

  const { data: current } = await supabase
    .from("orders")
    .select("order_status")
    .eq("id", id)
    .single();
  const oldStatus = (current?.order_status as string | undefined) ?? null;

  const { error } = await supabase.from("orders").update({ order_status: newStatus }).eq("id", id);
  if (error) throw new Error(error.message);

  await supabase.from("order_status_history").insert({
    order_id: id,
    old_status: oldStatus,
    new_status: newStatus,
    note,
    changed_by: adminId,
  });

  // إرجاع المخزون تلقائيًا عند الإلغاء (فقط عند الانتقال من حالة غير ملغاة → ملغاة، لتجنّب الإرجاع المزدوج)
  if (newStatus === "cancelled" && oldStatus !== "cancelled") {
    const { data: items } = await supabase
      .from("order_items")
      .select("product_slug, quantity")
      .eq("order_id", id);
    if (items?.length) {
      await restoreStock(
        items.map((it) => ({ slug: String(it.product_slug), quantity: Number(it.quantity) || 0 }))
      );
    }
  }
}

/** تحديث شركة الشحن ورقم التتبّع */
export async function updateOrderTracking(
  id: string,
  company: string | null,
  trackingNumber: string | null
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("orders")
    .update({ shipping_company: company, tracking_number: trackingNumber })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

/** تحديث الملاحظات الداخلية للأدمن */
export async function updateOrderAdminNotes(id: string, adminNotes: string | null): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("orders").update({ admin_notes: adminNotes }).eq("id", id);
  if (error) throw new Error(error.message);
}

/** صف سجل حالة الطلب */
export interface StatusHistoryRow {
  id: string;
  old_status: string | null;
  new_status: string;
  note: string | null;
  created_at: string;
}

/** سجلّ تغيّر حالة الطلب (الأحدث أولاً) */
export async function getOrderStatusHistory(orderId: string): Promise<StatusHistoryRow[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("order_status_history")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });

  return (data ?? []).map((r) => ({
    id: String(r.id),
    old_status: (r.old_status as string | null) ?? null,
    new_status: String(r.new_status),
    note: (r.note as string | null) ?? null,
    created_at: String(r.created_at),
  }));
}
