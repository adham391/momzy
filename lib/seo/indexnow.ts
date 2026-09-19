import { routing } from "@/lib/i18n/routing";
import { siteOrigin } from "@/lib/resend/emails/brand";
import { localizedUrl } from "./site";

/**
 * IndexNow — نخبر Bing (ومحركات Yandex وSeznam وNaver التي تتشارك البلاغات) بالصفحات
 * الجديدة أو المعدّلة لحظة تغيّرها، بدل انتظار زيارة الزاحف التالية.
 *
 * المفتاح عامّ بطبيعته: المحرّك يقرؤه من /indexnow-key.txt ليتأكد أن البلاغ من صاحب الموقع.
 */
export const INDEXNOW_KEY = "1939f34aa249a8541344255c2784716b";

/** مكان ملف المفتاح — في الجذر كي يغطي كل صفحات الموقع */
export const INDEXNOW_KEY_PATH = "/indexnow-key.txt";

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

/** الحد الأقصى لبلاغ واحد في بروتوكول IndexNow */
const MAX_URLS_PER_REQUEST = 10_000;

/** قسم كل نوع من محتوى Sanity في الموقع */
const SECTION_BY_TYPE: Record<string, string> = {
  product: "/shop",
  service: "/services",
  article: "/articles",
};

/** مسارات وثيقة تغيّرت: صفحتها وصفحة القسم التي تعرضها — وإلا لا شيء */
export function pathsForDocument(type: string | undefined, slug?: string): string[] {
  const section = type ? SECTION_BY_TYPE[type] : undefined;
  if (!section) return [];
  return slug ? [`${section}/${slug}`, section] : [section];
}

/** الروابط الكاملة لمسارات — بكل لغات الموقع */
export function urlsForPaths(paths: string[]): string[] {
  return paths.flatMap((path) => routing.locales.map((locale) => localizedUrl(path, locale)));
}

export interface IndexNowResult {
  submitted: number;
  /** 200 = قُبل · 202 = قُبل والمفتاح قيد التحقق */
  status?: number;
  skipped?: string;
}

/**
 * يبلّغ IndexNow بروابط تغيّرت. من النسخة المنشورة (production) فقط — لا من التطوير
 * ولا من معاينات Vercel، كي لا تُبلَّغ روابط لا يراها الزوار.
 */
export async function submitToIndexNow(urls: string[]): Promise<IndexNowResult> {
  if (process.env.VERCEL_ENV !== "production") return { submitted: 0, skipped: "not production" };
  const origin = siteOrigin();
  const urlList = [...new Set(urls)].filter((u) => u.startsWith(origin)).slice(0, MAX_URLS_PER_REQUEST);
  if (urlList.length === 0) return { submitted: 0, skipped: "no urls" };

  try {
    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: new URL(origin).host,
        key: INDEXNOW_KEY,
        keyLocation: `${origin}${INDEXNOW_KEY_PATH}`,
        urlList,
      }),
    });
    if (!res.ok) console.error("[indexnow] رفض البلاغ:", res.status, await res.text().catch(() => ""));
    return { submitted: urlList.length, status: res.status };
  } catch (err) {
    console.error("[indexnow] تعذّر البلاغ:", err instanceof Error ? err.message : err);
    return { submitted: 0, skipped: "request failed" };
  }
}
