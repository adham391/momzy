"use server";

import { revalidatePath } from "next/cache";
import { updateSettings } from "@/lib/db/settings";
import { sanityWriteClient } from "@/lib/sanity/client";

/** إعدادات تشغيلية → جدول Supabase settings */
export async function updateOperationalSettingsAction(formData: FormData) {
  const shippingCost = Number(formData.get("default_shipping_cost"));
  const freeMin = Number(formData.get("free_shipping_min"));

  await updateSettings({
    shop_is_open: formData.get("shop_is_open") === "on" ? "true" : "false",
    booking_is_open: formData.get("booking_is_open") === "on" ? "true" : "false",
    default_shipping_cost: String(Number.isFinite(shippingCost) && shippingCost >= 0 ? shippingCost : 0),
    free_shipping_min: String(Number.isFinite(freeMin) && freeMin >= 0 ? freeMin : 0),
    whatsapp_number: String(formData.get("whatsapp_number") ?? "").trim(),
  });

  revalidatePath("/admin/settings");
  revalidatePath("/checkout"); // رسوم الشحن تؤثر على الـ checkout
}

/** محتوى الموقع (TopBar + تواصل) → Sanity siteSettings singleton */
export async function updateSiteContentAction(formData: FormData) {
  const message = String(formData.get("topbar_message") ?? "").trim();
  const badge = String(formData.get("topbar_badge") ?? "").trim();
  const email = String(formData.get("contact_email") ?? "").trim();
  const whatsapp = String(formData.get("contact_whatsapp") ?? "").trim();

  // نضمن وجود الـ singleton قبل الـ patch (patch يفشل لو الوثيقة غير موجودة)
  await sanityWriteClient.createIfNotExists({ _id: "siteSettings", _type: "siteSettings" });
  await sanityWriteClient
    .patch("siteSettings")
    .set({
      "topBar.message": message,
      "topBar.badge": badge,
      "contact.email": email,
      "contact.whatsappNumber": whatsapp,
    })
    .commit();

  revalidatePath("/admin/settings");
  revalidatePath("/", "layout"); // TopBar + Footer في site layout
}
