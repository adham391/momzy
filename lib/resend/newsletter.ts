import { resend } from "./client";

/**
 * قائمة النشرة البريدية في Resend (Segment) — منها تُرسَل النشرات من لوحة Resend (Broadcasts).
 * بلا المعرّف أو بلا مفتاح Resend لا مزامنة، ويبقى الاشتراك محفوظًا في Supabase كما هو.
 */
function newsletterSegmentId(): string | null {
  if (!process.env.RESEND_API_KEY) return null;
  return process.env.RESEND_NEWSLETTER_SEGMENT_ID?.trim() || null;
}

/**
 * يضيف المشتركة إلى قائمة النشرة في Resend — best-effort، لا يرمي.
 *
 * الاشتراك من الموقع موافقة صريحة: من ألغت اشتراكها سابقًا ثم عادت واشتركت يُعاد تفعيلها.
 * جهة الاتصال في Resend واحدة لكل بريد، فتُفحص أولًا بدل الاعتماد على خطأ «موجودة مسبقًا».
 */
export async function syncNewsletterSubscriber(email: string): Promise<void> {
  const segmentId = newsletterSegmentId();
  if (!segmentId) return;

  try {
    const existing = await resend.contacts.get({ email });

    if (existing.data) {
      if (existing.data.unsubscribed) {
        const { error } = await resend.contacts.update({ email, unsubscribed: false });
        if (error) console.error("[newsletter] Resend رفض إعادة تفعيل المشتركة:", JSON.stringify(error));
      }
      const { error } = await resend.contacts.segments.add({ email, segmentId });
      if (error) console.error("[newsletter] Resend رفض إضافة المشتركة للقائمة:", JSON.stringify(error));
      return;
    }

    if (existing.error?.name !== "not_found") {
      console.error("[newsletter] تعذّر فحص المشتركة في Resend:", JSON.stringify(existing.error));
      return;
    }

    const { error } = await resend.contacts.create({ email, unsubscribed: false, segments: [{ id: segmentId }] });
    if (error) console.error("[newsletter] Resend رفض إنشاء المشتركة:", JSON.stringify(error));
  } catch (e) {
    console.error("[newsletter] استثناء في مزامنة Resend:", e);
  }
}
