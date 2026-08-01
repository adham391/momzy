"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * تسجيل الخروج — server action.
 * نستخدم action بدل route handler لأن NextResponse.redirect داخل route handler
 * يُسقِط كوكيز المسح التي يكتبها signOut عبر next/headers، فتبقى الجلسة نشطة.
 * الـ server action يُطبِّق تغييرات الكوكيز على الرد بشكل صحيح (كما loginAction).
 */
export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
