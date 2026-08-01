import { sanityWriteClient } from "@/lib/sanity/client";

/**
 * إدارة المخزون التلقائي في Sanity مع كل طلب.
 *
 * المخزون يُخزَّن في Sanity (`stockQuantity` + `inStock`) على وثيقة المنتج.
 * - عند كل طلب: نُنقص `stockQuantity` ذرّيًا عبر `dec()` (آمن مع الطلبات المتزامنة).
 * - عند نفاد المخزون (≤ 0): نُثبّته على 0 ونُخفي المنتج (`inStock=false`) تلقائيًا.
 * - عند إلغاء الطلب: نُعيد الكمية عبر `inc()` ونُعيد إظهار المنتج.
 *
 * المنتجات بلا `stockQuantity` (رقمية/غير محدودة) تُتخطّى.
 * كل العمليات best-effort: أي فشل يُسجَّل ولا يُفشل الطلب (الطلب مُثبَّت أصلًا).
 */

/** عنصر لتعديل مخزونه — slug + الكمية المطلوبة */
export interface StockChange {
  slug: string;
  quantity: number;
}

/** شكل وثيقة المخزون المقروءة من Sanity */
interface StockDoc {
  _id: string;
  stockQuantity: number | null;
}

/** يجمع الكميات حسب slug ويتجاهل غير الصالح (≤ 0) */
function aggregateBySlug(items: StockChange[]): Map<string, number> {
  const totals = new Map<string, number>();
  for (const it of items) {
    const qty = Math.floor(it.quantity);
    if (!it.slug || !(qty > 0)) continue;
    totals.set(it.slug, (totals.get(it.slug) ?? 0) + qty);
  }
  return totals;
}

/** يقرأ _id + المخزون الحالي لمنتج بالـ slug (write client — بيانات طازجة بلا كاش) */
async function fetchStockDoc(slug: string): Promise<StockDoc | null> {
  return sanityWriteClient.fetch<StockDoc | null>(
    `*[_type == "product" && slug.current == $slug][0]{ _id, stockQuantity }`,
    { slug }
  );
}

/**
 * يُنقص المخزون في Sanity لكل عنصر مُتتبَّع. يُستدعى مع إنشاء كل طلب.
 * ذرّي عبر `dec()` — الطلبات المتزامنة لا تتسبب في تجاوز البيع.
 */
export async function decrementStock(items: StockChange[]): Promise<void> {
  for (const [slug, qty] of aggregateBySlug(items)) {
    try {
      const doc = await fetchStockDoc(slug);
      // غير موجود أو مخزون غير محدود (لا stockQuantity) → تخطَّ
      if (!doc?._id || typeof doc.stockQuantity !== "number") continue;

      const updated = (await sanityWriteClient
        .patch(doc._id)
        .dec({ stockQuantity: qty })
        .commit()) as { stockQuantity?: number };

      const newQty = typeof updated.stockQuantity === "number" ? updated.stockQuantity : 0;

      // نفاد المخزون → تثبيت على 0 (منع السالب) + إخفاء المنتج تلقائيًا
      if (newQty <= 0) {
        await sanityWriteClient.patch(doc._id).set({ stockQuantity: 0, inStock: false }).commit();
      }
    } catch (err) {
      console.error(`[stock] تعذّر إنقاص مخزون ${slug}:`, err instanceof Error ? err.message : err);
    }
  }
}

/**
 * يُعيد المخزون عند إلغاء الطلب — عكس decrementStock عبر `inc()`.
 * يُعيد إظهار المنتج (`inStock=true`) إن أصبح المخزون موجبًا بعد الإرجاع.
 */
export async function restoreStock(items: StockChange[]): Promise<void> {
  for (const [slug, qty] of aggregateBySlug(items)) {
    try {
      const doc = await fetchStockDoc(slug);
      if (!doc?._id || typeof doc.stockQuantity !== "number") continue;

      const updated = (await sanityWriteClient
        .patch(doc._id)
        .inc({ stockQuantity: qty })
        .commit()) as { stockQuantity?: number };

      const newQty = typeof updated.stockQuantity === "number" ? updated.stockQuantity : 0;

      // عاد للتوفّر → إعادة إظهاره
      if (newQty > 0) {
        await sanityWriteClient.patch(doc._id).set({ inStock: true }).commit();
      }
    } catch (err) {
      console.error(`[stock] تعذّر إرجاع مخزون ${slug}:`, err instanceof Error ? err.message : err);
    }
  }
}
