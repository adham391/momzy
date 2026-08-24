/**
 * i18n-apply.ts — يقرأ ملفات الترجمة (المعبّأة he/en) ويضيف عناصر he/en
 * إلى كل مصفوفة مُدوّلة في المستند المطابق، ثم يحفظه. idempotent (يستبدل he/en).
 *
 * تشغيل: npx tsx scripts/i18n-apply.ts <dir>
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

const DIR = process.argv[2] || path.resolve(process.cwd(), "scratchpad-translations");
const LANGS = new Set(["ar", "he", "en"]);

interface IntlItem { _key: string; _type: string; language: string; value: string }
const isIntl = (v: unknown): v is IntlItem[] =>
  Array.isArray(v) && v.length > 0 &&
  v.every((i) => i && typeof i === "object" && "language" in (i as object) && "value" in (i as object) &&
    LANGS.has((i as IntlItem).language));

/** يصل للعقدة عند المسار (نقاط + فهارس) */
function nodeAt(root: unknown, p: string): unknown {
  return p.split(".").reduce<unknown>((acc, seg) => {
    if (acc == null) return undefined;
    const idx = Number(seg);
    return Array.isArray(acc) ? acc[idx] : (acc as Record<string, unknown>)[seg];
  }, root);
}

/** يضيف/يستبدل عنصر لغة في مصفوفة مُدوّلة */
function setLang(arr: IntlItem[], lang: "he" | "en", value: string) {
  const _type = arr[0]?._type ?? "internationalizedArrayStringValue";
  const existing = arr.find((i) => i.language === lang);
  if (existing) { existing.value = value; existing._key = lang; }
  else arr.push({ _key: lang, _type, language: lang, value });
}

async function main() {
  const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".json"));
  console.log(`تطبيق ${files.length} ملف ترجمة من ${DIR}`);

  for (const f of files) {
    const t = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
    const doc = await client.getDocument(t._id);
    if (!doc) { console.log(`  ⚠️ مفقود: ${t._id}`); continue; }

    let applied = 0;
    for (const [p, tr] of Object.entries(t.fields as Record<string, { ar: string; he: string; en: string }>)) {
      const arr = nodeAt(doc, p);
      if (!isIntl(arr)) { console.log(`  ⚠️ ${t._id}: المسار ${p} ليس مصفوفة مُدوّلة`); continue; }
      if (tr.he && tr.he.trim()) { setLang(arr, "he", tr.he); applied++; }
      if (tr.en && tr.en.trim()) { setLang(arr, "en", tr.en); applied++; }
    }

    await client.createOrReplace(doc);
    console.log(`  ✅ ${t._id} (${applied} قيمة)`);
  }
  console.log("\n✔ اكتمل تطبيق الترجمات.");
}
main().catch((e) => { console.error("خطأ:", e); process.exit(1); });
