/**
 * clear-test-data.ts
 * ──────────────────
 * يحذف بيانات الاختبار من Supabase:
 *   orders (+ order_items + order_status_history عبر cascade)
 *   bookings (+ booking_status_history عبر cascade)
 *   availability · coupons · analytics_events
 *
 * يُبقي: admins + settings (إعدادات تشغيلية حقيقية).
 *
 * تشغيل:
 *   npm run clear:test
 *
 * يتطلب في .env.local: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 */

import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { createClient } from "@supabase/supabase-js";

// فلتر يطابق كل الصفوف (كلها created_at بعد 2000)
const ALL = "2000-01-01";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("❌ متغيّرات البيئة مفقودة: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const countOf = async (t: string) =>
    (await supabase.from(t).select("*", { count: "exact", head: true })).count ?? 0;

  const reportTables = [
    "orders",
    "order_items",
    "order_status_history",
    "bookings",
    "booking_status_history",
    "availability",
    "coupons",
    "analytics_events",
    "newsletter_subscribers",
    "waitlist",
  ];

  const before: Record<string, number> = {};
  for (const t of reportTables) before[t] = await countOf(t);

  console.log("🗑️  حذف بيانات الاختبار...\n");

  // الترتيب يحترم التبعيات (cascade يحذف الأبناء تلقائيًا)
  const steps: [string, () => PromiseLike<{ error: unknown }>][] = [
    ["analytics_events", () => supabase.from("analytics_events").delete().gte("created_at", ALL)],
    ["orders", () => supabase.from("orders").delete().gte("created_at", ALL)],
    ["bookings", () => supabase.from("bookings").delete().gte("created_at", ALL)],
    ["availability", () => supabase.from("availability").delete().gte("created_at", ALL)],
    ["coupons", () => supabase.from("coupons").delete().gte("created_at", ALL)],
    ["newsletter_subscribers", () => supabase.from("newsletter_subscribers").delete().gte("subscribed_at", ALL)],
    ["waitlist", () => supabase.from("waitlist").delete().gte("created_at", ALL)],
  ];

  for (const [name, run] of steps) {
    const { error } = await run();
    if (error) {
      console.error(`❌ فشل حذف ${name}:`, error);
      process.exit(1);
    }
  }

  console.log("عدد الصفوف المحذوفة:");
  for (const t of reportTables) console.log(`  ${t.padEnd(24)} ${before[t]}`);
  console.log("\n✅ تم — admins + settings محفوظة.");
}

main().catch((err) => {
  console.error("❌ خطأ غير متوقع:", err);
  process.exit(1);
});
