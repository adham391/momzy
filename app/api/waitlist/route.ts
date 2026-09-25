import { NextResponse } from "next/server";
import { joinWaitlist } from "@/lib/db/waitlist";
import { getService } from "@/lib/services/getService";
import {
  MAX_PRETERM_WEEKS,
  MIN_GESTATIONAL_WEEKS,
  ageRangeText,
  babyAgeDetailedLabel,
  checkWaitlistAge,
  correctedBirthDate,
  hasAgeGate,
  hasCorrectedAge,
  isGestationalWeeksValid,
} from "@/lib/utils/age";
import { israelTodayISO } from "@/lib/sessions/time";
import { tooManyRequests, withinRateLimit } from "@/lib/security/rateLimit";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * POST /api/waitlist — الانضمام لقائمة انتظار ورشة (عند اكتمال المقاعد).
 * body: { name, email, phone, serviceSlug, serviceName?, notes?, babyBirthDate?, gestationalWeeks? }
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
    gestationalWeeks?: number;
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
  let gestationalWeeks: number | null = null;
  if (service && hasAgeGate(service)) {
    if (typeof b.babyBirthDate !== "string" || !b.babyBirthDate) {
      return NextResponse.json({ success: false, error: "تاريخ ميلاد الطفل مطلوب لهذه الورشة" }, { status: 400 });
    }
    // أسبوع الولادة اختياري (الولادة في موعدها)، وإن أتى وجب أن يكون صحيحًا
    if (b.gestationalWeeks != null) {
      if (!isGestationalWeeksValid(b.gestationalWeeks)) {
        return NextResponse.json(
          { success: false, error: `أسبوع الولادة يجب أن يكون بين ${MIN_GESTATIONAL_WEEKS} و${MAX_PRETERM_WEEKS}` },
          { status: 400 },
        );
      }
      gestationalWeeks = b.gestationalWeeks;
    }
    const check = checkWaitlistAge(b.babyBirthDate, israelTodayISO(), service, gestationalWeeks);
    if (!check.ok) {
      // رسالة الانتظار تقيس العمر اليوم — رسالة `checkBabyAge` تتحدّث عن «يوم الورشة» ولا ورشة بعد.
      // والخديج يُقاس بعمره المصحَّح، فالرسالة تسمّيه كذلك بلا ذكر الخداج.
      const measured = correctedBirthDate(b.babyBirthDate, gestationalWeeks);
      const age = check.months === null ? null : babyAgeDetailedLabel(measured, israelTodayISO());
      const who = hasCorrectedAge(gestationalWeeks) ? "العمر المصحّح لطفلكِ" : "عمر طفلكِ";
      return NextResponse.json(
        {
          success: false,
          error: age
            ? `${who} اليوم ${age}، وهذه الورشة مخصّصة لـ${ageRangeText(service)}.`
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
    gestationalWeeks,
  });

  if (!result.ok) {
    console.error("[waitlist] فشل التسجيل:", result.error);
    return NextResponse.json({ success: false, error: "تعذّر التسجيل، حاولي مجددًا" }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
