/**
 * newsletter.ts
 * ─────────────
 * يُعدّ عددًا من النشرة البريدية في Resend (Broadcasts).
 * العدد ملفّ في newsletters/ يصدّر NewsletterIssue، والقالب في lib/resend/emails/newsletterEmail.ts.
 *
 * تشغيل:
 *   npm run newsletter -- <العدد> --preview                يكتب HTML للمعاينة في المتصفح — لا يُرسَل شيء
 *   npm run newsletter -- <العدد> --test a@x.com,b@y.com  يرسله إلى هذه العناوين وحدها (قائمة الاختبار)
 *   npm run newsletter -- <العدد> --draft                  ينشئ مسودة لقائمة «Momzy Newsletter» في Resend
 *
 * الإرسال لكل المشتركات يتمّ من لوحة Resend بعد مراجعة المسودة، لا من هنا —
 * فلا تصل نشرة ناقصة للجميع بخطأ في سطر أوامر.
 *
 * متطلبات في .env.local: RESEND_API_KEY · NEXT_PUBLIC_SITE_URL · RESEND_NEWSLETTER_SEGMENT_ID (للمسودة)
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { Resend } from "resend";
import {
  newsletterEmailHtml,
  newsletterSubject,
  type NewsletterIssue,
} from "@/lib/resend/emails/newsletterEmail";
import { upsertNewsletterContact } from "@/lib/resend/newsletterContact";

process.loadEnvFile(path.resolve(process.cwd(), ".env.local"));

/**
 * المرسِل — عنوان الإرسال نفسه في إيميلات الموقع (noreply@) باسم Momzy، بلا عنوان ردّ:
 * النشرة لا تُنتظر عليها ردود، ووسيلة التواصل مذكورة في تذييلها.
 */
const FROM = `Momzy <${process.env.RESEND_FROM_EMAIL || "noreply@momzyworld.com"}>`;
/** قائمة الاختبار — تُفرَّغ قبل كل تجربة فلا يصل العدد إلا لعناوين التجربة الحالية */
const TEST_SEGMENT_NAME = "Momzy Newsletter — Test";
const MAX_PAGE = 100;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Mode = "--preview" | "--test" | "--draft";

function usage(message: string): never {
  console.error(`❌ ${message}\n   npm run newsletter -- <العدد> --preview | --test a@x.com,b@y.com | --draft`);
  process.exit(1);
}

/** يقرأ العدد من newsletters/<الاسم>.ts */
async function loadIssue(name: string): Promise<NewsletterIssue> {
  const file = path.resolve(process.cwd(), "newsletters", name.endsWith(".ts") ? name : `${name}.ts`);
  if (!fs.existsSync(file)) usage(`لا يوجد عدد بهذا الاسم: ${path.relative(process.cwd(), file)}`);
  const mod = (await import(pathToFileURL(file).href)) as { default: NewsletterIssue };
  return mod.default;
}

function resendClient(): Resend {
  if (!process.env.RESEND_API_KEY) usage("RESEND_API_KEY غير مضبوط في .env.local");
  return new Resend(process.env.RESEND_API_KEY);
}

/** معرّف قائمة الاختبار — تُنشأ في أول تجربة */
async function testSegmentId(resend: Resend): Promise<string> {
  const { data, error } = await resend.segments.list({ limit: MAX_PAGE });
  if (error) throw new Error(`تعذّر قراءة القوائم: ${error.message}`);
  const existing = data.data.find((s) => s.name === TEST_SEGMENT_NAME);
  if (existing) return existing.id;
  const created = await resend.segments.create({ name: TEST_SEGMENT_NAME });
  if (created.error) throw new Error(`تعذّر إنشاء قائمة الاختبار: ${created.error.message}`);
  return created.data.id;
}

/** يجعل قائمة الاختبار = هذه العناوين بالضبط، مشتركةً (من تجرّب طلبت الاستلام صراحةً) */
async function fillTestSegment(resend: Resend, segmentId: string, emails: string[]): Promise<void> {
  const members = await resend.contacts.list({ segmentId, limit: MAX_PAGE });
  if (members.error) throw new Error(`تعذّر قراءة قائمة الاختبار: ${members.error.message}`);
  for (const contact of members.data.data) {
    if (!emails.includes(contact.email)) {
      await resend.contacts.segments.remove({ email: contact.email, segmentId });
    }
  }

  // برمز إلغاء الاشتراك نفسه الذي تحمله المشتركات — فرابط التذييل في التجربة يعمل كالحقيقي
  for (const email of emails) {
    const error = await upsertNewsletterContact(resend, email, segmentId);
    if (error) throw new Error(`تعذّر إضافة ${email}: ${error.message}`);
  }
}

async function main() {
  const [issueName, modeArg, testList] = process.argv.slice(2);
  if (!issueName) usage("اكتبي اسم العدد");
  const mode = modeArg as Mode;
  if (!["--preview", "--test", "--draft"].includes(mode)) usage("اختاري --preview أو --test أو --draft");

  const issue = await loadIssue(issueName);
  const html = newsletterEmailHtml(issue);
  const subject = newsletterSubject(issue);

  if (mode === "--preview") {
    const out = path.join(os.tmpdir(), `momzy-newsletter-${issue.slug}.html`);
    fs.writeFileSync(out, html);
    console.log(`👀 المعاينة: ${out}\n   المرسِل: ${FROM}\n   العنوان: ${subject}`);
    return;
  }

  const resend = resendClient();
  const base = { from: FROM, subject, previewText: issue.previewText, html };

  if (mode === "--test") {
    const emails = (testList ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
    if (emails.length === 0 || !emails.every((e) => EMAIL_PATTERN.test(e))) {
      usage("--test يحتاج عناوين صحيحة مفصولة بفواصل");
    }
    const segmentId = await testSegmentId(resend);
    await fillTestSegment(resend, segmentId, emails);
    const sent = await resend.broadcasts.create({ ...base, name: `[TEST] ${issue.slug}`, segmentId, send: true });
    if (sent.error) throw new Error(`تعذّر إرسال التجربة: ${sent.error.message}`);
    console.log(`🧪 أُرسلت التجربة (${sent.data.id}) إلى: ${emails.join("، ")}\n   المرسِل: ${FROM}\n   العنوان: ${subject}`);
    return;
  }

  const segmentId = process.env.RESEND_NEWSLETTER_SEGMENT_ID?.trim();
  if (!segmentId) usage("RESEND_NEWSLETTER_SEGMENT_ID غير مضبوط في .env.local");
  const draft = await resend.broadcasts.create({ ...base, name: issue.slug, segmentId });
  if (draft.error) throw new Error(`تعذّر إنشاء المسودة: ${draft.error.message}`);
  console.log(
    `📝 المسودة جاهزة (${draft.data.id}) لقائمة «Momzy Newsletter» — لم تُرسَل.\n` +
      `   راجعيها وأرسليها من لوحة Resend ← Broadcasts.\n   المرسِل: ${FROM}\n   العنوان: ${subject}`
  );
}

main().catch((error) => {
  console.error("❌", error instanceof Error ? error.message : error);
  process.exit(1);
});
