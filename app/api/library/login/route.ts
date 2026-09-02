import { NextRequest, NextResponse } from "next/server";
import { loginWithPassword, LIBRARY_SESSION_COOKIE, sessionCookieOptions } from "@/lib/library/auth";

/**
 * POST /api/library/login — دخول المكتبة بالبريد وكلمة المرور.
 * كل إخفاق يعيد invalid_credentials — لا نميّز «بريد مجهول» عن «مقفول»
 * عن «كلمة خاطئة»، فلا يتحوّل الرد إلى أداة لكشف من اشترى من الموقع.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { email?: unknown; password?: unknown };
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length === 0) {
      return NextResponse.json({ error: "invalid_credentials" }, { status: 400 });
    }

    const result = await loginWithPassword(email, password);
    if (!result.ok) {
      return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
    }

    const res = NextResponse.json({ success: true });
    res.cookies.set(LIBRARY_SESSION_COOKIE, result.sessionToken, sessionCookieOptions());
    return res;
  } catch (err) {
    console.error("[/api/library/login]", err);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
