import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { getOrderById } from "@/lib/db/orders";
import { getSiteSettings } from "@/lib/sanity/queries/siteSettings";
import { buildWaybills, canPrintWaybill } from "@/lib/orders/waybill";
import WaybillLabel from "@/components/admin/orders/WaybillLabel";
import PrintWaybillButton from "@/components/admin/orders/PrintWaybillButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "שטר מטען — لوحة Momzy" };

/**
 * ورقة A4 بهوامش صغيرة — الملصق في أعلاها، والسايدبار مخفي عند الطباعة.
 * والورقة بيضاء: خلفية الصفحة الكريمية كانت تُطبع مستطيلًا تحت الملصق
 * حين يكون خيار طباعة الخلفيات مفعّلًا.
 */
const PRINT_PAGE_CSS =
  "@page { size: A4 portrait; margin: 12mm; } @media print { html, body { background: #fff !important; } }";

/** اسم المرسِل على كل ملصق */
const SENDER_NAME = "Momzy";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ print?: string }>;
}

/**
 * שטר מטען للطلب — ملصق لكل وجهة (العميلة، وكل مستلِمة هدية).
 * تُفتح من صفحة الطلب أو قائمة الطلبات بـ ?print=1 فتظهر نافذة الطباعة مباشرة.
 */
export default async function OrderWaybillPage({ params, searchParams }: PageProps) {
  const [{ id }, { print }] = await Promise.all([params, searchParams]);
  const order = await getOrderById(id);
  if (!order) notFound();

  const waybills = buildWaybills(order);
  const printable = canPrintWaybill(order, waybills.length > 0);
  const { contact } = await getSiteSettings("ar");
  const sender = { name: SENDER_NAME, phone: contact.whatsappNumber?.trim() || null };

  return (
    <div>
      <style>{PRINT_PAGE_CSS}</style>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href={`/admin/orders/${order.id}`}
          className="inline-flex items-center gap-1.5 text-body-sm text-mid hover:text-dark"
        >
          <ArrowRight size={16} /> رجوع إلى الطلب
        </Link>
        {printable && <PrintWaybillButton autoPrint={print === "1"} />}
      </div>

      {printable ? (
        <div className="flex flex-wrap items-start gap-[6mm]">
          {waybills.map((waybill, i) => (
            <WaybillLabel
              key={`${order.id}-${i}`}
              waybill={waybill}
              orderNumber={order.order_number}
              createdAt={order.created_at}
              sender={sender}
              notes={order.notes}
              index={i + 1}
              total={waybills.length}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-[var(--rl)] border border-bord bg-white p-6 text-body-sm text-mid">
          {waybills.length === 0
            ? "لا شيء يُشحن في هذا الطلب — الكتيبات تصل بالبريد."
            : "שטר המטען يُطبع بعد الدفع — هذا الطلب لم يُدفع بعد أو أُلغي."}
        </p>
      )}
    </div>
  );
}
