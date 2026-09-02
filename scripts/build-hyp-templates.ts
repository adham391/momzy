/**
 * build-hyp-templates.ts
 * ──────────────────────
 * يولّد قوالب صفحة الدفع المخصّصة لـHYP بثلاث لغات من مصدر واحد،
 * فلا يتباعد التصميم بين اللغات عند أي تعديل لاحق.
 *
 * المخرجات: reference/hyp-template-{ar,he,en}.html
 *
 * تشغيل:
 *   npx tsx scripts/build-hyp-templates.ts
 *
 * ⚠️ شرط جوهري على HYP: تقديم هذه القوالب بترميز **UTF-8**.
 *    صفحتهم الجاهزة تُخدَم windows-1255 وهو لا يحوي الحرف العربي
 *    (فحصناه: النص العربي يتحوّل «?????»). النسخة العربية تعمل فقط
 *    إذا خُدمت UTF-8 — وهذا ما أتاحوه لنا بالقالب المخصّص.
 */

import * as fs from "fs";
import * as path from "path";

type Locale = "ar" | "he" | "en";

/** نصوص الواجهة لكل لغة */
interface Strings {
  dir: "rtl" | "ltr";
  htmlLang: string;
  /** خطّا العنوان والنص — يطابقان ما يستعمله momzyworld.com لكل لغة */
  fontHeading: string;
  fontBody: string;
  googleFonts: string;
  title: string;
  headerTitle: string;
  headerSub: string;
  amountLabel: string;
  sampleItem: string;
  customerSection: string;
  firstName: string;
  lastName: string;
  phone: string;
  idNumber: string;
  email: string;
  cardSection: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  submit: string;
  trustSsl: string;
  trustCards: string;
  trustHyp: string;
  footPrefix: string;
  /** ملاحظات الدمج لفريق HYP — تُكتب داخل تعليق HTML */
  integrationNotes: string[];
}

const STRINGS: Record<Locale, Strings> = {
  ar: {
    dir: "rtl",
    htmlLang: "ar",
    fontHeading: '"Amiri", Georgia, serif',
    fontBody: '"Tajawal", Arial, sans-serif',
    googleFonts: "family=Amiri:wght@700&family=Tajawal:wght@400;500;700;800",
    title: "دفع آمن | Momzy",
    headerTitle: "دفع آمن",
    headerSub: "طلب من Momzy · هبة حسن",
    amountLabel: "المبلغ المطلوب",
    sampleItem: "كتيب وقت البطن",
    customerSection: "بيانات العميلة",
    firstName: "الاسم الأول",
    lastName: "اسم العائلة",
    phone: "رقم الهاتف",
    idNumber: "رقم الهوية",
    email: "البريد الإلكتروني",
    cardSection: "بيانات البطاقة",
    cardNumber: "رقم البطاقة",
    expiry: "تاريخ الانتهاء",
    cvv: "CVV",
    submit: "ادفعي بأمان",
    trustSsl: "دفع مشفّر SSL",
    trustCards: "Visa · Mastercard",
    trustHyp: "مؤمَّن عبر Hyp",
    footPrefix: "للاستفسار:",
    integrationNotes: [
      "هذا القالب عربي ويجب أن يُخدَم بترميز UTF-8 حصرًا.",
      "صفحتكم الجاهزة تُخدَم windows-1255 وهو لا يحوي الحرف العربي —",
      "اختبرناه على الترمينال فتحوّل النص العربي إلى «?????».",
      "القيم المحقونة (ClientName وheshDesc) يجب أن تصل UTF-8 أيضًا.",
    ],
  },
  he: {
    dir: "rtl",
    htmlLang: "he",
    fontHeading: '"Frank Ruhl Libre", Georgia, serif',
    fontBody: '"Heebo", Arial, sans-serif',
    googleFonts: "family=Frank+Ruhl+Libre:wght@500;700&family=Heebo:wght@400;500;700;800",
    title: "תשלום מאובטח | Momzy",
    headerTitle: "תשלום מאובטח",
    headerSub: "הזמנה מ‑Momzy · היבא חסן",
    amountLabel: "הסכום לתשלום",
    sampleItem: "חוברת זמן בטן",
    customerSection: "פרטי הלקוחה",
    firstName: "שם פרטי",
    lastName: "שם משפחה",
    phone: "טלפון נייד",
    idNumber: "מספר ת.ז",
    email: "דוא״ל",
    cardSection: "פרטי כרטיס אשראי",
    cardNumber: "מספר כרטיס",
    expiry: "תוקף",
    cvv: "CVV",
    submit: "לתשלום מאובטח",
    trustSsl: "תשלום מוצפן SSL",
    trustCards: "Visa · Mastercard",
    trustHyp: "מאובטח על ידי Hyp",
    footPrefix: "לשאלות:",
    integrationNotes: [
      "התבנית בעברית — עובדת גם ב windows-1255 וגם ב UTF-8.",
      "מומלץ להגיש את שלוש התבניות ב UTF-8 לאחידות עם הגרסה הערבית.",
    ],
  },
  en: {
    dir: "ltr",
    htmlLang: "en",
    fontHeading: '"Lora", Georgia, serif',
    fontBody: '"Nunito", Arial, sans-serif',
    googleFonts: "family=Lora:wght@600;700&family=Nunito:wght@400;600;700;800",
    title: "Secure payment | Momzy",
    headerTitle: "Secure payment",
    headerSub: "Order from Momzy · Heba Hasan",
    amountLabel: "Amount due",
    sampleItem: "Tummy Time Booklet",
    customerSection: "Your details",
    firstName: "First name",
    lastName: "Last name",
    phone: "Mobile phone",
    idNumber: "ID number",
    email: "Email",
    cardSection: "Card details",
    cardNumber: "Card number",
    expiry: "Expiry",
    cvv: "CVV",
    submit: "Pay securely",
    trustSsl: "SSL encrypted",
    trustCards: "Visa · Mastercard",
    trustHyp: "Secured by Hyp",
    footPrefix: "Questions:",
    integrationNotes: [
      "English template, LTR. Serve as UTF-8 for consistency with the Arabic one.",
    ],
  },
};

