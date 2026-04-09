import { createBrowserClient } from "@supabase/ssr";

/** إنشاء عميل Supabase للمتصفح */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
