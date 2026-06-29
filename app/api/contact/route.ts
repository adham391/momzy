import { NextRequest, NextResponse } from "next/server";
import { resend, FROM_EMAIL, TO_EMAIL } from "@/lib/resend/client";
import { contactEmailHtml, contactEmailSubject } from "@/lib/resend/emails/contactEmail";

/** التحقق من صحة الحقول المطلوبة */
function validate(body: Record<string, unknown>): string | null {
  if (!body.name    || typeof body.name    !== "string" || body.name.trim().length    < 2) return "الاسم غير صحيح";
  if (!body.email   || typeof body.email   !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) return "الإيميل غير صحيح";
  if (!body.subject || typeof body.subject !== "string" || body.subject.trim().length < 2) return "الموضوع غير صحيح";
  if (!body.message || typeof body.message !== "string" || body.message.trim().length < 10) return "الرسالة قصيرة جداً";
  return null;
}

/** POST /api/contact — استقبال رسالة التواصل وإرسالها لهبة عبر Resend */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, unknown>;

    const error = validate(body);
    if (error) {
      return NextResponse.json({ success: false, error }, { status: 400 });
    }

    const data = {
      name:    (body.name    as string).trim(),
      email:   (body.email   as string).trim(),
      phone:   body.phone ? (body.phone as string).trim() : undefined,
      subject: (body.subject as string).trim(),
      message: (body.message as string).trim(),
    };

    const { error: resendError } = await resend.emails.send({
      from:    FROM_EMAIL,
      to:      TO_EMAIL,
      replyTo: data.email,
      subject: contactEmailSubject(data.name, data.subject),
      html:    contactEmailHtml(data),
    });

    if (resendError) {
      console.error("Resend error:", resendError);
      return NextResponse.json({ success: false, error: "فشل إرسال الإيميل" }, { status: 500 });
    }

    /* TODO: حفظ في Supabase جدول contact_messages لاحقاً */

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json({ success: false, error: "خطأ في الخادم" }, { status: 500 });
  }
}
