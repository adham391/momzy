/**
 * seed-admins.ts
 * ──────────────
 * ينشئ 3 حسابات أدمن في Supabase Auth + صفوفها في جدول public.admins.
 *
 * ⚠️ طبّق ملفات supabase/migrations/ أولاً (خاصة 0002_admin.sql) قبل التشغيل.
 *
 * idempotent: يتخطّى الحساب الموجود ويحدّث صفّ admins (upsert).
 *
 * تشغيل:
 *   npm run seed:admins
 *
 * متطلبات في .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL=...
 *   SUPABASE_SERVICE_ROLE_KEY=...   (سرّي — service role)
 *   SEED_ADMIN_PASSWORD=...         (مطلوب فقط حين يُنشأ حساب جديد — لا كلمة مرور في الكود)
 */

import * as dotenv from "dotenv";
import * as path from "path";

// تحميل .env.local (نفس نمط scripts/migrate-seed-to-sanity.ts)
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { createClient } from "@supabase/supabase-js";

// ─── الأدمن الثلاثة (تُغيَّر الإيميلات لاحقاً للحقيقية) ─────────────────────────
const ADMINS = [
  { name: "ادهم",    email: "adham@momzyworld.com", role: "super_admin" as const },
  { name: "هبة حسن", email: "heba@momzyworld.com",  role: "admin" as const },
  { name: "أدمن",    email: "admin@momzyworld.com", role: "admin" as const },
];

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error("❌ متغيّرات البيئة مفقودة: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log("🚀 إنشاء حسابات الأدمن...\n");

  // اجلب المستخدمين الحاليين مرة واحدة (لاكتشاف الموجود مسبقاً)
  const { data: existing, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) {
    console.error("❌ فشل جلب المستخدمين الحاليين:", listErr.message);
    console.error("   تأكّدي أن SUPABASE_SERVICE_ROLE_KEY صحيح.");
    process.exit(1);
  }
  const byEmail = new Map(existing.users.map((u) => [u.email, u.id]));

  // كلمة المرور المؤقتة من .env.local فقط — تُطلب حين يوجد حساب سيُنشأ، لا قبل
  const toCreate = ADMINS.filter((a) => !byEmail.has(a.email));
  const tempPassword = process.env.SEED_ADMIN_PASSWORD?.trim() ?? "";
  if (toCreate.length > 0 && !tempPassword) {
    console.error("❌ SEED_ADMIN_PASSWORD مفقود في .env.local — مطلوب لإنشاء:");
    for (const a of toCreate) console.error(`   ${a.email}`);
    process.exit(1);
  }

  const results = { created: 0, existed: 0, failed: 0 };

  for (const admin of ADMINS) {
    try {
      let userId = byEmail.get(admin.email);

      if (userId) {
        console.log(`⏭️  موجود مسبقاً: ${admin.email}`);
        results.existed++;
      } else {
        const { data, error } = await supabase.auth.admin.createUser({
          email: admin.email,
          password: tempPassword,
          email_confirm: true, // مؤكَّد — يستطيع الدخول فوراً بلا إيميل تحقّق
          user_metadata: { name: admin.name },
        });
        if (error || !data.user) {
          throw error ?? new Error("لم يُرجَع مستخدم من createUser");
        }
        userId = data.user.id;
        console.log(`✅ أُنشئ حساب Auth: ${admin.email}`);
        results.created++;
      }

      // upsert صفّ admins (يربط auth.users بالدور)
      const { error: upsertErr } = await supabase.from("admins").upsert(
        {
          id: userId,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          is_active: true,
        },
        { onConflict: "id" }
      );
      if (upsertErr) throw upsertErr;
    } catch (err) {
      console.error(`❌ فشل: ${admin.email} —`, err instanceof Error ? err.message : err);
      results.failed++;
    }
  }

  console.log("\n─────────────────────────────────────────");
  console.log(`✅ أُنشئ:  ${results.created}`);
  console.log(`⏭️  موجود:  ${results.existed}`);
  if (results.failed) console.log(`❌ فشل:    ${results.failed}`);
  console.log("─────────────────────────────────────────");
  if (results.created > 0) {
    console.log(`\n🔑 الحسابات الجديدة تدخل بكلمة المرور من SEED_ADMIN_PASSWORD`);
    console.log("   غيّريها بعد أول دخول من /admin/account.\n");
  }
}

main().catch((err) => {
  console.error("❌ خطأ غير متوقع:", err);
  process.exit(1);
});
