/** دوال تنسيق مشتركة — عملة وتواريخ (أرقام لاتينية، عربية) */

/** يحوّل الأرقام العربية-الهندية (٠-٩) والفارسية (۰-۹) إلى لاتينية (0-9) */
export function toLatinDigits(input: string): string {
  return (input ?? "")
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}

/** سعر بالشيكل: 1133 → "₪1,133" */
export function formatILS(n: number): string {
  return `₪${Number(n).toLocaleString("en-US")}`;
}

/** يعزل التاريخ كسياق LTR (‏⁦…⁩) ليظهر صحيحًا داخل صفحات RTL */
const ltr = (s: string) => `⁦${s}⁩`;

/** يوم/شهر/سنة بلا أصفار بادئة: "11/7/2026" */
function dmy(d: Date): string {
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

/** ساعة:دقيقة (24h): "09:05" */
function hm(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** تاريخ: "11/7/2026" */
export function formatDate(iso: string): string {
  return ltr(dmy(new Date(iso)));
}

/** تاريخ ووقت: "11/7/2026, 09:05" */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return ltr(`${dmy(d)}, ${hm(d)}`);
}

/** تاريخ فتحة حجز: "12/7/2026" (من "YYYY-MM-DD") */
export function formatSlotDate(dateStr: string): string {
  return ltr(dmy(new Date(dateStr + "T00:00:00")));
}

/** وقت مختصر: "10:00:00" → "10:00" */
export function formatTimeShort(t: string): string {
  return t.slice(0, 5);
}