/** الشعار مضمَّن base64 — الملف يصل HYP مكتفيًا بذاته بلا اعتماد على دومين */
function logoDataUri(): string {
  const p = path.resolve(process.cwd(), "reference/assets/momzy-logo-small.png");
  if (!fs.existsSync(p)) {
    throw new Error(`الشعار المصغّر غير موجود: ${p} — شغّل التصغير أولاً`);
  }
  return `data:image/png;base64,${fs.readFileSync(p).toString("base64")}`;
}

/** ينتج ملف HTML كاملًا للغة واحدة */
function buildTemplate(loc: Locale, s: Strings, logo: string): string {
  const notes = s.integrationNotes.map((n) => `       ${n}`).join("\n");
  // في LTR نضع المبلغ لليمين والتسمية لليسار تلقائيًا عبر flex — لا حاجة لقلب يدوي
  return `<!DOCTYPE html>
<html lang="${s.htmlLang}" dir="${s.dir}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${s.title}</title>

<!--
  ═══════════════════════════════════════════════════════════════════
  Momzy by Heba Hasan — custom payment page template [${loc.toUpperCase()}]
  For integration by the Hyp team · terminal 0086248129
  Generated from scripts/build-hyp-templates.ts — edit there, not here.
  ═══════════════════════════════════════════════════════════════════

  INTEGRATION NOTES

    1. ENCODING — serve this template as UTF-8.
${notes}

    2. FIELD MAPPING — every input carries data-hyp="..." matching your
       API field names (ClientName, ClientLName, cell, UserId, email,
       CardNum, Tmonth-Tyear, cvv). The page has no logic of its own —
       structure and styling only.

    3. The primary button is marked data-hyp="submit".

    4. Amount and cart lines are marked data-hyp="amount" / data-hyp="items"
       for values coming from Amount / Pritim / heshDesc.

    5. The only external dependency is Google Fonts. If blocked on your
       side, remove the <link> — the fallback stack keeps the design intact.

    6. This page is also displayed inside an iframe on momzyworld.com.
       Please confirm iframe embedding is supported for custom templates.
  ═══════════════════════════════════════════════════════════════════
-->

<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?${s.googleFonts}&display=swap" rel="stylesheet" />

<style>
  /* ── Momzy brand tokens ── */
  :root {
    --rose:     #F2A7B5;
    --rosepale: #FEF5F7;
    --teal:     #82C9C4;
    --offwh:    #FDFAF5;
    --dark:     #252220;
    --mid:      #55504C;
    --light:    #9A9490;
    --bord:     rgba(0, 0, 0, 0.08);
    --font-heading: ${s.fontHeading};
    --font-body: ${s.fontBody};
    --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  }

  * { box-sizing: border-box; }

  body {
    margin: 0;
    background: var(--offwh);
    color: var(--dark);
    font-family: var(--font-body);
    font-size: 15px;
    line-height: 1.7;
    -webkit-font-smoothing: antialiased;
  }

  /* ── Header with Momzy's signature wave ── */
  .mz-header {
    position: relative;
    background: linear-gradient(135deg, #FFF5F7 0%, #FEF0F5 50%, #EFF8F8 100%);
    padding: 34px 20px 62px;
    text-align: center;
    overflow: hidden;
  }
  .mz-logo { height: 48px; width: auto; margin-bottom: 10px; }
  .mz-header h1 {
    font-family: var(--font-heading);
    font-weight: 700;
    font-size: clamp(21px, 4vw, 27px);
    margin: 0 0 4px;
    color: var(--dark);
  }
  .mz-header p { margin: 0; font-size: 13.5px; color: var(--mid); }
  .mz-wave { position: absolute; bottom: -1px; left: 0; width: 100%; height: 44px; display: block; }

  .mz-wrap { max-width: 460px; margin: 0 auto; padding: 0 18px 40px; }

  .mz-card {
    background: #fff;
    border: 1.5px solid var(--bord);
    border-radius: 22px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
    overflow: hidden;
    margin-top: 16px;
  }

  /* ── Order summary ── */
  .mz-summary { background: var(--rosepale); padding: 18px 22px; border-bottom: 1.5px solid var(--bord); }
  .mz-summary-row { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
  .mz-summary-label { font-size: 13px; color: var(--mid); }
  .mz-amount {
    font-family: var(--font-body);
    font-weight: 800;
    font-size: 27px;
    color: var(--dark);
    direction: ltr;
    unicode-bidi: isolate;
  }
  .mz-items { margin: 10px 0 0; padding: 0; list-style: none; font-size: 13px; color: var(--mid); }
  .mz-items li { display: flex; justify-content: space-between; gap: 10px; padding: 3px 0; }

  /* ── Fields ── */
  .mz-body { padding: 22px; }
  .mz-section-title {
    font-family: var(--font-heading);
    font-weight: 700;
    font-size: 16px;
    margin: 0 0 14px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .mz-section-title:not(:first-child) { margin-top: 26px; }
  .mz-section-title::before {
    content: "";
    width: 22px; height: 3px; border-radius: 3px;
    background: var(--rose);
    display: inline-block;
  }

  .mz-field { margin-bottom: 14px; }
  .mz-row { display: flex; gap: 12px; }
  .mz-row > .mz-field { flex: 1; }

  .mz-label { display: block; font-weight: 700; font-size: 13px; margin-bottom: 6px; color: var(--dark); }
  .mz-label .req { color: var(--rose); }

  .mz-input {
    width: 100%;
    border: 1.5px solid var(--bord);
    border-radius: 14px;
    padding: 12px 15px;
    font-family: inherit;
    font-size: 14.5px;
    background: var(--offwh);
    color: var(--dark);
    outline: none;
    transition: border-color 200ms var(--ease-out), background 200ms ease;
  }
  .mz-input::placeholder { color: var(--light); }
  .mz-input:focus { border-color: var(--teal); background: #fff; }
  /* Numeric fields stay LTR even on an RTL page */
  .mz-input.ltr { direction: ltr; text-align: ${s.dir === "rtl" ? "right" : "left"}; }

  /* ── Submit ── */
  .mz-submit {
    width: 100%;
    border: none;
    border-radius: 50px;
    background: var(--rose);
    color: var(--dark);
    font-family: inherit;
    font-weight: 800;
    font-size: 16px;
    padding: 15px;
    margin-top: 8px;
    cursor: pointer;
    box-shadow: 0 8px 24px rgba(242, 167, 181, 0.45);
    transition: transform 160ms var(--ease-out), box-shadow 200ms ease;
  }
  .mz-submit:hover { box-shadow: 0 12px 30px rgba(242, 167, 181, 0.55); }
  .mz-submit:active { transform: scale(0.98); }

  /* ── Trust row ── */
  .mz-trust {
    display: flex; justify-content: center; align-items: center;
    gap: 14px; flex-wrap: wrap; margin-top: 18px;
    font-size: 12px; color: var(--light);
  }
  .mz-trust span { display: inline-flex; align-items: center; gap: 5px; }

  .mz-foot { text-align: center; margin-top: 20px; font-size: 11.5px; color: var(--light); }
  .mz-foot a { color: var(--teal); text-decoration: none; }

  @media (max-width: 380px) { .mz-row { flex-direction: column; gap: 0; } }
</style>
</head>

<body>

  <header class="mz-header">
    <!-- data-hyp="logo" — replace with the logo uploaded in the portal if preferred -->
    <img class="mz-logo" data-hyp="logo" alt="Momzy" src="${logo}" />
    <h1>${s.headerTitle}</h1>
    <p>${s.headerSub}</p>

    <svg class="mz-wave" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0,20 C240,60 480,0 720,30 C960,60 1200,0 1440,20 L1440,60 L0,60 Z" fill="#FDFAF5" />
    </svg>
  </header>

  <div class="mz-wrap">
    <div class="mz-card">

      <div class="mz-summary">
        <div class="mz-summary-row">
          <span class="mz-summary-label">${s.amountLabel}</span>
          <span class="mz-amount" data-hyp="amount">&#8362;67.00</span>
        </div>
        <ul class="mz-items" data-hyp="items">
          <li><span>${s.sampleItem}</span><span>1 &times; &#8362;67.00</span></li>
        </ul>
      </div>

      <div class="mz-body">

        <div class="mz-section-title">${s.customerSection}</div>

        <div class="mz-row">
          <div class="mz-field">
            <label class="mz-label" for="f-first">${s.firstName} <span class="req">*</span></label>
            <input class="mz-input" id="f-first" data-hyp="ClientName" type="text" autocomplete="given-name" />
          </div>
          <div class="mz-field">
            <label class="mz-label" for="f-last">${s.lastName} <span class="req">*</span></label>
            <input class="mz-input" id="f-last" data-hyp="ClientLName" type="text" autocomplete="family-name" />
          </div>
        </div>

        <div class="mz-row">
          <div class="mz-field">
            <label class="mz-label" for="f-phone">${s.phone} <span class="req">*</span></label>
            <input class="mz-input ltr" id="f-phone" data-hyp="cell" type="tel" inputmode="tel" autocomplete="tel" placeholder="050-0000000" />
          </div>
          <div class="mz-field">
            <label class="mz-label" for="f-id">${s.idNumber} <span class="req">*</span></label>
            <input class="mz-input ltr" id="f-id" data-hyp="UserId" type="text" inputmode="numeric" />
          </div>
        </div>

        <div class="mz-field">
          <label class="mz-label" for="f-email">${s.email} <span class="req">*</span></label>
          <input class="mz-input ltr" id="f-email" data-hyp="email" type="email" autocomplete="email" placeholder="example@email.com" />
        </div>

        <div class="mz-section-title">${s.cardSection}</div>

        <div class="mz-field">
          <label class="mz-label" for="f-card">${s.cardNumber} <span class="req">*</span></label>
          <input class="mz-input ltr" id="f-card" data-hyp="CardNum" type="text" inputmode="numeric" autocomplete="cc-number" placeholder="0000 0000 0000 0000" />
        </div>

        <div class="mz-row">
          <div class="mz-field">
            <label class="mz-label" for="f-exp">${s.expiry} <span class="req">*</span></label>
            <input class="mz-input ltr" id="f-exp" data-hyp="Tmonth-Tyear" type="text" inputmode="numeric" autocomplete="cc-exp" placeholder="MM / YY" />
          </div>
          <div class="mz-field">
            <label class="mz-label" for="f-cvv">${s.cvv} <span class="req">*</span></label>
            <input class="mz-input ltr" id="f-cvv" data-hyp="cvv" type="text" inputmode="numeric" autocomplete="cc-csc" placeholder="000" />
          </div>
        </div>

        <button class="mz-submit" data-hyp="submit" type="submit">${s.submit}</button>

        <div class="mz-trust">
          <span>&#128274; ${s.trustSsl}</span>
          <span>&#128179; ${s.trustCards}</span>
          <span>&#10003; ${s.trustHyp}</span>
        </div>
      </div>
    </div>

    <p class="mz-foot">
      ${s.footPrefix} <a href="mailto:hello@momzyworld.com">hello@momzyworld.com</a>
    </p>
  </div>

</body>
</html>
`;
}

function main(): void {
  const logo = logoDataUri();
  const outDir = path.resolve(process.cwd(), "reference");

  for (const loc of Object.keys(STRINGS) as Locale[]) {
    const html = buildTemplate(loc, STRINGS[loc], logo);
    const file = path.join(outDir, `hyp-template-${loc}.html`);
    fs.writeFileSync(file, html, "utf8");
    console.log(`  ✔ ${path.relative(process.cwd(), file)} — ${Math.round(html.length / 1024)}KB`);
  }
  console.log("\nكل القوالب UTF-8 — بلّغ HYP أن هذا شرط لعمل النسخة العربية.");
}

main();
