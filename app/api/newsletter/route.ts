import { NextResponse } from "next/server";
import { subscribeNewsletter } from "@/lib/db/newsletter";

/** POST /api/newsletter — اشتراك في النشرة البريدية (يحفظ في Supabase) */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "طلب غير صالح" }, { status: 400 });
  }

  const email = (body as { email?: string }).email;
  const source = (body as { source?: string }).source;

  if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ success: false, error: "بريد إلكتروني غير صحيح" }, { status: 400 });
  }

  const result = await subscribeNewsletter(email, typeof source === "string" ? source : "footer");
  return NextResponse.json({ success: result.ok });
}
