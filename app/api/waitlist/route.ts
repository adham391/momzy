import { NextResponse } from "next/server";
import { joinWaitlist } from "@/lib/db/waitlist";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * POST /api/waitlist — الانضمام لقائمة انتظار ورشة (عند اكتمال المقاعد).
 * body: { name, email, phone, serviceSlug, serviceName?, notes? }
 * التسجيل مرتين لا يُنشئ صفًّا مكررًا (upsert).
 */
export async function POST(request: Request) {
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
  };

  if (typeof b.name !== "string" || b.name.trim().length < 2)
    return NextResponse.json({ success: false, error: "الاسم مطلوب" }, { status: 400 });
  if (typeof b.email !== "string" || !isValidEmail(b.email.trim()))
    return NextResponse.json({ success: false, error: "بريد إلكتروني غير صحيح" }, { status: 400 });
  if (typeof b.phone !== "string" || b.phone.trim().length < 8)
    return NextResponse.json({ success: false, error: "رقم هاتف غير صحيح" }, { status: 400 });
  if (typeof b.serviceSlug !== "string" || !b.serviceSlug.trim())
    return NextResponse.json({ success: false, error: "الورشة غير محددة" }, { status: 400 });

  const result = await joinWaitlist({
    name: b.name,
    email: b.email,
    phone: b.phone,
    serviceSlug: b.serviceSlug,
    serviceName: b.serviceName ?? null,
    notes: b.notes,
  });

  if (!result.ok) {
    console.error("[waitlist] فشل التسجيل:", result.error);
    return NextResponse.json({ success: false, error: "تعذّر التسجيل، حاولي مجددًا" }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
