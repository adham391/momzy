import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { getOrderById, getOrderStatusHistory } from "@/lib/db/orders";
import { getProductImageMap } from "@/lib/products/getProductImageMap";
import type { OrderStatus } from "@/lib/db/types";
import type { GiftOptions } from "@/lib/store/cart";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/StatusBadge";
import { formatILS, formatDateTime } from "@/lib/utils/format";
import {
  changeOrderStatusAction,
  updateTrackingAction,
  updateAdminNotesAction,
} from "../actions";

// الطلب يُقرأ لحظيًا من Supabase — لا تخزين مؤقت (وإلا 404 محفوظ لطلب أُنشئ حديثًا)
export const dynamic = "force-dynamic";

export const metadata = { title: "تفاصيل الطلب — لوحة Momzy" };

const FALLBACK_IMAGE = "/icons/momzy-logo.png";

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "pending",   label: "قيد الانتظار" },
  { value: "confirmed", label: "مؤكّد" },
  { value: "shipped",   label: "تم الشحن" },
  { value: "delivered", label: "تم التوصيل" },
  { value: "cancelled", label: "ملغى" },
];

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  const [history, imageMap] = await Promise.all([
    getOrderStatusHistory(id),
    getProductImageMap(),
  ]);

  return (
    <div>
      {/* رجوع */}
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1.5 text-body-sm text-mid hover:text-dark mb-4"
      >
        <ArrowRight size={16} /> كل الطلبات
      </Link>

      {/* رأس */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-heading text-h3 font-bold text-dark" style={{ direction: "ltr", textAlign: "right" }}>
            {order.order_number}
          </h1>
          <p className="text-light text-body-sm mt-0.5">{formatDateTime(order.created_at)}</p>
        </div>
        <div className="flex items-center gap-2">
          <OrderStatusBadge status={order.order_status} />
          <PaymentStatusBadge status={order.payment_status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
        {/* ── العمود الرئيسي ── */}
        <div className="flex flex-col gap-5">
          {/* بيانات العميل */}
          <Card title="بيانات العميل">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              <Field label="الاسم" value={order.customer_name} />
              <Field label="الهاتف" value={order.customer_phone} ltr />
              <Field label="الإيميل" value={order.customer_email} ltr />
              <Field label="البلدة" value={order.customer_city} />
              {order.customer_postal_code && (
                <Field label="الرمز البريدي" value={order.customer_postal_code} ltr />
              )}
              <div className="sm:col-span-2">
                <Field label="العنوان" value={order.customer_address} />
              </div>
              {order.customer_building && (
                <div className="sm:col-span-2">
                  <Field label="طابق / شقة / مدخل" value={order.customer_building} />
                </div>
              )}
              {order.notes && (
                <div className="sm:col-span-2">
                  <Field label="ملاحظات العميل" value={order.notes} />
                </div>
              )}
            </dl>
          </Card>

          {/* العناصر */}
          <Card title={`العناصر (${order.items.length})`}>
            <div className="flex flex-col divide-y divide-bord">
              {order.items.map((it) => (
                <div key={it.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-14 h-14 rounded-[10px] overflow-hidden shrink-0"
                      style={{ background: "linear-gradient(140deg, var(--rosepale), var(--tealpale))" }}
                    >
                      <Image
                        src={imageMap.get(it.product_slug) ?? FALLBACK_IMAGE}
                        alt={it.product_name}
                        width={56}
                        height={56}
                        className="w-14 h-14 object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-dark text-body-sm truncate">{it.product_name}</div>
                      <div className="text-micro text-light">
                        {it.quantity} × {formatILS(it.unit_price)}
                        {it.gift ? " · 🎁 هدية" : ""}
                      </div>
                    </div>
                    <div className="font-label font-extrabold text-teal shrink-0">
                      {formatILS(it.total_price)}
                    </div>
                  </div>

                  {/* تفاصيل توصيل الهدية — عنوان المستلِمة (يختلف عن عنوان العميل) */}
                  {it.gift && <GiftDeliveryBlock gift={it.gift} />}
                </div>
              ))}
            </div>

            {/* الإجماليات */}
            <div className="border-t border-bord mt-3 pt-3 flex flex-col gap-1.5 text-body-sm">
              <Row label="المجموع" value={formatILS(order.subtotal)} />
              {order.discount_amount > 0 && (
                <Row label="الخصم" value={`− ${formatILS(order.discount_amount)}`} teal />
              )}
              <Row label="الشحن" value={order.shipping_cost === 0 ? "مجاني" : formatILS(order.shipping_cost)} />
              <div className="flex justify-between items-center pt-2 mt-1 border-t border-bord">
                <span className="font-heading font-bold text-dark">الإجمالي</span>
                <span className="font-label font-extrabold text-teal text-[18px]">
                  {formatILS(order.total_amount)}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* ── العمود الجانبي (إجراءات) ── */}
        <div className="flex flex-col gap-5">
          {/* تغيير الحالة */}
          <Card title="تغيير الحالة">
            <form action={changeOrderStatusAction} className="flex flex-col gap-3">
              <input type="hidden" name="orderId" value={order.id} />
              <select
                key={order.order_status}
                name="status"
                defaultValue={order.order_status}
                className="w-full px-3 py-2.5 rounded-xl border border-bord bg-offwh text-body-sm text-dark focus:outline-none focus:border-rose"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <input
                name="note"
                placeholder="ملاحظة (اختياري)"
                className="w-full px-3 py-2.5 rounded-xl border border-bord bg-offwh text-body-sm text-dark placeholder:text-light focus:outline-none focus:border-rose"
              />
              <SubmitButton>حفظ الحالة</SubmitButton>
            </form>
          </Card>

          {/* الشحن */}
          <Card title="الشحن والتتبّع">
            <form action={updateTrackingAction} className="flex flex-col gap-3">
              <input type="hidden" name="orderId" value={order.id} />
              <input
                name="company"
                defaultValue={order.shipping_company ?? ""}
                placeholder="شركة الشحن"
                className="w-full px-3 py-2.5 rounded-xl border border-bord bg-offwh text-body-sm text-dark placeholder:text-light focus:outline-none focus:border-rose"
              />
              <input
                name="tracking"
                defaultValue={order.tracking_number ?? ""}
                placeholder="رقم التتبّع"
                dir="ltr"
                className="w-full px-3 py-2.5 rounded-xl border border-bord bg-offwh text-body-sm text-dark text-left placeholder:text-light focus:outline-none focus:border-rose"
              />
              <SubmitButton>حفظ التتبّع</SubmitButton>
            </form>
          </Card>

          {/* ملاحظات داخلية */}
          <Card title="ملاحظات داخلية">
            <form action={updateAdminNotesAction} className="flex flex-col gap-3">
              <input type="hidden" name="orderId" value={order.id} />
              <textarea
                name="adminNotes"
                defaultValue={order.admin_notes ?? ""}
                rows={3}
                placeholder="ملاحظات لا يراها العميل"
                className="w-full px-3 py-2.5 rounded-xl border border-bord bg-offwh text-body-sm text-dark placeholder:text-light focus:outline-none focus:border-rose resize-none"
              />
              <SubmitButton>حفظ الملاحظات</SubmitButton>
            </form>
          </Card>

          {/* سجل الحالة */}
          {history.length > 0 && (
            <Card title="سجل الحالة">
              <ul className="flex flex-col gap-3">
                {history.map((h) => (
                  <li key={h.id} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose mt-2 shrink-0" />
                    <div className="min-w-0">
                      <OrderStatusBadge status={h.new_status as OrderStatus} />
                      {h.note && <p className="text-micro text-mid mt-1">{h.note}</p>}
                      <p className="text-micro text-light mt-0.5">{formatDateTime(h.created_at)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── مكوّنات مساعدة ── */

function GiftDeliveryBlock({ gift }: { gift: GiftOptions }) {
  const address = [gift.recipientAddress, gift.recipientCity].filter(Boolean).join("، ");
  return (
    <div className="mt-3 p-3 rounded-[10px]" style={{ background: "var(--rosepale)", border: "1px solid var(--roselt)" }}>
      <p className="font-label font-bold text-micro mb-2" style={{ color: "var(--rose)", letterSpacing: "1px" }}>
        🎁 توصيل الهدية — للمستلِمة
      </p>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
        {gift.recipientName && <GiftField label="المستلِمة" value={gift.recipientName} />}
        {gift.recipientPhone && <GiftField label="هاتفها" value={gift.recipientPhone} ltr />}
        {gift.recipientEmail && (
          <div className="sm:col-span-2">
            <GiftField label="📧 بريد المستلِمة (لإرسال الكتيب)" value={gift.recipientEmail} ltr />
          </div>
        )}
        {address && (
          <div className="sm:col-span-2">
            <GiftField label="عنوان التوصيل" value={address} />
          </div>
        )}
      </dl>
      {gift.message && (
        <p className="mt-2 text-micro italic text-mid bg-white rounded-md p-2 border border-dashed border-bord">
          &ldquo;{gift.message}&rdquo;
        </p>
      )}
    </div>
  );
}

function GiftField({ label, value, ltr }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-micro text-light font-label">{label}</dt>
      <dd className="text-body-sm text-dark" style={ltr ? { direction: "ltr", textAlign: "right" } : undefined}>
        {value}
      </dd>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-[var(--rl)] border border-bord p-5">
      <h2 className="font-heading font-bold text-dark text-body mb-4">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, value, ltr }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-micro text-light font-label">{label}</dt>
      <dd className="text-body-sm text-dark" style={ltr ? { direction: "ltr", textAlign: "right" } : undefined}>
        {value}
      </dd>
    </div>
  );
}

function Row({ label, value, teal }: { label: string; value: string; teal?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className={teal ? "text-teal" : "text-mid"}>{label}</span>
      <span className={teal ? "text-teal font-bold" : "text-dark font-semibold"}>{value}</span>
    </div>
  );
}

function SubmitButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="w-full py-2.5 rounded-xl bg-dark text-white text-body-sm font-bold hover:brightness-125 transition"
    >
      {children}
    </button>
  );
}
