"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  updateOrderStatus,
  updateOrderTracking,
  updateOrderAdminNotes,
} from "@/lib/db/orders";
import type { OrderStatus } from "@/lib/db/types";

/** id الأدمن الحالي (للحقل changed_by في السجل) */
async function currentAdminId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/** تغيير حالة الطلب + تسجيلها */
export async function changeOrderStatusAction(formData: FormData) {
  const id = String(formData.get("orderId"));
  const status = String(formData.get("status")) as OrderStatus;
  const note = String(formData.get("note") ?? "").trim() || null;

  await updateOrderStatus(id, status, note, await currentAdminId());

  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}

/** تحديث شركة الشحن ورقم التتبّع */
export async function updateTrackingAction(formData: FormData) {
  const id = String(formData.get("orderId"));
  const company = String(formData.get("company") ?? "").trim() || null;
  const tracking = String(formData.get("tracking") ?? "").trim() || null;

  await updateOrderTracking(id, company, tracking);
  revalidatePath(`/admin/orders/${id}`);
}

/** تحديث الملاحظات الداخلية */
export async function updateAdminNotesAction(formData: FormData) {
  const id = String(formData.get("orderId"));
  const notes = String(formData.get("adminNotes") ?? "").trim() || null;

  await updateOrderAdminNotes(id, notes);
  revalidatePath(`/admin/orders/${id}`);
}
