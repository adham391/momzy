import { createClient } from "@supabase/supabase-js";

/**
 * عميل Supabase بصلاحية service-role — يتجاوز RLS بالكامل.
 *
 * ⚠️ للسيرفر فقط: API routes، server actions، أو server components
 *    خلف حماية الأدمن. لا يُستورَد إطلاقاً في كود يصل للمتصفح
 *    (المفتاح سرّي — يكشف كامل قاعدة البيانات لو تسرّب).
 *
 * الاستخدام:
 *   const supabase = createAdminClient();
 *   const { data } = await supabase.from("orders").select("*");
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "[supabase/admin] متغيّرات البيئة مفقودة: NEXT_PUBLIC_SUPABASE_URL أو SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createClient(url, serviceKey, {
    // لا حاجة لجلسات — عمليات خادمية بحتة
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
