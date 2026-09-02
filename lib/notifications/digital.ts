import { getDownloadsByOrder } from "@/lib/db/downloads";
import { getOrderById } from "@/lib/db/orders";
import { ensureAccount, createLibraryToken } from "@/lib/db/library";
import { isEmailConfigured, sendEmail } from "@/lib/resend/client";
import { downloadEmailHtml, downloadEmailSubject } from "@/lib/resend/emails/downloadEmail";

/**
 * تسليم المنتجات الرقمية — رابط القراءة + دعوة المكتبة.
 *
 * تُستدعى في حالتين، تمامًا كنظيرتها في الحجوزات:
 *  - HYP غير مفعّل: فور إنشاء الطلب (`POST /api/orders`) — الطلب pending.
 *  - HYP مفعّل: **بعد نجاح الدفع فقط** (`GET /api/hyp/callback`).
 *
 * الدعوة تُصدَر مرة واحدة لكل بريد مستلِم حتى لو تعدّدت الكتيبات؛ ومن ثبّتت
 * كلمة مرورها يصلها رابط المكتبة بدل رابط الإنشاء.
 *
 * best-effort: تُنفَّذ بعد الرد ولا ترمي.
 */
export async function sendDigitalDelivery(orderId: string, siteUrl: string): Promise<void> {
  if (!isEmailConfigured()) return;

  const downloads = await getDownloadsByOrder(orderId);
  if (downloads.length === 0) return;

  // اسم المشترية — يظهر في إيميل الهدية للمستلِمة («أهدتكِ ...»)
  const order = await getOrderById(orderId);
  const gifterName = order?.customer_name;

  // رابط المكتبة لكل بريد مستلِم — مرة واحدة (فشله لا يمنع إيميل التسليم)
  const libraryLinks = new Map<string, { setupUrl?: string; libraryUrl?: string }>();
  for (const d of downloads) {
    const key = d.customer_email.toLowerCase();
    if (libraryLinks.has(key)) continue;
    try {
      const account = await ensureAccount(d.customer_email);
      if (account.password_hash) {
        libraryLinks.set(key, { libraryUrl: `${siteUrl}/library` });
      } else {
        const rawToken = await createLibraryToken(account.id, "setup");
        libraryLinks.set(key, { setupUrl: `${siteUrl}/library/setup/${rawToken}` });
      }
    } catch (err) {
      console.error("[digital] فشل تجهيز دعوة المكتبة:", err);
      libraryLinks.set(key, {});
    }
  }

  for (const d of downloads) {
    const lib = libraryLinks.get(d.customer_email.toLowerCase()) ?? {};
    await sendEmail({
      to: d.customer_email,
      subject: downloadEmailSubject(d.product_name, d.is_gift),
      html: downloadEmailHtml({
        productName: d.product_name,
        readUrl: `${siteUrl}/read/${d.token}`,
        isGift: d.is_gift,
        gifterName: d.is_gift ? gifterName : undefined,
        expiresAt: d.expires_at,
        librarySetupUrl: lib.setupUrl,
        libraryUrl: lib.libraryUrl,
      }),
    });
  }
}
