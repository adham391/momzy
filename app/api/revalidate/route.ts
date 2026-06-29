import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

/**
 * POST /api/revalidate
 * Sanity webhook يستدعيه عند نشر أي تغيير في Studio
 * يعيد بناء الصفحات المتأثرة فوراً بدون انتظار الـ ISR
 */
export async function POST(req: NextRequest) {
  // التحقق من الـ secret لحماية الـ endpoint
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json() as {
      _type?: string;
      slug?: { current?: string };
    };

    const type = body?._type;

    if (type === "product") {
      // صفحة المتجر + صفحة المنتج المحددة + الرئيسية
      revalidatePath("/shop", "page");
      revalidatePath("/shop/[slug]", "page");
      revalidatePath("/", "page");

      const slug = body?.slug?.current;
      if (slug) {
        revalidatePath(`/shop/${slug}`, "page");
      }
    }

    if (type === "service") {
      // صفحة الخدمات + صفحة الخدمة المحددة
      revalidatePath("/services", "page");
      revalidatePath("/services/[slug]", "page");

      const slug = body?.slug?.current;
      if (slug) {
        revalidatePath(`/services/${slug}`, "page");
      }
    }

    if (type === "siteSettings") {
      // إعدادات الموقع تؤثر على كل الصفحات (TopBar + Footer)
      revalidatePath("/", "layout");
    }

    return NextResponse.json({ revalidated: true, type });
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
}
