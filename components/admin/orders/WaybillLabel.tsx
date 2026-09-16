import Image from "next/image";
import { toHypText } from "@/lib/hyp/text";
import { formatDate } from "@/lib/utils/format";
import type { Waybill } from "@/lib/orders/waybill";

const LOGO_SRC = "/icons/momzy-logo.png";
/** نطاق الحروف العربية — لتقرير إضافة سطر النقحرة العبرية */
const ARABIC_LETTERS = /[؀-ۿ]/;

/** المرسِل المطبوع على الملصق */
export interface WaybillSender {
  name: string;
  phone: string | null;
}

/**
 * نقحرة عبرية تحت النص العربي — لسائق شركة الشحن الذي يقرأ العبرية.
 * الدالة نفسها التي تجهّز الأسماء لصفحة دفع HYP. null حين لا عربية في النص.
 */
function hebrewHint(value: string): string | null {
  if (!ARABIC_LETTERS.test(value)) return null;
  const hint = toHypText(value);
  return hint && hint !== value ? hint : null;
}

/**
 * ملصق שטר מטען صغير (عرض 100 مم) — يُطبع في أعلى ورقة A4 ويُقصّ على الخطّ المتقطّع.
 * العناوين بالعبرية لشركة الشحن، والبيانات كما كتبتها العميلة — والاسم والبلدة والعنوان
 * معها نقحرة عبرية.
 * بلا أسعار وبلا توقيع — تفاصيل الإرسالية فقط.
 */
export default function WaybillLabel({
  waybill,
  orderNumber,
  createdAt,
  sender,
  notes,
  index,
  total,
}: {
  waybill: Waybill;
  orderNumber: string;
  createdAt: string;
  sender: WaybillSender;
  notes: string | null;
  /** رقم الملصق حين يذهب الطلب إلى أكثر من وجهة */
  index: number;
  total: number;
}) {
  const { recipient } = waybill;

  return (
    <article className="w-[100mm] rounded-[3mm] border border-dashed border-dark bg-white p-[4mm] text-dark break-inside-avoid">
      <header className="flex items-center justify-between gap-[2mm] border-b border-dark pb-[2mm]">
        <Image src={LOGO_SRC} alt="Momzy" width={96} height={40} className="h-[9mm] w-auto" unoptimized />
        <div className="text-left">
          <div className="text-[13pt] font-bold leading-none">שטר מטען</div>
          <div className="mt-[1mm] text-[8pt]">{formatDate(createdAt)}</div>
        </div>
      </header>

      <div className="flex items-baseline justify-between border-b border-dark py-[2mm]">
        <span className="text-[8pt]">מספר הזמנה</span>
        <span dir="ltr" className="text-[14pt] font-extrabold">
          {orderNumber}
        </span>
      </div>

      <section className="flex flex-col gap-[1mm] border-b border-dark py-[2mm]">
        <div className="text-[8pt] font-bold">נמען</div>
        <Line label="שם" value={recipient.name} strong transliterate />
        <Line label="טלפון" value={recipient.phone} ltr strong />
        <Line label="עיר" value={recipient.city} strong transliterate />
        <Line label="כתובת" value={recipient.address} transliterate />
        {recipient.building && <Line label="קומה / דירה" value={recipient.building} />}
        {recipient.postalCode && <Line label="מיקוד" value={recipient.postalCode} ltr />}
      </section>

      <section className="flex flex-col gap-[1mm] pt-[2mm]">
        <Line label="שולח" value={[sender.name, sender.phone].filter(Boolean).join(" · ")} />
        <Line label="תכולה" value={waybill.items.map((item) => `${item.name} ×${item.quantity}`).join(" · ")} />
        {notes && <Line label="הערות" value={notes} />}
        {total > 1 && (
          <div className="text-[9pt] font-bold">
            חבילה {index} מתוך {total}
          </div>
        )}
      </section>
    </article>
  );
}

/**
 * سطر «عنوان: قيمة». مع transliterate تُضاف تحت القيمة العربية نقحرتها العبرية —
 * للأسماء والبلدة والعنوان فقط: جملة عربية بحروف عبرية (الملاحظات، المحتوى)
 * لا يفهمها قارئ العبرية، فتصير ضجيجًا على الملصق.
 */
function Line({
  label,
  value,
  ltr,
  strong,
  transliterate,
}: {
  label: string;
  value: string;
  ltr?: boolean;
  strong?: boolean;
  transliterate?: boolean;
}) {
  const hint = transliterate ? hebrewHint(value) : null;
  return (
    <div className="flex gap-[2mm] leading-snug">
      <span className="w-[17mm] shrink-0 pt-[0.5mm] text-[8pt]">{label}</span>
      <span className="min-w-0">
        <span dir={ltr ? "ltr" : undefined} className={strong ? "text-[11pt] font-bold" : "text-[9.5pt]"}>
          {value}
        </span>
        {hint && <span className="block text-[8.5pt]">{hint}</span>}
      </span>
    </div>
  );
}
