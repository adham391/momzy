/**
 * set-admin-password.ts
 * ─────────────────────
 * يضبط كلمة مرور جديدة لحساب أدمن — لمن نسي كلمته.
 *
 * يعمل بمفتاح service role، فلا يحتاج الكلمة القديمة. وSupabase يخزّن
 * كلمات المرور مُشفّرة، فالاستعادة مستحيلة أصلًا — الممكن هو الاستبدال.
 *
 * تشغيل (في طرفيتك أنت):
 *   npm run admin:password                         ← يعرض حسابات الأدمن
 *   npm run admin:password -- adham@momzyworld.com ← يضبط كلمة الحساب
 *
 * الكلمة تُكتب مخفيّة ولا تُطبع ولا تُحفظ في سجل الأوامر ولا في أي ملف،
 * وتُطلب مرتين للتأكيد. ولا يقبل السكربت إلا حسابًا مسجّلًا في جدول admins
 * — فلا يصلح لتغيير كلمة أي مستخدم آخر في Supabase Auth.
 */

import * as dotenv from "dotenv";
import * as path from "path";
// الحدّ الأدنى مشترك مع صفحة «حسابي» في لوحة الأدمن — مصدر واحد فلا يتباعدان
import { MIN_ADMIN_PASSWORD_LENGTH as MIN_PASSWORD_LENGTH } from "../lib/admin/passwordPolicy";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

/** صفّ أدمن — id هو نفسه معرّف المستخدم في Supabase Auth */
interface AdminRow {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
}

/**
 * يقرأ سطرًا من الطرفية دون عرض ما يُكتب.
 * وضع raw بدل readline: لا اعتماد على دوالّ داخلية غير موثّقة، ويقبل
 * اللصق من مدير كلمات المرور لأنّ اللصق يصل دفعةً واحدة.
 */
function readHidden(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stdin = process.stdin;
    let value = "";

    const cleanup = () => {
      stdin.off("data", onData);
      stdin.setRawMode(false);
      stdin.pause();
    };

    const onData = (chunk: string) => {
      for (const ch of chunk) {
        if (ch === "\r" || ch === "\n") {
          cleanup();
          process.stdout.write("\n");
          resolve(value);
          return;
        }
        if (ch === "\u0003") {
          // Ctrl+C
          cleanup();
          process.stdout.write("\n");
          reject(new Error("أُلغي — لم يتغيّر شيء."));
          return;
        }
        if (ch === "\u007f" || ch === "\b") {
          value = value.slice(0, -1);
          continue;
        }
        value += ch;
      }
    };

    process.stdout.write(prompt);
    stdin.setRawMode(true);
    stdin.setEncoding("utf8");
    stdin.resume();
    stdin.on("data", onData);
  });
}

/** يطبع حسابات الأدمن — بلا أي سرّ */
function printAdmins(admins: AdminRow[]) {
  console.log("حسابات الأدمن:");
  for (const a of admins) {
    console.log(`  ${a.email.padEnd(26)} ${a.role.padEnd(12)} ${a.is_active ? "نشط" : "موقوف"}`);
  }
}

async function main() {
  const { createAdminClient } = await import("../lib/supabase/admin");
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("admins")
    .select("id, name, email, role, is_active")
    .order("role", { ascending: false });
  if (error) throw new Error(`تعذّر جلب حسابات الأدمن: ${error.message}`);
  const admins = (data ?? []) as AdminRow[];

  const email = (process.argv[2] ?? "").trim().toLowerCase();
  if (!email) {
    printAdmins(admins);
    console.log("\nالاستعمال:  npm run admin:password -- <الإيميل>");
    return;
  }

  const admin = admins.find((a) => a.email.toLowerCase() === email);
  if (!admin) {
    console.error(`❌ «${email}» ليس حساب أدمن.\n`);
    printAdmins(admins);
    process.exit(1);
  }

  // الإدخال المخفي يحتاج طرفية حقيقية — ولا نقبل كلمة من أنبوب أو ملف
  if (!process.stdin.isTTY) {
    console.error("❌ شغّل السكربت في طرفية تفاعلية — الكلمة تُكتب مخفيّة ولا تُمرَّر كمعامل.");
    process.exit(1);
  }

  console.log(`الحساب: ${admin.name} — ${admin.email} (${admin.role})`);
  console.log(`اكتب كلمة المرور الجديدة — ${MIN_PASSWORD_LENGTH} حرفًا على الأقل. لن تظهر أثناء الكتابة.\n`);

  const first = await readHidden("كلمة المرور الجديدة: ");
  if (first.length < MIN_PASSWORD_LENGTH) {
    console.error(`❌ قصيرة — ${first.length} من ${MIN_PASSWORD_LENGTH} على الأقل. لم يتغيّر شيء.`);
    process.exit(1);
  }

  const second = await readHidden("أعد كتابتها للتأكيد: ");
  if (first !== second) {
    console.error("❌ الكلمتان غير متطابقتين. لم يتغيّر شيء.");
    process.exit(1);
  }

  const { error: updateError } = await supabase.auth.admin.updateUserById(admin.id, { password: first });
  if (updateError) {
    console.error(`❌ رفض Supabase التغيير: ${updateError.message}`);
    process.exit(1);
  }

  console.log(`\n✅ تغيّرت كلمة مرور ${admin.email}.`);
  console.log("   ادخل من /admin/login بالكلمة الجديدة.");
}

main().catch((err) => {
  console.error("❌", err instanceof Error ? err.message : err);
  process.exit(1);
});
