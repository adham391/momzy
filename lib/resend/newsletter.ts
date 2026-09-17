import { resend } from "./client";
import { upsertNewsletterContact } from "./newsletterContact";

/**
 * قائمة النشرة البريدية في Resend (Segment) — منها تُرسَل النشرات من لوحة Resend (Broadcasts).
 * بلا المعرّف أو بلا مفتاح Resend لا مزامنة، ويبقى الاشتراك محفوظًا في Supabase كما هو.
 */
function newsletterSegmentId(): string | null {
  if (!process.env.RESEND_API_KEY) return null;
  return process.env.RESEND_NEWSLETTER_SEGMENT_ID?.trim() || null;
}

/**
 * يضيف المشتركة إلى قائمة النشرة في Resend، برمز إلغاء اشتراكها — best-effort، لا يرمي.
 * الاشتراك من الموقع موافقة صريحة: من ألغت اشتراكها سابقًا ثم عادت واشتركت يُعاد تفعيلها.
 */
export async function syncNewsletterSubscriber(email: string): Promise<void> {
  const segmentId = newsletterSegmentId();
  if (!segmentId) return;

  try {
    const error = await upsertNewsletterContact(resend, email, segmentId);
    if (error) console.error("[newsletter] Resend رفض إضافة المشتركة:", JSON.stringify(error));
  } catch (e) {
    console.error("[newsletter] استثناء في مزامنة Resend:", e);
  }
}
