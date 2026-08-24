import { sanityFetch } from "@/lib/sanity/client";
import { tf, tl, activeLocale, type AppLocale } from "@/lib/sanity/i18n";

export interface AboutValue { icon: string; title: string; desc: string }
export interface AboutStat { number: string; label: string }

export interface AboutPageContent {
  image: string;
  heroLabel: string;
  name: string;
  tagline: string;
  credentials: string[];
  signature: string;
  stats: AboutStat[];

  storyLabel: string;
  storyQuote: string;
  storyParagraphs: string[];

  philosophyLabel: string;
  philosophyHeading: string;
  philosophyValues: AboutValue[];

  servicesLabel: string;
  servicesHeading: string;
  ctaLabel: string;
  ctaHeading: string;
  ctaText: string;
}

/**
 * القيم الافتراضية حسب اللغة — تطابق التصميم الحالي تمامًا (العربية verbatim).
 * لا يوجد مستند aboutPage في Sanity بعد، فهذه هي القيم التي تُعرض فعليًا.
 * الأيقونات والصور والأرقام ثابتة عبر اللغات — النصوص فقط تُترجم.
 */
const DEFAULTS: Record<AppLocale, AboutPageContent> = {
  // ─────────────────────────── العربية ───────────────────────────
  ar: {
    image: "/images/heba.jpg",
    heroLabel: "تعرّفي على المؤسِّسة",
    name: "هبة حسن",
    tagline:
      "ممرضة شغوفة بالأمومة، رافقت +1000 أم وأطفالهنّ — تقدّم معرفةً دقيقة ودعماً إنسانياً مبنياً على تجربة ميدانية حقيقية.",
    credentials: ["ممرضة معتمدة", "مرشدة رضاعة", "مرافقة ولادة"],
    signature: "هبة حسن",
    stats: [
      { number: "+1000", label: "أم رافقتهنّ" },
      { number: "+3", label: "سنوات خبرة" },
      { number: "+500", label: "جلسة استشارية" },
    ],

    storyLabel: "قصتها",
    storyQuote:
      "«بدأت Momzy من قلب التجربة — لأني آمنت أن كل أم تستحق دعماً حقيقياً في أهم مرحلة بحياتها.»",
    storyParagraphs: [
      "هبة حسن مؤسِّسة منصة Momzy، انطلقت من خبرة ميدانية حقيقية في مرافقة الأمهات. بفهم عميق لاحتياجات الأم في مراحلها المختلفة، تقدّم هبة معرفة دقيقة ودعماً حقيقياً مبنياً على تجربة واقعية.",
      "من أول نبضة قلب حتى الخطوة الأولى لطفلك — هبة بجانبك بعلمٍ وحبٍّ وشغف حقيقي.",
    ],

    philosophyLabel: "فلسفتها",
    philosophyHeading: "كيف ترافقك هبة",
    philosophyValues: [
      { icon: "/icons/correct-icon.png",  title: "علمٌ موثوق",      desc: "معرفة مبنية على أساس علمي وخبرة معتمدة، لا نصائح عامة." },
      { icon: "/icons/heart-icon.png",    title: "حضورٌ إنساني",   desc: "مساحة آمنة ودعم حقيقي — هبة تفهمك قبل أن توجّهك." },
      { icon: "/icons/services-icon.png", title: "تطبيقٌ عملي",     desc: "أدواتٌ واضحة تطبّقينها في يومك مع طفلك بثقة." },
      { icon: "/icons/blog-icon.png",     title: "مرافقةٌ شاملة",  desc: "من أول نبضة قلب حتى الخطوة الأولى لطفلك." },
    ],

    servicesLabel: "خدماتها",
    servicesHeading: "ماذا تقدّم هبة؟",
    ctaLabel: "جاهزة للبدء؟",
    ctaHeading: "دعينا نبدأ رحلتك مع هبة",
    ctaText: "اختاري الخدمة التي تناسبك أو تواصلي معنا للمساعدة في الاختيار.",
  },

  // ─────────────────────────── العبرية ───────────────────────────
  he: {
    image: "/images/heba.jpg",
    heroLabel: "הכירי את המייסדת",
    name: "היבה חסן",
    tagline:
      "אחות עם תשוקה לעולם האמהות, ליוותה +1000 אימהות ותינוקותיהן — ומעניקה ידע מדויק ותמיכה אנושית שנשענת על ניסיון אמיתי מהשטח.",
    credentials: ["אחות מוסמכת", "יועצת הנקה", "דולה מלווה לידה"],
    signature: "היבה חסן",
    stats: [
      { number: "+1000", label: "אימהות שליוותה" },
      { number: "+3", label: "שנות ניסיון" },
      { number: "+500", label: "פגישות ייעוץ" },
    ],

    storyLabel: "הסיפור שלה",
    storyQuote:
      "«התחלתי את Momzy מתוך החוויה עצמה — כי האמנתי שכל אמא ראויה לתמיכה אמיתית בשלב הכי חשוב בחייה.»",
    storyParagraphs: [
      "היבה חסן היא המייסדת של Momzy, שיצאה לדרך מתוך ניסיון אמיתי מהשטח בליווי אימהות. מתוך הבנה עמוקה של צורכי האם בשלבים השונים, היבה מעניקה ידע מדויק ותמיכה אמיתית המבוססת על ניסיון מהחיים.",
      "מפעימת הלב הראשונה ועד הצעד הראשון של תינוקך — היבה לצידך, עם ידע, אהבה ותשוקה אמיתית.",
    ],

    philosophyLabel: "הגישה שלה",
    philosophyHeading: "איך היבה מלווה אותך",
    philosophyValues: [
      { icon: "/icons/correct-icon.png",  title: "ידע אמין",        desc: "ידע המבוסס על בסיס מדעי וניסיון מוסמך, לא עצות כלליות." },
      { icon: "/icons/heart-icon.png",    title: "נוכחות אנושית",   desc: "מרחב בטוח ותמיכה אמיתית — היבה מבינה אותך לפני שהיא מדריכה אותך." },
      { icon: "/icons/services-icon.png", title: "יישום מעשי",      desc: "כלים ברורים שתיישמי ביום־יום עם תינוקך, בביטחון." },
      { icon: "/icons/blog-icon.png",     title: "ליווי מלא",       desc: "מפעימת הלב הראשונה ועד הצעד הראשון של תינוקך." },
    ],

    servicesLabel: "השירותים שלה",
    servicesHeading: "מה היבה מציעה?",
    ctaLabel: "מוכנה להתחיל?",
    ctaHeading: "בואי נתחיל את המסע שלך עם היבה",
    ctaText: "בחרי את השירות שמתאים לך, או צרי קשר ונעזור לך לבחור.",
  },

  // ─────────────────────────── الإنجليزية ───────────────────────────
  en: {
    image: "/images/heba.jpg",
    heroLabel: "Meet the founder",
    name: "Heba Hasan",
    tagline:
      "A nurse passionate about motherhood who has accompanied +1000 moms and their babies — offering precise knowledge and warm, human support built on real hands-on experience.",
    credentials: ["Certified nurse", "Lactation consultant", "Birth doula"],
    signature: "Heba Hasan",
    stats: [
      { number: "+1000", label: "moms supported" },
      { number: "+3", label: "years of experience" },
      { number: "+500", label: "consultation sessions" },
    ],

    storyLabel: "Her story",
    storyQuote:
      "“I started Momzy from the heart of experience — because I believe every mom deserves real support in the most important stage of her life.”",
    storyParagraphs: [
      "Heba Hasan is the founder of Momzy, born from real hands-on experience accompanying moms. With a deep understanding of what a mother needs at every stage, Heba offers precise knowledge and genuine support built on real-life experience.",
      "From the very first heartbeat to your baby's first step — Heba is by your side with knowledge, love, and true passion.",
    ],

    philosophyLabel: "Her philosophy",
    philosophyHeading: "How Heba walks with you",
    philosophyValues: [
      { icon: "/icons/correct-icon.png",  title: "Trusted knowledge",     desc: "Knowledge grounded in science and certified experience — never generic advice." },
      { icon: "/icons/heart-icon.png",    title: "Human presence",        desc: "A safe space and real support — Heba understands you before she guides you." },
      { icon: "/icons/services-icon.png", title: "Practical guidance",    desc: "Clear tools you can use in your day with your baby, with confidence." },
      { icon: "/icons/blog-icon.png",     title: "Complete companionship", desc: "From the very first heartbeat to your baby's first step." },
    ],

    servicesLabel: "Her services",
    servicesHeading: "What does Heba offer?",
    ctaLabel: "Ready to begin?",
    ctaHeading: "Let's begin your journey with Heba",
    ctaText: "Choose the service that fits you, or contact us and we'll help you decide.",
  },
};

