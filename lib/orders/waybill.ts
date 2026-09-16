import type { OrderWithItems } from "@/lib/db/types";
import type { GiftOptions } from "@/lib/store/cart";
import { isSettled } from "@/lib/stats/settlement";

/**
 * שטר מטען — بيانات الإرسالية لكل وجهة في الطلب.
 *
 * الطلب الواحد قد يذهب إلى أكثر من عنوان: كل منتج هدية فيزيائية يُشحن إلى
 * مستلِمته، والباقي إلى العميلة نفسها. فلكل وجهة ملصق مستقل بمحتواه.
 * الكتيبات الرقمية تصل بالبريد، فلا تظهر في أي ملصق.
 */

/** وجهة الإرسالية */
export interface WaybillRecipient {
  name: string;
  phone: string;
  city: string;
  address: string;
  /** طابق / شقة / مدخل */
  building: string | null;
  postalCode: string | null;
}

/** سطر في محتوى الطرد — بلا أسعار */
export interface WaybillItem {
  name: string;
  quantity: number;
}

/** ملصق إرسالية واحد */
export interface Waybill {
  recipient: WaybillRecipient;
  items: WaybillItem[];
}

/** وجهة الهدية الفيزيائية — null إن لم يكن للهدية عنوان توصيل */
function giftRecipient(gift: GiftOptions | null, order: OrderWithItems): WaybillRecipient | null {
  if (!gift?.recipientAddress) return null;
  return {
    name: gift.recipientName || order.customer_name,
    phone: gift.recipientPhone || order.customer_phone,
    city: gift.recipientCity || "",
    address: gift.recipientAddress,
    building: null,
    postalCode: null,
  };
}

/** وجهة العميلة نفسها */
function customerRecipient(order: OrderWithItems): WaybillRecipient {
  return {
    name: order.customer_name,
    phone: order.customer_phone,
    city: order.customer_city,
    address: order.customer_address,
    building: order.customer_building,
    postalCode: order.customer_postal_code,
  };
}

/** ملصقات الطلب — واحد لكل وجهة، بترتيب ظهورها في الطلب */
export function buildWaybills(order: OrderWithItems): Waybill[] {
  const byDestination = new Map<string, Waybill>();
  for (const item of order.items) {
    if (item.product_type !== "physical") continue;
    const recipient = giftRecipient(item.gift, order) ?? customerRecipient(order);
    const key = JSON.stringify(recipient);
    const waybill = byDestination.get(key) ?? { recipient, items: [] };
    const sameProduct = waybill.items.find((line) => line.name === item.product_name);
    if (sameProduct) sameProduct.quantity += item.quantity;
    else waybill.items.push({ name: item.product_name, quantity: item.quantity });
    byDestination.set(key, waybill);
  }
  return [...byDestination.values()];
}

/**
 * هل يُطبع للطلب שטר מטען؟ — فيه ما يُشحن، ومدفوع (أو مجاني) وغير ملغى:
 * ملصق لطلب لم يُدفع يدعو إلى شحن بضاعة لم يُدفع ثمنها.
 */
export function canPrintWaybill(
  order: Pick<OrderWithItems, "payment_status" | "total_amount" | "order_status">,
  hasPhysicalItems: boolean
): boolean {
  return (
    hasPhysicalItems &&
    isSettled(order.payment_status, order.total_amount, order.order_status === "cancelled")
  );
}
