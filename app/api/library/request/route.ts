import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import {
  getAccountByEmail,
  ensureAccount,
  hasDigitalPurchases,
  createLibraryToken,
  wasTokenIssuedRecently,
} from "@/lib/db/library";
import { isEmailConfigured, sendEmail } from "@/lib/resend/client";
import { libraryEmailHtml, libraryEmailSubject } from "@/lib/resend/emails/libraryEmail";

/**
 * POST /api/library/request — «نسيت كلمة المرور» + الدعوة الذاتية معًا.
 *
 * الرد واحد دائمًا (نجاح عام) فلا يُستدلّ من الواجهة على وجود حساب أو مشتريات:
 *  - حساب له كلمة مرور   → رابط استعادة (reset، ساعتان)
 *  - حساب بلا كلمة، أو بريد له مشتريات رقمية بلا حساب → رابط إنشاء (setup، 7 أيام)
 *    — وهذا يغطي مشتريات ما قبل إطلاق المكتبة دون أي تدخل يدوي
 *  - بريد لا نعرفه → لا يُرسَل شيء
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { email?: unknown; locale?: unknown };
    const email = typeof body.email === "string" ? body.email.trim() : "";
    // لغة الصفحة — الطلب لحظي فتأتي من العميل مباشرة، بلا حاجة لحفظها
    const locale = typeof body.locale === "string" ? body.locale : null;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "invalid_email" }, { status: 400 });
    }

    // بلا مزوّد إيميل لا يمكن إيصال الرابط — نصارح بدل نجاح كاذب
    if (!isEmailConfigured()) {
      return NextResponse.json({ error: "server" }, { status: 500 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;

    // كل البحث والإرسال بعد الرد: لو بقي أيٌّ منه في مسار الاستجابة لَفرّق
    // زمنُها بين بريد له مشتريات وبريد مجهول — وهو نفس ما يخفيه الرد الموحّد
    after(async () => {
      try {
        const account = await getAccountByEmail(email);

        // خنق: رابط أُرسل قبل دقيقتين يكفي — فلا يُقصف بريدها بالرسائل
        if (account && (await wasTokenIssuedRecently(account.id))) return;

        if (account?.password_hash) {
          const raw = await createLibraryToken(account.id, "reset");
          await sendEmail({
            to: account.email,
            subject: libraryEmailSubject("reset", locale),
            html: libraryEmailHtml({ setupUrl: `${siteUrl}/library/setup/${raw}`, purpose: "reset", locale }),
          });
        } else if (account || (await hasDigitalPurchases(email))) {
          const acc = account ?? (await ensureAccount(email));
          if (await wasTokenIssuedRecently(acc.id)) return;
          const raw = await createLibraryToken(acc.id, "setup");
          await sendEmail({
            to: acc.email,
            subject: libraryEmailSubject("setup", locale),
            html: libraryEmailHtml({ setupUrl: `${siteUrl}/library/setup/${raw}`, purpose: "setup", locale }),
          });
        }
        // بريد مجهول تمامًا → صمت
      } catch (err) {
        console.error("[/api/library/request] فشل إرسال رابط المكتبة:", err);
      }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[/api/library/request]", err);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
