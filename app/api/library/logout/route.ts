import { NextResponse } from "next/server";
import { logoutCurrentSession, LIBRARY_SESSION_COOKIE } from "@/lib/library/auth";

/** POST /api/library/logout — إنهاء الجلسة ومسح الكوكي */
export async function POST() {
  try {
    await logoutCurrentSession();
  } catch (err) {
    // الخروج لا يفشل من وجهة نظر العميلة — نمسح الكوكي على أي حال
    console.error("[/api/library/logout]", err);
  }
  const res = NextResponse.json({ success: true });
  res.cookies.set(LIBRARY_SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
