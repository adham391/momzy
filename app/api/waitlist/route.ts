import { NextResponse } from "next/server";
import { joinWaitlist } from "@/lib/db/waitlist";
import { getService } from "@/lib/services/getService";
import { ageRangeText, checkWaitlistAge, hasAgeGate, monthsLabel } from "@/lib/utils/age";
import { israelTodayISO } from "@/lib/sessions/time";
import { tooManyRequests, withinRateLimit } from "@/lib/security/rateLimit";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * POST /api/waitlist — الانضمام لقائمة انتظار ورشة (عند اكتمال المقاعد).
 * body: { name, email, phone, serviceSlug, serviceName?, notes? }
 * التسجيل مرتين لا يُنشئ صفًّا مكررًا (upsert).
 */
export async function POST(request: Request) {
  // حدّ المحاولات لكل IP — يمنع إغراق النموذج
  if (!(await withinRateLimit(request, "waitlist"))) return tooManyRequests();
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "طلب غير صالح" }, { status: 400 });
  }

  const b = body as {
    name?: string;
    email?: string;
    phone?: string;
    serviceSlug?: string;
    serviceName?: string;
    notes?: string;
    babyBirthDate?: string;
  };

  if (typeof b.name !== "string" || b.name.trim().length < 2)
    return NextResponse.json({ success: false, error: "الاسم مطلوب" }, { status: 400 });
  if (typeof b.email !== "string" || !isValidEmail(b.email.trim()))
    return NextResponse.json({ success: false, error: "بريد إلكتروني غير صحيح" }, { status: 400 });
  if (typeof b.phone !== "string" || b.phone.trim().length < 8)
    return NextResponse.json({ success: false, error: "رقم هاتف غير صحيح" }, { status: 400 });
  if (typeof b.serviceSlug !== "string" || !b.serviceSlug.trim())
    return NextResponse.json({ success: false, error: "الورشة غير محددة" }, { status: 400 });

  /*
   * الفئة العمرية — كالتسجيل تمامًا، والحكم على السيرفر لا في الواجهة.
   * لا موعد جلسة بعد، فيُقاس العمر **اليوم**: من طفلها خارج الفئة الآن
   * لن يصلح له المقعد حين يُفتح، فانتظاره انتظارٌ بلا جدوى.
   */
  const service = await getService(b.serviceSlug);
  let babyBirthDate: string | null = null;
  if (service && hasAgeGate(service)) {
    if (typeof b.babyBirthDate !== "string" || !b.babyBirthDate) {
      return NextResponse.json({ success: false, error: "تاريخ ميلاد الطفل مطلوب لهذه الورشة" }, { status: 400 });
    }
    const check = checkWaitlistAge(b.babyBirthDate, israelTodayISO(), service);
    if (!check.ok) {
      // رسالة الانتظار تقيس العمر اليوم — رسالة `checkBabyAge` تتحدّث عن «يوم الورشة» ولا ورشة بعد
      const age = check.months === null ? null : monthsLabel(check.months);
      return NextResponse.json(
        {
          success: false,
          error: age
            ? `عمر طفلكِ اليوم ${age}، وهذه الورشة مخصّصة لـ${ageRangeText(service)}.`
            : "تاريخ الميلاد غير صحيح",
        },
        { status: 400 },
      );
    }
    babyBirthDate = b.babyBirthDate;
  }

  const result = await joinWaitlist({
    name: b.name,
    email: b.email,
    phone: b.phone,
    serviceSlug: b.serviceSlug,
    serviceName: b.serviceName ?? null,
    notes: b.notes,
    babyBirthDate,
  });

  if (!result.ok) {
    console.error("[waitlist] فشل التسجيل:", result.error);
    return NextResponse.json({ success: false, error: "تعذّر التسجيل، حاولي مجددًا" }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
