import { babyAgeDetailedLabel, correctedAgeLabel } from "@/lib/utils/age";
import { siteOrigin } from "./brand";
import { bookingEmailShell } from "./bookingEmail";

/**
 * إشعار هبة بانضمام أم لقائمة انتظار ورشة.
 *
 * لا إيميل للأم: شاشة النموذج تقول لها «سجّلناكِ، سنُعلمكِ فور فتح موعد»،
 * وما يليه هو رسالة هبة حين يُفتح الموعد فعلًا — لا تأكيدًا على تأكيد.
 *
 * الإيميل يحمل ما تحتاجه هبة لتتّصل بها: اسمها وهاتفها وبلدتها، واسم طفلها
 * وعمره اليوم (أو أسبوع حملها). لا موعد بعد، فالعمر يُقاس **يوم الانضمام**
 * لا يوم جلسة — كما في لوحة الانتظار تمامًا.
 */
export interface WaitlistNotice {
  name: string;
  email: string;
  phone: string;
  city: string;
  serviceName: string;
  /** تاريخ ميلاد الطفل — للورشات ذات الفئة العمرية */
  babyBirthDate: string | null;
  /** اسم الطفل — للمولود وحده */
  babyName: string | null;
  /** أسبوع ولادة الخديج — منه العمر المصحَّح */
  gestationalWeeks: number | null;
  /** أسبوع الحمل يوم الانضمام — للخدمات التي تسبق الولادة */
  pregnancyWeek: number | null;
  notes: string | null;
  /** يوم الانضمام (YYYY-MM-DD بتوقيت إسرائيل) — منه يُقاس عمر الطفل */
  todayISO: string;
}

/** تهريب بسيط لمنع كسر الـ HTML بقيم مُدخلة */
const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const fmtDate = (iso: string) => {
  const d = new Date(iso + "T00:00:00");
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
};

/** سطر في صندوق العميلة */
const line = (html: string) =>
  `<div style="font-size:13px;color:#55504C;line-height:1.8;margin-top:6px;">${html}</div>`;

const strong = (s: string) => `<strong style="color:#252220;">${s}</strong>`;

/** الطفل: اسمه وعمره اليوم (والمصحَّح إن كان خديجًا) */
function babyLines(n: WaitlistNotice): string {
  if (!n.babyBirthDate) return "";
  const age = babyAgeDetailedLabel(n.babyBirthDate, n.todayISO);
  const corrected = correctedAgeLabel(n.babyBirthDate, n.todayISO, n.gestationalWeeks);
  return [
    n.babyName ? line(`👶 اسم الطفل: ${strong(esc(n.babyName))}`) : "",
    line(
      `👶 عمر الطفل اليوم: ${strong(age)} <span style="color:#9A9490;">(مواليد <span style="direction:ltr;">${fmtDate(n.babyBirthDate)}</span>)</span>`,
    ),
    corrected
      ? line(
          `👶 العمر المصحَّح: ${strong(corrected)} <span style="color:#9A9490;">(وُلد في الأسبوع ${n.gestationalWeeks})</span>`,
        )
      : "",
  ].join("");
}

export const waitlistAdminSubject = (n: WaitlistNotice) => `⏳ انضمام لقائمة الانتظار — ${n.serviceName}`;

export function waitlistAdminEmailHtml(n: WaitlistNotice): string {
  const panel = `${siteOrigin()}/admin/bookings/waitlist`;
  const body = `
    <p style="font-size:15px;color:#55504C;line-height:1.9;margin:0 0 16px;">انضمّت أم لقائمة انتظار <strong style="color:#252220;">${esc(n.serviceName)}</strong> — تصلها رسالتكِ حين يُفتح موعد جديد.</p>
    <div style="padding:16px 20px;background:#FEF5F7;border-radius:10px;border:1.5px solid #F7C4CE;">
      <div style="font-size:11px;font-weight:700;color:#F2A7B5;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">المنتظِرة</div>
      <div style="font-size:14px;color:#252220;line-height:1.8;">${esc(n.name)} · <a href="tel:${esc(n.phone)}" style="color:#82C9C4;direction:ltr;">${esc(n.phone)}</a> · <a href="mailto:${esc(n.email)}" style="color:#82C9C4;">${esc(n.email)}</a></div>
      ${line(`📍 من: ${strong(esc(n.city))}`)}
      ${n.pregnancyWeek !== null ? line(`🤰 أسبوع الحمل اليوم: ${strong(String(n.pregnancyWeek))}`) : ""}
      ${babyLines(n)}
      ${n.notes ? line(`ملاحظات: ${strong(esc(n.notes).replace(/\n/g, "<br>"))}`) : ""}
    </div>
    <div style="text-align:center;margin-top:20px;">
      <a href="${panel}" style="display:inline-block;background:#82C9C4;color:white;text-decoration:none;font-size:14px;font-weight:700;border-radius:50px;padding:12px 28px;">قائمة الانتظار في اللوحة</a>
    </div>`;
  return bookingEmailShell("ar", "قائمة الانتظار", "⏳ منتظِرة جديدة", body);
}
