"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createCoupon, toggleCoupon, deleteCoupon } from "@/lib/db/coupons";
import type { CouponType } from "@/lib/coupons";

export interface CouponFormState {
  error: string | null;
  success: boolean;
}

async function currentAdminId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/** إنشاء كوبون — يُستدعى من CouponCreateForm عبر useActionState */
export async function createCouponAction(
  _prev: CouponFormState,
  formData: FormData
): Promise<CouponFormState> {
  const code = String(formData.get("code") ?? "").trim();
  const type = (String(formData.get("type") ?? "percentage") as CouponType);
  const value = Number(formData.get("value"));
  const minOrder = Number(formData.get("min_order")) || 0;

  const maxUsesRaw = formData.get("max_uses");
  const maxUses = maxUsesRaw && String(maxUsesRaw).trim() ? Number(maxUsesRaw) : null;

  const expiresRaw = formData.get("expires_at");
  const expiresAt =
    expiresRaw && String(expiresRaw).trim()
      ? new Date(String(expiresRaw)).toISOString()
      : null;

  if (!code) return { error: "الكود مطلوب", success: false };
  if (!Number.isFinite(value) || value <= 0) return { error: "القيمة غير صحيحة", success: false };
  if (type === "percentage" && value > 100) return { error: "النسبة لا تتجاوز 100%", success: false };

  const result = await createCoupon({
    code,
    type,
    value,
    minOrderAmount: minOrder,
    maxUses,
    expiresAt,
    createdBy: await currentAdminId(),
  });

  if (!result.ok) return { error: result.error ?? "فشل الإنشاء", success: false };

  revalidatePath("/admin/coupons");
  return { error: null, success: true };
}

/** تفعيل/تعطيل كوبون */
export async function toggleCouponAction(formData: FormData) {
  const id = String(formData.get("id"));
  const isActive = String(formData.get("isActive")) === "true";
  await toggleCoupon(id, isActive);
  revalidatePath("/admin/coupons");
}

/** حذف كوبون */
export async function deleteCouponAction(formData: FormData) {
  const id = String(formData.get("id"));
  await deleteCoupon(id);
  revalidatePath("/admin/coupons");
}
