import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * عميل Supabase مرتبط بكوكيز الطلب داخل middleware.
 *
 * يعيد { supabase, response }:
 * - supabase: للتحقق من الجلسة عبر `auth.getUser()`
 * - response:  يحمل كوكيز الجلسة المُجدَّدة — **يجب** أن يُعاد من middleware
 *   (أو تُنسَخ كوكيزه إلى أي redirect) وإلا انتهت جلسة الأدمن مبكراً.
 *
 * ملاحظة: لا نستخدم `lib/supabase/server.ts` هنا لأنه يعتمد `cookies()`
 * من `next/headers` — لا يعمل داخل middleware. هذا النمط (getAll/setAll
 * على request/response) هو الرسمي من Supabase SSR.
 */
export function createMiddlewareClient(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // كوكيز الطلب (لبقية السلسلة) ثم كوكيز الرد (تصل للمتصفح)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  return { supabase, response };
}
