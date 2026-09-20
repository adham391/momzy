import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * حدّ عدد المحاولات في النماذج العامة — لكل عنوان IP.
 *
 * العدّاد في القاعدة (`hit_rate_limit` — هجرة 0023) لا في ذاكرة الخادم: Vercel يشغّل
 * نسخًا عدّة وذاكرة كل نسخة منفصلة. **يفشل مفتوحًا**: إن تعذّر الوصول للقاعدة يمرّ
 * الطلب — حدٌّ معطّل أهون من موقع لا يستقبل طلبًا.
 */

/** حدود كل نموذج: كم محاولة في كم ثانية، لكل IP */
export const RATE_LIMITS = {
  /** رسائل تصل بريد هبة */
  contact: { limit: 5, windowSeconds: 3600 },
  /** اشتراك النشرة — كل اشتراك جديد يرسل رسالة ترحيب */
  newsletter: { limit: 5, windowSeconds: 3600 },
  waitlist: { limit: 5, windowSeconds: 3600 },
  /** تسجيل ورشة — يحجز مقعدًا مؤقتًا */
  booking: { limit: 5, windowSeconds: 3600 },
  /** طلب متجر */
  order: { limit: 10, windowSeconds: 3600 },
  /** تجربة أكواد الكوبونات */
  coupon: { limit: 20, windowSeconds: 3600 },
  /** دخول المكتبة وطلب رابطها وتغيير كلمتها — تخمين كلمات المرور */
  library: { limit: 10, windowSeconds: 900 },
} as const;

export type RateLimitName = keyof typeof RATE_LIMITS;

/** عنوان الزائرة من ترويسات Vercel — «unknown» حين لا يصل عنوان */
function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return headers.get("x-real-ip")?.trim() || "unknown";
}

/** هل يُسمح بهذه المحاولة؟ */
export async function withinRateLimit(request: Request, name: RateLimitName): Promise<boolean> {
  const { limit, windowSeconds } = RATE_LIMITS[name];
  try {
    const { data, error } = await createAdminClient().rpc("hit_rate_limit", {
      p_key: `${name}:${clientIp(request.headers)}`,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    });
    if (error) {
      console.error("[rate-limit] تعذّر العدّ:", error.message);
      return true;
    }
    return data !== false;
  } catch (e) {
    console.error("[rate-limit] استثناء:", e);
    return true;
  }
}

/** ردّ «محاولات كثيرة» — نصّ واحد لكل النماذج */
export function tooManyRequests(): NextResponse {
  return NextResponse.json(
    { success: false, error: "محاولات كثيرة — انتظري قليلًا ثم حاولي مجددًا" },
    { status: 429, headers: { "Retry-After": "600" } }
  );
}

/** ينظّف عدّادات النوافذ المنتهية — يوميًا مع مهمة التذكيرات */
export async function purgeOldRateLimits(): Promise<void> {
  try {
    const dayAgo = new Date(Date.now() - 24 * 3600_000).toISOString();
    await createAdminClient().from("rate_limits").delete().lt("window_start", dayAgo);
  } catch (e) {
    console.error("[rate-limit] تعذّر التنظيف:", e);
  }
}
