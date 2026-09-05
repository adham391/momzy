/**
 * يرفع كل المقالات إلى Sanity — idempotent (إعادة التشغيل تحديث لا تكرار).
 *
 * التشغيل:  npx tsx scripts/seed-articles.ts
 * أو مقالاً بعينه:  npx tsx scripts/seed-articles.ts teething
 *
 * لإضافة مقال جديد: أنشئ ملفًا في scripts/articles/ يصدّر ArticleSeed،
 * وسجّله في القائمة أدناه. لا شيء آخر.
 */
import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { seedArticle, type ArticleSeed } from "./articles/builders";
import { swaddling } from "./articles/swaddling";
import { teething } from "./articles/teething";
import { screens } from "./articles/screens";

/** كل المقالات — الترتيب هنا لا يؤثّر على ترتيب العرض (يحكمه publishedAt) */
const ARTICLES: ArticleSeed[] = [swaddling, teething, screens];

async function main() {
  const only = process.argv[2];
  const picked = only
    ? ARTICLES.filter((a) => a.slug.includes(only) || a.id.includes(only))
    : ARTICLES;

  if (picked.length === 0) {
    console.error(`❌ لا مقال يطابق «${only}» — المتاح: ${ARTICLES.map((a) => a.slug).join(", ")}`);
    process.exit(1);
  }

  console.log(`المقالات (${picked.length}):\n`);
  for (const article of picked) {
    await seedArticle(article);
  }
  console.log(`\n✅ تمّ.`);
}

main().catch((e) => {
  console.error("❌", e.message);
  process.exit(1);
});