function pick<T>(val: T | null | undefined, fallback: T): T {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "string" && val.trim() === "") return fallback;
  if (Array.isArray(val) && val.length === 0) return fallback;
  return val;
}

/**
 * جلب محتوى صفحة «عن هبة» باللغة الفعّالة.
 * يحلّ الحقول المُدوّلة من Sanity ($loc) ويدمجها فوق الافتراضيات المُترجمة —
 * فإن لم يُنشأ المستند بعد (الحالة الحالية) تظهر الافتراضيات بلغة الطلب.
 */
export async function getAboutPage(locale?: string): Promise<AboutPageContent> {
  const loc = await activeLocale(locale);
  const D = DEFAULTS[loc];

  const query = `*[_type == "aboutPage" && _id == "aboutPage"][0]{
    "image": image.asset->url,
    ${tf("heroLabel")},
    ${tf("name")},
    ${tf("tagline")},
    ${tl("credentials")},
    ${tf("signature")},
    stats[]{ number, ${tf("label")} },
    ${tf("storyLabel")},
    ${tf("storyQuote")},
    ${tl("storyParagraphs")},
    ${tf("philosophyLabel")},
    ${tf("philosophyHeading")},
    philosophyValues[]{ "icon": icon.asset->url, ${tf("title")}, ${tf("desc")} },
    ${tf("servicesLabel")},
    ${tf("servicesHeading")},
    ${tf("ctaLabel")},
    ${tf("ctaHeading")},
    ${tf("ctaText")}
  }`;

  const d = await sanityFetch<Partial<AboutPageContent>>(query, { loc }, 60);
  if (!d) return D;

  const philosophyValues = pick(d.philosophyValues, D.philosophyValues).map((v, i) => ({
    icon:  pick(v?.icon,  D.philosophyValues[i]?.icon  ?? D.philosophyValues[0].icon),
    title: pick(v?.title, D.philosophyValues[i]?.title ?? ""),
    desc:  pick(v?.desc,  D.philosophyValues[i]?.desc  ?? ""),
  }));

  return {
    image:             pick(d.image, D.image),
    heroLabel:         pick(d.heroLabel, D.heroLabel),
    name:              pick(d.name, D.name),
    tagline:           pick(d.tagline, D.tagline),
    credentials:       pick(d.credentials, D.credentials),
    signature:         pick(d.signature, D.signature),
    stats:             pick(d.stats, D.stats),
    storyLabel:        pick(d.storyLabel, D.storyLabel),
    storyQuote:        pick(d.storyQuote, D.storyQuote),
    storyParagraphs:   pick(d.storyParagraphs, D.storyParagraphs),
    philosophyLabel:   pick(d.philosophyLabel, D.philosophyLabel),
    philosophyHeading: pick(d.philosophyHeading, D.philosophyHeading),
    philosophyValues,
    servicesLabel:     pick(d.servicesLabel, D.servicesLabel),
    servicesHeading:   pick(d.servicesHeading, D.servicesHeading),
    ctaLabel:          pick(d.ctaLabel, D.ctaLabel),
    ctaHeading:        pick(d.ctaHeading, D.ctaHeading),
    ctaText:           pick(d.ctaText, D.ctaText),
  };
}
