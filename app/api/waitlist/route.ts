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
import { hasPregnancyGate, isPregnancyWeekValid } from "@/lib/utils/pregnancy";
import { isBabyBorn, isBabyNameValid, normalizeBabyName } from "@/lib/utils/babyName";
import { isBookingCityValid, normalizeBookingCity } from "@/lib/utils/bookingCity";
import { israelTodayISO } from "@/lib/sessions/time";
import { tooManyRequests, withinRateLimit } from "@/lib/security/rateLimit";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * POST /api/waitlist — الانضمام لقائمة انتظار ورشة (عند اكتمال المقاعد).
 * body: { name, email, phone, city, serviceSlug, serviceName?, notes?, babyBirthDate?, babyName?, gestationalWeeks? }
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
    city?: string;
    serviceSlug?: string;
    serviceName?: string;
    notes?: string;
    babyBirthDate?: string;
    babyName?: string;
    gestationalWeeks?: number;
    pregnancyWeek?: number;
  };

  if (typeof b.name !== "string" || b.name.trim().length < 2)
    return NextResponse.json({ success: false, error: "الاسم مطلوب" }, { status: 400 });
  if (typeof b.email !== "string" || !isValidEmail(b.email.trim()))
    return NextResponse.json({ success: false, error: "بريد إلكتروني غير صحيح" }, { status: 400 });
  if (typeof b.phone !== "string" || b.phone.trim().length < 8)
    return NextResponse.json({ success: false, error: "رقم هاتف غير صحيح" }, { status: 400 });
  if (typeof b.serviceSlug !== "string" || !b.serviceSlug.trim())
    return NextResponse.json({ success: false, error: "الورشة غير محددة" }, { status: 400 });

  // البلدة — كالتسجيل: هبة تتّصل بالمنتظِرات وتحتاج أن تعرف من أين تأتي كلٌّ منهنّ
  const city = normalizeBookingCity(b.city);
  if (!isBookingCityValid(city))
    return NextResponse.json({ success: false, error: "اكتبي اسم بلدتك" }, { status: 400 });

  /*
   * الفئة العمرية — كالتسجيل تمامًا، والحكم على السيرفر لا في الواجهة.
   * لا موعد جلسة بعد، فيُقاس العمر **اليوم**: من طفلها خارج الفئة الآن
   * لن يصلح له المقعد حين يُفتح، فانتظاره انتظارٌ بلا جدوى.
   */
  const service = await getService(b.serviceSlug);
  let babyBirthDate: string | null = null;
  /** اسم الطفل — للمولود وحده، كالتسجيل تمامًا */
  let babyName: string | null = null;
  let gestationalWeeks: number | null = null;

  /**
   * أسبوع الحمل — للخدمات التي تسبق الولادة، **بلا شرط هنا**:
   * لا موعد بعد، والأسبوع يتقدّم، فكل أسبوع اليوم يصلح لموعدٍ يُفتح لاحقًا.
   */
  let pregnancyWeek: number | null = null;
  /** خدمة ما قبل الولادة — تقبل حاملًا (أسبوع حمل) وأمًّا ولدت (تاريخ ميلاد) */
  const prenatalService = hasPregnancyGate(service ?? undefined);
  if (prenatalService && b.pregnancyWeek != null) {
    if (!isPregnancyWeekValid(b.pregnancyWeek)) {
      return NextResponse.json({ success: false, error: "اكتبي أسبوع الحمل" }, { status: 400 });
    }
    pregnancyWeek = b.pregnancyWeek;
  }

  // يُسأل عن الطفل حين لا يكون معنا أسبوع حمل — أمٌّ ولدت فعلًا، أو ورشة بفئة عمرية
  if (service && pregnancyWeek === null && (prenatalService || hasAgeGate(service))) {
    if (typeof b.babyBirthDate !== "string" || !b.babyBirthDate) {
      return NextResponse.json({ success: false, error: "تاريخ ميلاد الطفل مطلوب لهذه الورشة" }, { status: 400 });
    }
    // خدمة ما قبل الولادة لا تسأل عن الخداج؛ وفي غيرها الأسبوع اختياري، وإن أتى وجب أن يكون صحيحًا
    if (!prenatalService && b.gestationalWeeks != null) {
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

    // الاسم للمولود فقط وإلزامي له — الموعد المتوقّع (حامل) بلا اسم بعد
    if (isBabyBorn(babyBirthDate, israelTodayISO())) {
      babyName = normalizeBabyName(b.babyName);
      if (!isBabyNameValid(babyName)) {
        return NextResponse.json({ success: false, error: "اكتبي اسم الطفل الكامل" }, { status: 400 });
      }
    }
  }

  const result = await joinWaitlist({
    name: b.name,
    email: b.email,
    phone: b.phone,
    city,
    serviceSlug: b.serviceSlug,
    serviceName: b.serviceName ?? null,
    notes: b.notes,
    babyBirthDate,
    babyName,
    gestationalWeeks,
    pregnancyWeek,
  });

  if (!result.ok) {
    console.error("[waitlist] فشل التسجيل:", result.error);
    return NextResponse.json({ success: false, error: "تعذّر التسجيل، حاولي مجددًا" }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
