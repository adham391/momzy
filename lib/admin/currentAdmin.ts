import { createClient } from "@/lib/supabase/server";

/** معرّف الأدمن الحالي من جلسة Supabase — لتسجيل من غيّر ماذا؛ null خارج الجلسة */
export async function currentAdminId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}
