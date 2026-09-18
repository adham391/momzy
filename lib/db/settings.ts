import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_SHIPPING, type ShippingConfig } from "@/lib/shipping";
import { DEFAULT_USD_RATE, USD_RATE_SETTING } from "@/lib/currency";

/** تحويل نص إعداد لرقم بأمان مع احتياطي */
function num(v: string | undefined, fallback: number): number {
  if (v === undefined || v.trim() === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

/** تحويل نص إعداد لقيمة منطقية ("true"/"1" ⇒ true) */
export function boolSetting(v: string | undefined, fallback = false): boolean {
  if (v === undefined) return fallback;
  return v === "true" || v === "1";
}

/**
 * يقرأ إعدادات (key/value) من جدول settings.
 * @param keys مفاتيح محددة — أو الكل إذا لم تُمرَّر.
 */
export async function getSettingsMap(keys?: string[]): Promise<Record<string, string>> {
  const supabase = createAdminClient();
  let query = supabase.from("settings").select("key, value");
  if (keys && keys.length) query = query.in("key", keys);

  const { data } = await query;
  const map: Record<string, string> = {};
  for (const row of data ?? []) {
    map[row.key as string] = (row.value as string | null) ?? "";
  }
  return map;
}

/** إعدادات الشحن التشغيلية (رسوم + حد الشحن المجاني) */
export async function getShippingConfig(): Promise<ShippingConfig> {
  const m = await getSettingsMap(["default_shipping_cost", "free_shipping_min"]);
  return {
    defaultCost: num(m["default_shipping_cost"], DEFAULT_SHIPPING.defaultCost),
    freeMin: num(m["free_shipping_min"], DEFAULT_SHIPPING.freeMin),
  };
}

/** هل المتجر مفتوح للطلبات؟ (افتراضي: مفتوح) */
export async function isShopOpen(): Promise<boolean> {
  const m = await getSettingsMap(["shop_is_open"]);
  return boolSetting(m["shop_is_open"], true);
}

/**
 * رقم واتساب هبة لاستقبال الإشعارات التلقائية.
 * المصدر: settings.whatsapp_number (من /admin/settings) ثم احتياطي env.
 * يُهمَل placeholder غير المضبوط (يحوي X). يعيد null إن لم يوجد رقم صالح.
 */
export async function getHebaWhatsAppNumber(): Promise<string | null> {
  const m = await getSettingsMap(["whatsapp_number"]);
  const candidate = (m["whatsapp_number"] ?? "").trim() || (process.env.HEBA_WHATSAPP_NUMBER ?? "").trim();
  if (!candidate || /x/i.test(candidate)) return null;
  return candidate;
}

/** يحدّث عدة إعدادات دفعة واحدة (upsert بالمفتاح — يحدّث value فقط) */
export async function updateSettings(updates: Record<string, string>): Promise<void> {
  const rows = Object.entries(updates).map(([key, value]) => ({ key, value }));
  if (rows.length === 0) return;
  const supabase = createAdminClient();
  const { error } = await supabase.from("settings").upsert(rows, { onConflict: "key" });
  if (error) throw new Error(error.message);
}

/** سعر صرف الدولار (₪ لكل $1) — للدفع من خارج البلاد؛ الفارغ أو غير الموجب يعود إلى الاحتياطي */
export async function getUsdRate(): Promise<number> {
  const m = await getSettingsMap([USD_RATE_SETTING]);
  const rate = num(m[USD_RATE_SETTING], DEFAULT_USD_RATE);
  return rate > 0 ? rate : DEFAULT_USD_RATE;
}

/** ما يُعبَّأ تلقائيًا في الجلسة الجديدة: رابط زوم الثابت للأونلاين، وعنوان اللقاءات الحضورية */
export interface SessionDefaults {
  zoomLink: string;
  venueAddress: string;
}

/** من /admin/settings — فارغان حتى تضبطهما هبة */
export async function getSessionDefaults(): Promise<SessionDefaults> {
  const m = await getSettingsMap(["zoom_link", "venue_address"]);
  return { zoomLink: (m["zoom_link"] ?? "").trim(), venueAddress: (m["venue_address"] ?? "").trim() };
}
