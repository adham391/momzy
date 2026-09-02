import { NextRequest, NextResponse } from "next/server";
import { consumeLibraryToken, setAccountPassword, createSession } from "@/lib/db/library";
import { hashPassword, PASSWORD_MIN_LENGTH } from "@/lib/library/password";
import { LIBRARY_SESSION_COOKIE, sessionCookieOptions } from "@/lib/library/auth";

/**
 * POST /api/library/password — تثبيت كلمة المرور من رابط الإنشاء/الاستعادة.
 * التوكن يُستهلك ذرّيًا (لمرة واحدة)، تُبطل كل الجلسات القديمة،
 * وتُفتح جلسة جديدة فورًا فلا تُطالَب العميلة بالدخول مرة ثانية.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { token?: unknown; password?: unknown };
    const token = typeof body.token === "string" ? body.token : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!token) {
      return NextResponse.json({ error: "invalid_token" }, { status: 400 });
    }
    if (password.length < PASSWORD_MIN_LENGTH) {
      return NextResponse.json({ error: "password_short" }, { status: 400 });
    }

    const consumed = await consumeLibraryToken(token);
    if (!consumed) {
      return NextResponse.json({ error: "invalid_token" }, { status: 400 });
    }

    await setAccountPassword(consumed.accountId, await hashPassword(password));
    const sessionToken = await createSession(consumed.accountId);

    const res = NextResponse.json({ success: true });
    res.cookies.set(LIBRARY_SESSION_COOKIE, sessionToken, sessionCookieOptions());
    return res;
  } catch (err) {
    console.error("[/api/library/password]", err);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
