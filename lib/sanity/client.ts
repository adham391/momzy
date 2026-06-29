import { createClient } from "next-sanity";

/** العميل الأساسي — useCdn: false في Dev لتجنب مشاكل CDN */
export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "",
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2024-01-01",
  useCdn: process.env.NODE_ENV === "production",
});

/**
 * عميل الكتابة — يستخدم API Token
 * للـ migration script فقط (لا يُستخدم من الـ browser)
 */
export const sanityWriteClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "",
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

/**
 * sanityFetch — wrapper مع ISR revalidation + error handling
 * إذا فشل الاتصال بـ Sanity يرجع null بدل رمي خطأ
 */
export async function sanityFetch<T>(
  query: string,
  params: Record<string, unknown> = {},
  revalidate = 60
): Promise<T | null> {
  // في Dev: لا كاش — كل refresh يجلب البيانات الجديدة مباشرة من Sanity
  const ttl = process.env.NODE_ENV === "development" ? 0 : revalidate;
  try {
    return await sanityClient.fetch<T>(query, params, {
      next: { revalidate: ttl },
    });
  } catch (err) {
    console.warn("[Sanity] fetch failed, returning null:", err instanceof Error ? err.message : err);
    return null;
  }
}
