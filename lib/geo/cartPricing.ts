import { orderUsdRate, type PriceContext } from "@/lib/currency";
import type { VisitorGeo } from "./useGeo";

/** سعر كل منتج بالدولار (slug ← سعر ثابت من Studio، أو null) — تمرّره صفحة الدفع */
export type UsdPrices = Record<string, number | null>;

/** ما يلزم من عنصر السلة لحساب سعر صرف الطلب */
interface CartLine {
  slug: string;
  price: number;
  quantity: number;
}

/**
 * سياق عرض أسعار السلة للزائرة: عملتها، وسعر صرف الطلب من أسعار الدولار الثابتة —
 * الحساب نفسه الذي يُخصم به في `createOrder`، فما تراه في الملخّص هو ما يُخصم.
 * null قبل معرفة موقعها (تُعرض بالشيكل حتى ذلك).
 */
export function cartPriceContext(geo: VisitorGeo | null, items: CartLine[], usdPrices: UsdPrices): PriceContext | null {
  if (!geo) return null;
  const usdRate = orderUsdRate(items.map((i) => ({ ils: i.price, usd: usdPrices[i.slug], quantity: i.quantity })));
  return { currency: geo.currency, usdRate };
}
