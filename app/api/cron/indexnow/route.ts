import { NextResponse } from "next/server";
import sitemap from "@/app/sitemap";
import { sanityWriteClient } from "@/lib/sanity/client";
import { pathsForDocument, submitToIndexNow, urlsForPaths } from "@/lib/seo/indexnow";

export const dynamic = "force-dynamic";

/** نافذة البحث عن التغييرات — أطول قليلًا من يوم كي لا يسقط تغيير بين تشغيلين */
const LOOKBACK_HOURS = 26;

/**
 * GET /api/cron/indexnow — بلاغ IndexNow اليومي (Vercel Cron في vercel.json).
 * يجد ما نُشر أو عُدّل في Sanity خلال اليوم الأخير (منتجات، خدمات، مقالات منشورة) ويبلّغ
 * بروابطه — شبكة أمان حتى لو لم يُضبط webhook النشر الفوري. ‎?all=1 يبلّغ بكل خريطة الموقع.
 * محمي بـ CRON_SECRET كتذكير اليوم السابق.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (new URL(request.url).searchParams.get("all") === "1") {
    const urls = (await sitemap()).map((entry) => entry.url);
    return NextResponse.json({ scope: "sitemap", ...(await submitToIndexNow(urls)) });
  }

  const since = new Date(Date.now() - LOOKBACK_HOURS * 60 * 60 * 1000).toISOString();
  const changed = await sanityWriteClient.fetch<{ _type: string; slug?: string }[]>(
    `*[_type in ["product", "service", "article"] && !(_id in path("drafts.**")) && _updatedAt > $since
      && (_type != "article" || isPublished == true)]{ _type, "slug": slug.current }`,
    { since }
  );
  const urls = urlsForPaths(changed.flatMap((doc) => pathsForDocument(doc._type, doc.slug)));
  return NextResponse.json({ scope: "changed", documents: changed.length, ...(await submitToIndexNow(urls)) });
}
