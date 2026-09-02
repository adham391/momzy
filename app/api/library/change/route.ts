import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentAccount, LIBRARY_SESSION_COOKIE } from "@/lib/library/auth";
import { setAccountPassword } from "@/lib/db/library";
import { hashPassword, verifyPassword, sha256, PASSWORD_MIN_LENGTH } from "@/lib/library/password";

/**
 * POST /api/library/change — تغيير كلمة المرور من داخل المكتبة.
 * يتطلب جلسة صالحة + الكلمة الحالية. الجلسات الأخرى تُبطل، وتبقى الحالية.
 */
export async function POST(req: NextRequest) {
  try {
    const account = await getCurrentAccount();
    if (!account || !account.password_hash) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as { currentPassword?: unknown; newPassword?: unknown };
    const current = typeof body.currentPassword === "string" ? body.currentPassword : "";
    const next = typeof body.newPassword === "string" ? body.newPassword : "";

    if (next.length < PASSWORD_MIN_LENGTH) {
      return NextResponse.json({ error: "password_short" }, { status: 400 });
    }
    if (!(await verifyPassword(current, account.password_hash))) {
      return NextResponse.json({ error: "wrong_current" }, { status: 400 });
    }

    // نبقي الجلسة الحالية حيّة ونبطل ما سواها
    const store = await cookies();
    const raw = store.get(LIBRARY_SESSION_COOKIE)?.value;
    await setAccountPassword(account.id, await hashPassword(next), raw ? sha256(raw) : undefined);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[/api/library/change]", err);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
