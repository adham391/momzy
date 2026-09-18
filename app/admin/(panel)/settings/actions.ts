"use server";

import { revalidatePath } from "next/cache";
import { updateSettings } from "@/lib/db/settings";
import { DEFAULT_USD_RATE } from "@/lib/currency";
import { NOTIFY_EMAIL_SETTING_KEYS } from "@/lib/notifications/recipients";
import { sanityWriteClient } from "@/lib/sanity/client";
import { LOCALES, intlValueType } from "@/lib/sanity/i18n";

/** إعدادات تشغيلية → جدول Supabase settings */
export async function updateOperationalSettingsAction(formData: FormData) {
  const shippingCost = Number(formData.get("default_shipping_cost"));
  const freeMin = Number(formData.get("free_shipping_min"));
  const usdRate = Number(formData.get("usd_rate"));

  await updateSettings({
    shop_is_open: formData.get("shop_is_open") === "on" ? "true" : "false",
    booking_is_open: formData.get("booking_is_open") === "on" ? "true" : "false",
    default_shipping_cost: String(Number.isFinite(shippingCost) && shippingCost >= 0 ? shippingCost : 0),
    free_shipping_min: String(Number.isFinite(freeMin) && freeMin >= 0 ? freeMin : 0),
    // ₪ لكل $1 — سعر غير موجب يعود إلى الاحتياطي بدل أن يعطّل الدفع من الخارج
    usd_rate: String(Number.isFinite(usdRate) && usdRate > 0 ? usdRate : DEFAULT_USD_RATE),
    whatsapp_number: String(formData.get("whatsapp_number") ?? "").trim(),
  });

  revalidatePath("/admin/settings");
  revalidatePath("/checkout"); // رسوم الشحن تؤثر على الـ checkout
}

/**
 * وجهات إشعارات الأدمن → جدول Supabase settings.
 * الحقل الفارغ يُحفظ فارغًا عمدًا — ومعناه «استعمل البريد الافتراضي».
 */
export async function updateNotifyEmailsAction(formData: FormData) {
  const updates: Record<string, string> = {};
  for (const key of Object.values(NOTIFY_EMAIL_SETTING_KEYS)) {
    updates[key] = String(formData.get(key) ?? "").trim();
  }
  await updateSettings(updates);
  revalidatePath("/admin/settings");
}

/** ثوابت الجلسات — رابط زوم واحد لكل الأونلاين، وعنوان واحد للحضوري → جدول settings */
export async function updateSessionDefaultsAction(formData: FormData) {
  await updateSettings({
    zoom_link: String(formData.get("zoom_link") ?? "").trim(),
    venue_address: String(formData.get("venue_address") ?? "").trim(),
  });
  revalidatePath("/admin/settings");
  revalidatePath("/admin/bookings/availability");
}

/**
 * قيم لغات حقل من النموذج (name_ar / name_he / name_en) → مصفوفة Sanity المُدوّلة.
 * اللغة الفارغة تُحذف فتسقط صفحاتها للعربية.
 */
function localizedFromForm(formData: FormData, name: string) {
  return LOCALES.flatMap((language) => {
    const value = String(formData.get(`${name}_${language}`) ?? "").trim();
    return value ? [{ _key: language, _type: intlValueType("string"), language, value }] : [];
  });
}

/** محتوى الموقع (TopBar + تواصل) → Sanity siteSettings singleton — نصوص الشريط بكل لغاتها */
export async function updateSiteContentAction(formData: FormData) {
  const message = localizedFromForm(formData, "topbar_message");
  const badge = localizedFromForm(formData, "topbar_badge");
  const email = String(formData.get("contact_email") ?? "").trim();
  const whatsapp = String(formData.get("contact_whatsapp") ?? "").trim();

  // نضمن وجود الـ singleton قبل الـ patch (patch يفشل لو الوثيقة غير موجودة)
  await sanityWriteClient.createIfNotExists({ _id: "siteSettings", _type: "siteSettings" });
  let patch = sanityWriteClient.patch("siteSettings").set({
    "contact.email": email,
    "contact.whatsappNumber": whatsapp,
  });
  // حقل فارغ في كل اللغات يُزال فيعود الموقع إلى النص الافتراضي
  patch = message.length > 0 ? patch.set({ "topBar.message": message }) : patch.unset(["topBar.message"]);
  patch = badge.length > 0 ? patch.set({ "topBar.badge": badge }) : patch.unset(["topBar.badge"]);
  await patch.commit();

  revalidatePath("/admin/settings");
  revalidatePath("/", "layout"); // TopBar + Footer في site layout
}
