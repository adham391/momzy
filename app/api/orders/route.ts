import { NextResponse, after } from "next/server";
import { createOrder } from "@/lib/db/orders";
import { decrementStock } from "@/lib/products/stock";
import { orderNeedsShipping } from "@/lib/products/getProducts";
import { isWhatsAppConfigured } from "@/lib/whatsapp/client";
import { isHypConfigured, createHypPaymentUrl } from "@/lib/hyp/client";
import { isEmailConfigured } from "@/lib/resend/client";
import { isDomesticRequest, DOMESTIC_ONLY_CODE } from "@/lib/geo/country";
import { currencyFor } from "@/lib/currency";
import { sendOrderConfirmation } from "@/lib/notifications/order";
import { sweepAbandonedOrders } from "@/lib/notifications/recovery";
import { sendDigitalDelivery } from "@/lib/notifications/digital";
import { subscribeConsentingBuyer } from "@/lib/newsletter/checkoutConsent";
import type { CreateOrderInput } from "@/lib/db/types";
import type { GiftOptions } from "@/lib/store/cart";

/** تحقق بسيط من صيغة الإيميل */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * POST /api/orders — إنشاء طلب في Supabase.
 * (خارج middleware — /api مستثنى — فهو endpoint عام للـ checkout المجهول.)
 * الأسعار تُحسب على السيرفر؛ العميل يرسل slug + الكمية فقط.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "صيغة الطلب غير صالحة" }, { status: 400 });
  }

  const b = body as Partial<CreateOrderInput>;
  const c = b.customer;

  // تحقق من بيانات العميل
  if (!c || typeof c.name !== "string" || c.name.trim().length < 2) {
    return NextResponse.json({ error: "الاسم مطلوب" }, { status: 400 });
  }
  if (typeof c.email !== "string" || !isValidEmail(c.email.trim())) {
    return NextResponse.json({ error: "بريد إلكتروني غير صحيح" }, { status: 400 });
  }
  if (typeof c.phone !== "string" || c.phone.trim().length < 9) {
    return NextResponse.json({ error: "رقم هاتف غير صحيح" }, { status: 400 });
  }
  if (!Array.isArray(b.items) || b.items.length === 0) {
    return NextResponse.json({ error: "السلة فارغة" }, { status: 400 });
  }
  // العنوان مطلوب للطلبات الفيزيائية فقط — الطلب الرقمي البحت يصل على البريد.
  // النوع يُقرأ من Sanity لا من العميل، فلا يُتخطّى العنوان بادّعاء كاذب.
  const needsShipping = await orderNeedsShipping(b.items.map((i) => String(i.slug)));
  // البلد من ترويسة Vercel لا من العميلة: الصندوق يُشحن داخل البلاد فقط ويُدفع من داخلها،
  // ومن خارجها يُخصم الكتيب بالدولار. الواجهة تعرف الرمز فتعرض التنبيه بلغتها بدل خطأ عام
  const domestic = isDomesticRequest(request.headers);
  if (needsShipping && !domestic) {
    return NextResponse.json(
      { error: "المنتجات الفيزيائية تُطلب من داخل البلاد فقط", code: DOMESTIC_ONLY_CODE },
      { status: 403 }
    );
  }
  if (
    needsShipping &&
    (typeof c.city !== "string" || !c.city.trim() ||
     typeof c.address !== "string" || c.address.trim().length < 5)
  ) {
    return NextResponse.json({ error: "العنوان مطلوب" }, { status: 400 });
  }

  try {
    const result = await createOrder({
      customer: {
        name: c.name.trim(),
        email: c.email.trim(),
        phone: c.phone.trim(),
        city: typeof c.city === "string" ? c.city.trim() : "",
        address: typeof c.address === "string" ? c.address.trim() : "",
        building: typeof c.building === "string" ? c.building.trim() : undefined,
        postalCode: typeof c.postalCode === "string" ? c.postalCode.trim() : undefined,
      },
      items: b.items.map((i) => ({
        slug: String(i.slug),
        quantity: Number(i.quantity) || 1,
        gift: (i.gift as GiftOptions | null | undefined) ?? null,
      })),
      couponCode: b.couponCode ?? null,
      hasMarketingConsent: Boolean(b.hasMarketingConsent),
      // لغة الصفحة — تُحفظ لتحديد لغة كل إيميل يصل العميلة لاحقًا
      locale: typeof (b as { locale?: unknown }).locale === "string" ? (b as { locale: string }).locale : undefined,
      notes: typeof b.notes === "string" ? b.notes : "",
      utm: b.utm ?? null,
      // عملة الخصم — الدولار من خارج البلاد
      currency: currencyFor(domestic),
    });

    // إنقاص المخزون تلقائيًا في Sanity — بعد الرد (best-effort، لا يعطّل الـ checkout)
    const orderedItems = b.items.map((i) => ({
      slug: String(i.slug),
      quantity: Number(i.quantity) || 1,
    }));
    after(() => decrementStock(orderedItems));

    // عليه مبلغ و HYP مضبوط → رابط الدفع لتحويل العميلة إليه.
    // مجاني، أو HYP غير مضبوط (تدفّق يدوي) → لا دفع إلكتروني، ويتأكّد الطلب الآن.
    const needsOnlinePayment = result.total > 0 && isHypConfigured();
    let paymentUrl: string | null = null;
    if (needsOnlinePayment) {
      paymentUrl = await createHypPaymentUrl({
        orderId: result.id,
        orderNumber: result.orderNumber,
        amount: result.chargedAmount,
        currency: result.currency,
        customerName: c.name.trim(),
        email: c.email.trim(),
        phone: c.phone.trim(),
        // تعبئة العنوان مسبقًا في صفحة HYP — فلا تُدخله العميلة مجددًا
        street: c.address?.trim(),
        city: c.city?.trim(),
        locale: typeof (b as { locale?: unknown }).locale === "string" ? (b as { locale: string }).locale : undefined,
        zip: typeof c.postalCode === "string" ? c.postalCode.trim() : undefined,
      });
    }

    // التأكيد الآن فقط حين لا دفع إلكتروني. فشلُ إنشاء رابط الدفع لا يؤكّد طلبًا غير مدفوع —
    // كان يُعامَل كغياب HYP فيصل التأكيد ورابط الكتيب بلا دفع. يبقى الطلب pending، وتعيد
    // العميلة المحاولة من صفحة الطلب، ويصلها تذكير الاسترداد كأي طلب متروك.
    const confirmNow = !needsOnlinePayment;

    // إشعارات ما بعد الرد — best-effort، لا تعطّل الـ checkout.
    // مع الدفع الإلكتروني لا يُرسَل شيء هنا: التأكيد وإشعار هبة والتسليم من
    // /api/hyp/callback بعد نجاح الدفع، وتذكير الاسترداد يتكفّل به المسح أدناه بعد مهلة.
    if (isEmailConfigured() || isWhatsAppConfigured()) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
      after(async () => {
        if (confirmNow) {
          await sendOrderConfirmation(result.id);
          await sendDigitalDelivery(result.id, siteUrl);
        }
        // مسح عابر: كل طلب جديد يفحص الطلبات المتروكة الناضجة
        await sweepAbandonedOrders(siteUrl);
      });
    }

    // النشرة لمن وافقت — مع التأكيد نفسه (مع الدفع: من /api/hyp/callback بعد نجاحه).
    // مستقلّ عن ضبط الإيميل/واتساب أعلاه.
    if (confirmNow) {
      after(() => subscribeConsentingBuyer(result.id));
    }

    return NextResponse.json({ ...result, paymentUrl }, { status: 201 });
  } catch (err) {
    console.error("[/api/orders] فشل إنشاء الطلب:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "فشل إنشاء الطلب" },
      { status: 500 }
    );
  }
}
