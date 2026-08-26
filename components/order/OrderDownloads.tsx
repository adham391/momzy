import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import type { DigitalDownloadRow } from "@/lib/db/downloads";

interface OrderDownloadsProps {
  downloads: DigitalDownloadRow[];
}

/**
 * بطاقة الكتيبات الرقمية في صفحة تأكيد الطلب.
 * غير الهدية → زر قراءة على الموقع (flipbook). الهدية → ملاحظة أنها أُرسلت لبريد المستلِمة.
 */
export default async function OrderDownloads({ downloads }: OrderDownloadsProps) {
  if (!downloads.length) return null;
  const t = await getTranslations("order");

  return (
    <div
      className="rounded-[22px] overflow-hidden"
      style={{ background: "white", border: "1.5px solid var(--bord)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
    >
      <div
        className="font-heading font-bold text-dark"
        style={{ padding: "18px 24px", borderBottom: "1.5px solid var(--bord)", fontSize: 17 }}
      >
        {t("downloadsTitle")}
      </div>

      <div style={{ padding: "6px 24px 18px" }}>
        {downloads.map((d) => (
          <div
            key={d.id}
            className="py-4 flex items-center gap-3 flex-wrap"
            style={{ borderBottom: "1px solid var(--bord)" }}
          >
            <div className="flex-1 min-w-0">
              <div className="font-label font-semibold text-dark text-[14px] mb-0.5">{d.product_name}</div>
              {d.is_gift ? (
                <div className="text-[12px]" style={{ color: "var(--mid)", fontFamily: "'Tajawal', sans-serif" }} dir="ltr">
                  {t("sentTo", { email: d.customer_email })}
                </div>
              ) : (
                <div className="text-[12px]" style={{ color: "var(--light)", fontFamily: "'Tajawal', sans-serif" }}>
                  {t("readMeta")}
                </div>
              )}
            </div>

            {!d.is_gift && (
              <Link
                href={`/read/${d.token}`}
                className="font-label font-bold text-[13px] shrink-0 [transition:transform_180ms_ease] hover:-translate-y-[1px]"
                style={{
                  background: "var(--rose)",
                  color: "var(--dark)",
                  borderRadius: 50,
                  padding: "11px 22px",
                  boxShadow: "0 6px 18px rgba(242,167,181,0.4)",
                }}
              >
                {t("readBooklet")}
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
