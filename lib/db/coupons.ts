import { createAdminClient } from "@/lib/supabase/admin";
import type { CouponType } from "@/lib/coupons";

export type { CouponType };

/** صف coupons (بعد تحويل الأرقام) */
export interface CouponRow {
  id: string;
  code: string;
  description: string | null;
  type: CouponType;
  value: number;
  min_order_amount: number;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

/** نتيجة التحقق من كوبون — تشمل قاعدة الكوبون ليحفظها العميل */
export interface CouponValidation {
  valid: boolean;
  discount: number;
  code?: string;
  label?: string;
  type?: CouponType;
  value?: number;
  minOrderAmount?: number;
  error?: string;
}

function toCoupon(r: Record<string, unknown>): CouponRow {
  return {
    ...(r as unknown as CouponRow),
    value: Number(r.value ?? 0),
    min_order_amount: Number(r.min_order_amount ?? 0),
    max_uses: r.max_uses == null ? null : Number(r.max_uses),
    used_count: Number(r.used_count ?? 0),
  };
}

/** يحسب الخصم لكوبون معيّن على مجموع */
function computeDiscount(c: CouponRow, subtotal: number): number {
  const raw = c.type === "percentage" ? Math.round((subtotal * c.value) / 100) : c.value;
  return Math.min(raw, subtotal); // لا يتجاوز الخصم المجموع
}

/**
 * يتحقق من كوبون لسلة بمجموع معيّن ويعيد الخصم المحسوب.
 * يُستخدم من /api/coupons/validate (عرض) ومن createOrder (تطبيق موثوق).
 */
export async function validateCoupon(code: string, subtotal: number): Promise<CouponValidation> {
  const clean = code.trim().toUpperCase();
  if (!clean) return { valid: false, discount: 0, error: "أدخلي كود الخصم" };

  const supabase = createAdminClient();
  const { data } = await supabase.from("coupons").select("*").eq("code", clean).maybeSingle();
  if (!data) return { valid: false, discount: 0, error: "كود الخصم غير صحيح" };

  const c = toCoupon(data);
  if (!c.is_active) return { valid: false, discount: 0, error: "كود الخصم غير مفعّل" };
  if (c.expires_at && new Date(c.expires_at) < new Date())
    return { valid: false, discount: 0, error: "انتهت صلاحية الكود" };
  if (c.max_uses != null && c.used_count >= c.max_uses)
    return { valid: false, discount: 0, error: "استُنفد هذا الكود" };
  if (subtotal < c.min_order_amount)
    return { valid: false, discount: 0, error: `الحد الأدنى للطلب ₪${c.min_order_amount}` };

  const discount = computeDiscount(c, subtotal);
  const label = c.type === "percentage" ? `${c.code} — ${c.value}%` : `${c.code} — ₪${c.value}`;
  return {
    valid: true,
    discount,
    code: c.code,
    label,
    type: c.type,
    value: c.value,
    minOrderAmount: c.min_order_amount,
  };
}

/** يزيد عدّاد استخدام الكوبون (عند إنشاء طلب ناجح) */
export async function incrementCouponUsage(code: string): Promise<void> {
  const supabase = createAdminClient();
  const clean = code.trim().toUpperCase();
  const { data } = await supabase
    .from("coupons")
    .select("id, used_count")
    .eq("code", clean)
    .maybeSingle();
  if (!data) return;
  await supabase
    .from("coupons")
    .update({ used_count: Number(data.used_count ?? 0) + 1 })
    .eq("id", data.id);
}

/* ── إدارة الأدمن ── */

/** قائمة الكوبونات (الأحدث أولاً) */
export async function listCoupons(): Promise<CouponRow[]> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
  return (data ?? []).map(toCoupon);
}

export interface CreateCouponInput {
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount: number;
  maxUses: number | null;
  expiresAt: string | null;
  createdBy?: string | null;
}

/** ينشئ كوبوناً جديداً — يعيد خطأ ودّياً لو الكود مكرّر */
export async function createCoupon(input: CreateCouponInput): Promise<{ ok: boolean; error?: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("coupons").insert({
    code: input.code.trim().toUpperCase(),
    type: input.type,
    value: input.value,
    min_order_amount: input.minOrderAmount,
    max_uses: input.maxUses,
    expires_at: input.expiresAt,
    created_by: input.createdBy ?? null,
  });
  if (error) {
    if (error.code === "23505") return { ok: false, error: "هذا الكود موجود مسبقاً" };
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

/** تفعيل/تعطيل كوبون */
export async function toggleCoupon(id: string, isActive: boolean): Promise<void> {
  const supabase = createAdminClient();
  await supabase.from("coupons").update({ is_active: isActive }).eq("id", id);
}

/** حذف كوبون */
export async function deleteCoupon(id: string): Promise<void> {
  const supabase = createAdminClient();
  await supabase.from("coupons").delete().eq("id", id);
}
