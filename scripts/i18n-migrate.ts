/**
 * i18n-migrate.ts — ترحيل محتوى Sanity إلى internationalized-array (مرحلة 3)
 * مدفوع بـ manifest لكل نوع: يحوّل القيم الخام (string / string[]) إلى مصفوفة
 * مُدوّلة بقيمة عربية فقط. idempotent (يتخطّى المُرحّل). الترجمات تُضاف لاحقًا.
 *
 * تشغيل: npx tsx scripts/i18n-migrate.ts
 */
import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

type Base = "string" | "text";
interface Level {
  scalars?: Record<string, Base>;
  lists?: string[]; // string[] fields → intl text (newline-joined)
}
interface Manifest extends Level {
  type: string;
  objectArrays?: Record<string, Level>; // arrayField → inner level
  singleObjects?: Record<string, Level>; // objectField → inner level
}

/* ── manifests ─────────────────────────────────────────────────────────────
   product مُعرّف هنا (مرجع). service/review يُضافان من نتائج الـ workflow. */
const MANIFESTS: Manifest[] = [
  {
    type: "product",
    scalars: {
      title: "string",
      description: "text",
      label: "string",
      badge: "string",
      longDescription: "text",
      bookletHook: "text",
    },
    lists: ["bookletAbout", "bookletChapters", "bookletBenefits", "bookletAudience"],
    objectArrays: {
      tags: { scalars: { label: "string" } },
      specifications: { scalars: { key: "string", value: "string" } },
      contents: { scalars: { name: "string", description: "text" } },
      giftTargets: { scalars: { label: "string", text: "text" } },
      testimonials: { scalars: { location: "string", text: "text" } },
      faqs: { scalars: { question: "string", answer: "text" } },
    },
    singleObjects: {
      shippingInfo: { scalars: { estimatedDays: "string", notes: "string" } },
      story: { scalars: { title: "string" }, lists: ["paragraphs"] },
    },
  },
  {
    type: "service",
    scalars: {
      title: "string",
      shortDescription: "text",
      duration: "string",
      location: "string",
      ageRange: "string",
    },
    lists: ["longDescription", "topics", "benefits"],
    objectArrays: {
      faqs: { scalars: { question: "string", answer: "text" } },
    },
  },
  {
    type: "review",
    scalars: { quote: "text", info: "string" },
  },
];

const vType = (b: Base) => (b === "text" ? "internationalizedArrayTextValue" : "internationalizedArrayStringValue");
interface IntlItem { _key: string; _type: string; language: string; value: string }
const isIntl = (v: unknown): v is IntlItem[] =>
  Array.isArray(v) && v.length > 0 && v.every((i) => i && typeof i === "object" && "value" in i && "language" in i);

function scalar(value: unknown, base: Base): IntlItem[] | undefined {
  if (value == null || value === "") return undefined;
  if (isIntl(value)) return value;
  return [{ _key: "ar", _type: vType(base), language: "ar", value: String(value) }];
}
function list(arr: unknown): IntlItem[] | undefined {
  if (arr == null) return undefined;
  if (isIntl(arr)) return arr;
  if (Array.isArray(arr)) {
    const joined = (arr as unknown[]).filter((x) => typeof x === "string").join("\n");
    return joined ? [{ _key: "ar", _type: vType("text"), language: "ar", value: joined }] : undefined;
  }
  return undefined;
}
/** يطبّق مستوى (scalars + lists) على كائن مع الحفاظ على باقي الحقول */
function applyLevel<T extends Record<string, unknown>>(obj: T, level: Level): T {
  const out: Record<string, unknown> = { ...obj };
  for (const [f, base] of Object.entries(level.scalars ?? {})) {
    if (f in obj) { const c = scalar(obj[f], base); if (c !== undefined) out[f] = c; }
  }
  for (const f of level.lists ?? []) {
    if (f in obj) { const c = list(obj[f]); if (c !== undefined) out[f] = c; }
  }
  return out as T;
}

async function migrateType(m: Manifest) {
  const docs = await client.fetch<Record<string, unknown>[]>(`*[_type == $t]`, { t: m.type });
  console.log(`\n── ${m.type}: ${docs.length} مستند ──`);
  for (const doc of docs) {
    const set: Record<string, unknown> = {};
    // حقول عليا (scalars + lists) — دلتا فقط
    for (const [f, base] of Object.entries(m.scalars ?? {})) {
      if (f in doc) { const c = scalar(doc[f], base); if (c !== undefined) set[f] = c; }
    }
    for (const f of m.lists ?? []) {
      if (f in doc) { const c = list(doc[f]); if (c !== undefined) set[f] = c; }
    }
    // مصفوفات كائنات — نستبدل المصفوفة كاملة بعناصرها المحوّلة
    for (const [arrField, level] of Object.entries(m.objectArrays ?? {})) {
      if (Array.isArray(doc[arrField])) {
        set[arrField] = (doc[arrField] as Record<string, unknown>[]).map((it) => applyLevel(it, level));
      }
    }
    // كائنات مفردة
    for (const [objField, level] of Object.entries(m.singleObjects ?? {})) {
      if (doc[objField] && typeof doc[objField] === "object") {
        set[objField] = applyLevel(doc[objField] as Record<string, unknown>, level);
      }
    }
    if (Object.keys(set).length === 0) { console.log(`  … ${doc._id} (لا تغيير)`); continue; }
    await client.patch(doc._id as string).set(set).commit();
    console.log(`  ✅ ${doc._id as string}`);
  }
}

async function main() {
  for (const m of MANIFESTS) await migrateType(m);
  console.log("\n✔ اكتمل الترحيل (عربي فقط).");
}
main().catch((e) => { console.error("خطأ:", e); process.exit(1); });
