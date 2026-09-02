import { NextResponse, after } from "next/server";
import { createOrder, getOrderById } from "@/lib/db/orders";
import { decrementStock } from "@/lib/products/stock";
import { orderNeedsShipping } from "@/lib/products/getProducts";
import { isWhatsAppConfigured } from "@/lib/whatsapp/client";
import { notifyHebaNewOrder } from "@/lib/whatsapp/notify";
import { isHypConfigured, createHypPaymentUrl } from "@/lib/hyp/client";
import { TO_EMAIL, isEmailConfigured, sendEmail } from "@/lib/resend/client";
import {
  orderCustomerEmailHtml,
  orderCustomerSubject,
  orderAdminEmailHtml,
  orderAdminSubject,
} from "@/lib/resend/emails/orderEmail";
import { sendDigitalDelivery } from "@/lib/notifications/digital";
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
      notes: typeof b.notes === "string" ? b.notes : "",
      utm: b.utm ?? null,
    });

    // إنقاص المخزون تلقائيًا في Sanity — بعد الرد (best-effort، لا يعطّل الـ checkout)
    const orderedItems = b.items.map((i) => ({
      slug: String(i.slug),
      quantity: Number(i.quantity) || 1,
    }));
    after(() => decrementStock(orderedItems));

    // إن ضُبطت مفاتيح HYP → أنشئ رابط الدفع لتحويل العميل إليه.
    // وإلا يبقى الطلب pending ويكمل الـ checkout لصفحة التأكيد (الوضع الحالي).
    let paymentUrl: string | null = null;
    if (isHypConfigured()) {
      paymentUrl = await createHypPaymentUrl({
        orderId: result.id,
        orderNumber: result.orderNumber,
        amount: result.total,
        customerName: c.name.trim(),
        email: c.email.trim(),
        phone: c.phone.trim(),
        // تعبئة العنوان مسبقًا في صفحة HYP — فلا تُدخله العميلة مجددًا
        street: c.address?.trim(),
        city: c.city?.trim(),
        zip: typeof c.postalCode === "string" ? c.postalCode.trim() : undefined,
      });
    }

    // إشعارات ما بعد الرد — إيميل (Resend) + واتساب لهبة (Meta) — best-effort، لا تعطّل الـ checkout
    if (isEmailConfigured() || isWhatsAppConfigured()) {
      after(async () => {
        const full = await getOrderById(result.id);
        if (!full) return;
        if (isEmailConfigured()) {
          await sendEmail({
            to: full.customer_email,
            subject: orderCustomerSubject(full),
            html: orderCustomerEmailHtml(full),
          });
          await sendEmail({
            to: TO_EMAIL,
            replyTo: full.customer_email,
            subject: orderAdminSubject(full),
            html: orderAdminEmailHtml(full),
          });

          // التسليم الرقمي — هنا فقط في التدفّق اليدوي؛ مع HYP يُرسَل من
          // /api/hyp/callback بعد نجاح الدفع (وإلا سُلّم الكتيب بلا دفع)
          if (!isHypConfigured()) {
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
            await sendDigitalDelivery(result.id, siteUrl);
          }
        }
        await notifyHebaNewOrder(full);
      });
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
