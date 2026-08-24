/**
 * i18n-extract.ts — يستخرج القيم العربية من كل الحقول المُدوّلة في مستندات
 * product/service/review ويكتب ملف ترجمة لكل مستند (ar معبّأة، he/en فارغة).
 * ثم تملؤها وكلاء الترجمة، ويطبّقها i18n-apply.ts.
 *
 * تشغيل: npx tsx scripts/i18n-extract.ts <outDir>
 */
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

const OUT = process.argv[2] || path.resolve(process.cwd(), "scratchpad-translations");
const LANGS = new Set(["ar", "he", "en"]);

/** هل القيمة مصفوفة مُدوّلة؟ (عناصرها تحمل language + value) */
function isIntl(v: unknown): v is { language: string; value: string }[] {
  return Array.isArray(v) && v.length > 0 &&
    v.every((i) => i && typeof i === "object" && "language" in (i as object) && "value" in (i as object) &&
      LANGS.has((i as { language: string }).language));
}

/** يمشي المستند ويجمع مسارات الحقول المُدوّلة + قيمتها العربية */
function collect(node: unknown, prefix: string, out: Record<string, string>) {
  if (isIntl(node)) {
    const ar = node.find((i) => i.language === "ar")?.value;
    if (ar) out[prefix] = ar;
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((item, i) => collect(item, prefix ? `${prefix}.${i}` : String(i), out));
    return;
  }
  if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith("_")) continue;
      collect(v, prefix ? `${prefix}.${k}` : k, out);
    }
  }
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const docs = await client.fetch<Record<string, unknown>[]>(
    `*[_type in ["product","service","review"]]`
  );
  console.log(`استخراج ${docs.length} مستند → ${OUT}`);

  const index: { id: string; type: string; fields: number }[] = [];
  for (const doc of docs) {
    const ar: Record<string, string> = {};
    collect(doc, "", ar);
    const fields: Record<string, { ar: string; he: string; en: string }> = {};
    for (const [p, v] of Object.entries(ar)) fields[p] = { ar: v, he: "", en: "" };
    const file = {
      _id: doc._id,
      _type: doc._type,
      // تلميح للسياق (لا يُكتب): عنوان عربي إن وُجد
      _hint: ar["title"] || ar["quote"] || ar["name"] || "",
      fields,
    };
    fs.writeFileSync(path.join(OUT, `${doc._id}.json`), JSON.stringify(file, null, 2) + "\n");
    index.push({ id: String(doc._id), type: String(doc._type), fields: Object.keys(fields).length });
  }

  console.log("\nالفهرس:");
  for (const e of index) console.log(`  ${e.type.padEnd(8)} ${e.id.padEnd(38)} ${e.fields} حقل`);
  console.log(`\n✔ اكتب he/en في الملفات، ثم شغّل i18n-apply.ts ${OUT}`);
}
main().catch((e) => { console.error("خطأ:", e); process.exit(1); });
