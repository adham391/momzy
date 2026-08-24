import { sanityFetch } from "@/lib/sanity/client";
import { tf, tl, activeLocale, type AppLocale } from "@/lib/sanity/i18n";

/** عنصر قيمة في قسم "ليش Momzy" */
export interface HomeValue {
  icon: string;
  title: string;
  desc: string;
}

/** محتوى الصفحة الرئيسية القابل للتعديل من Sanity */
export interface HomePageContent {
  heroImage: string;
  heroTagline: string;
  heroTaglineAccent: string;
  heroIntro: string;
  heroPoints: string[];

  whyLabel: string;
  whyHeading: string;
  whyIntro: string;
  whyValues: HomeValue[];
  whyQuote: string;

  hebaLabel: string;
  hebaHeadingLine1: string;
  hebaHeadingLine2: string;
  hebaBio: string[];
  hebaSignature: string;
  hebaStat: { number: string; label: string };

  bestSellersLabel: string;
  bestSellersTitle: string;
  articlesLabel: string;
  articlesTitle: string;
  reviewsLabel: string;
  reviewsTitle: string;
}

/**
 * القيم الافتراضية لكل لغة — تطابق التصميم الحالي تمامًا.
 * تُستخدم إذا لم يُعدّ محتوى الرئيسية بعد في Studio أو تُرك حقل فارغًا.
 * مسارات الصور/الأيقونات والأرقام (+1000) ثابتة عبر اللغات.
 */
const DEFAULTS: Record<AppLocale, HomePageContent> = {
  // ═══════════════════════════ العربية ═══════════════════════════
  ar: {
    heroImage: "/images/heba.jpg",
    heroTagline: "نرافقك من الحمل",
    heroTaglineAccent: "حتى السنوات الأولى",
    heroIntro:
      "تأسست Momzy على يد هبة حسن — ممرضة معتمدة ومرافقة ولادة، رافقت +1000 أم برحلتهنّ.",
    heroPoints: [
      "استشارات ومرافقة ولادة من هبة",
      "منتجات ومحتوى تعليمي موثوق",
      "مجتمع داعم يرافقك بكل خطوة",
    ],

    whyLabel: "قصتنا",
    whyHeading: "ليش Momzy؟",
    whyIntro:
      "كل شي بدأ من قلب التجربة. هبة حسن — ممرضة معتمدة ومرافقة ولادة — رافقت +1000 أم، وآمنت إنّ كل أم تستحق دعمًا حقيقيًا بأهم مرحلة في حياتها. هيك وُلدت Momzy.",
    whyValues: [
      { icon: "/icons/services-icon.png", title: "معرفة مهنية حقيقية", desc: "خبرة هبة المعتمدة بين يديكِ، لا نصائح عامة." },
      { icon: "/icons/products-icon.png", title: "منتجات مختارة بحب", desc: "كل منتج جرّبته هبة على أساس علمي موثوق." },
      { icon: "/icons/blog-icon.png",     title: "مجتمع يفهمكِ",     desc: "مساحة آمنة تجمع أمهات يمررن برحلتك." },
      { icon: "/icons/heart-icon.png",    title: "طفلك في القلب",    desc: "دعمك كأم ينعكس على بداية حياة طفلك." },
    ],
    whyQuote:
      "«في Momzy نؤمن أن بداية الأمومة لحظة مفصلية — لحظة تتشكّل فيها تجربة الأم، وتبدأ فيها قصة حياة طفل جديد.»",

    hebaLabel: "مؤسِّسة Momzy",
    hebaHeadingLine1: "القلب النابض",
    hebaHeadingLine2: "وراء Momzy",
    hebaBio: [
      "ممرضة شغوفة بالأمومة، رحلتها مع +1000 أم منحتها فهماً عميقاً لما تحتاجه كل أم. هبة لا تقدم معلومات فقط — تقدم حضوراً إنسانياً حقيقياً.",
      "من أول نبضة قلب حتى الخطوة الأولى لطفلك — هبة بجانبك بعلم وحب وشغف حقيقي.",
    ],
    hebaSignature: "هبة حسن",
    hebaStat: { number: "+1000", label: "أمّ رافقتهنّ" },

    bestSellersLabel: "الأكثر طلبًا",
    bestSellersTitle: "الأكثر مبيعاً",
    articlesLabel: "أحدث المقالات",
    articlesTitle: "اقرئي وتعلّمي مع Momzy",
    reviewsLabel: "تجارب حقيقية",
    reviewsTitle: "ماذا قالت الأمهات؟",
  },

  // ═══════════════════════════ العبرية ═══════════════════════════
  he: {
    heroImage: "/images/heba.jpg",
    heroTagline: "מלווים אותך מההיריון",
    heroTaglineAccent: "עד השנים הראשונות",
    heroIntro:
      "Momzy נוסדה על ידי היבה חסן — אחות מוסמכת ודולה מלווה לידה, שליוותה יותר מ־1000 אמהות במסע שלהן.",
    heroPoints: [
      "ייעוץ וליווי לידה מהיבה",
      "מוצרים ותוכן חינוכי אמין",
      "קהילה תומכת שמלווה אותך בכל צעד",
    ],

    whyLabel: "הסיפור שלנו",
    whyHeading: "למה Momzy?",
    whyIntro:
      "הכול התחיל מלב החוויה. היבה חסן — אחות מוסמכת ודולה מלווה לידה — ליוותה יותר מ־1000 אמהות, והאמינה שכל אמא ראויה לתמיכה אמיתית בשלב החשוב ביותר בחייה. כך נולדה Momzy.",
    whyValues: [
      { icon: "/icons/services-icon.png", title: "ידע מקצועי אמיתי", desc: "הניסיון המוסמך של היבה בהישג ידך, לא עצות כלליות." },
      { icon: "/icons/products-icon.png", title: "מוצרים שנבחרו באהבה", desc: "כל מוצר נבחן על ידי היבה על בסיס מדעי אמין." },
      { icon: "/icons/blog-icon.png",     title: "קהילה שמבינה אותך", desc: "מרחב בטוח שמאגד אמהות שעוברות את אותו מסע כמוך." },
      { icon: "/icons/heart-icon.png",    title: "התינוק שלך בלב",    desc: "התמיכה בך כאמא משתקפת בתחילת חייו של תינוקך." },
    ],
    whyQuote:
      "«ב־Momzy אנחנו מאמינים שתחילת האמהות היא רגע מכונן — רגע שבו מתעצבת חוויית האם, ומתחיל בו סיפור חייו של תינוק חדש.»",

    hebaLabel: "מייסדת Momzy",
    hebaHeadingLine1: "הלב הפועם",
    hebaHeadingLine2: "מאחורי Momzy",
    hebaBio: [
      "אחות עם תשוקה לאמהות, שהמסע שלה עם יותר מ־1000 אמהות העניק לה הבנה עמוקה של מה שכל אמא צריכה. היבה לא מספקת רק מידע — היא מביאה נוכחות אנושית אמיתית.",
      "מפעימת הלב הראשונה ועד הצעד הראשון של תינוקך — היבה לצידך בידע, באהבה ובתשוקה אמיתית.",
    ],
    hebaSignature: "היבה חסן",
    hebaStat: { number: "+1000", label: "אמהות שליוותה" },

    bestSellersLabel: "המבוקשים ביותר",
    bestSellersTitle: "רבי המכר",
    articlesLabel: "המאמרים האחרונים",
    articlesTitle: "קראי ולמדי עם Momzy",
    reviewsLabel: "חוויות אמיתיות",
    reviewsTitle: "מה אמרו האמהות?",
  },

  // ═══════════════════════════ الإنجليزية ═══════════════════════════
  en: {
    heroImage: "/images/heba.jpg",
    heroTagline: "With you from pregnancy",
    heroTaglineAccent: "through the early years",
    heroIntro:
      "Momzy was founded by Heba Hasan — a certified nurse and birth doula who has supported over 1,000 moms on their journey.",
    heroPoints: [
      "Consultations and birth support from Heba",
      "Trusted products and educational content",
      "A supportive community with you every step",
    ],

    whyLabel: "Our story",
    whyHeading: "Why Momzy?",
    whyIntro:
      "It all started from the heart of the experience. Heba Hasan — a certified nurse and birth doula — has supported over 1,000 moms, and believed that every mom deserves real support in the most important stage of her life. That's how Momzy was born.",
    whyValues: [
      { icon: "/icons/services-icon.png", title: "Real professional knowledge", desc: "Heba's certified expertise in your hands, not generic advice." },
      { icon: "/icons/products-icon.png", title: "Products chosen with love", desc: "Every product tested by Heba on a trusted scientific basis." },
      { icon: "/icons/blog-icon.png",     title: "A community that gets you", desc: "A safe space bringing together moms going through your journey." },
      { icon: "/icons/heart-icon.png",    title: "Your baby at heart",       desc: "Supporting you as a mom shapes the start of your baby's life." },
    ],
    whyQuote:
      "\"At Momzy we believe the beginning of motherhood is a pivotal moment — a moment when a mother's experience takes shape, and a new baby's life story begins.\"",

    hebaLabel: "Founder of Momzy",
    hebaHeadingLine1: "The beating heart",
    hebaHeadingLine2: "behind Momzy",
    hebaBio: [
      "A nurse passionate about motherhood, whose journey with over 1,000 moms gave her a deep understanding of what every mom needs. Heba doesn't just share information — she brings a real human presence.",
      "From the first heartbeat to your baby's first step — Heba is by your side with knowledge, love, and true passion.",
    ],
    hebaSignature: "Heba Hasan",
    hebaStat: { number: "+1000", label: "moms supported" },

    bestSellersLabel: "Most wanted",
    bestSellersTitle: "Best sellers",
    articlesLabel: "Latest articles",
    articlesTitle: "Read and learn with Momzy",
    reviewsLabel: "Real experiences",
    reviewsTitle: "What moms said",
  },
};

/** يختار القيمة من Sanity إذا موجودة وإلا الافتراضية */
function pick<T>(val: T | null | undefined, fallback: T): T {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "string" && val.trim() === "") return fallback;
  if (Array.isArray(val) && val.length === 0) return fallback;
  return val;
}

/**
 * جلب محتوى الصفحة الرئيسية — يدمج Sanity فوق الافتراضيات المُترجَمة.
 * الحقول النصّية مُدوّلة (tf/tl + $loc): إن مُلئ الـ singleton لاحقًا في Studio
 * يتجاوز الافتراضي؛ وإلا يظهر الافتراضي بلغة الزائر.
 */
export async function getHomePage(locale?: string): Promise<HomePageContent> {
  const loc = await activeLocale(locale);
  const D = DEFAULTS[loc];

  const query = `*[_type == "homePage" && _id == "homePage"][0]{
    "heroImage": heroImage.asset->url,
    ${tf("heroTagline")},
    ${tf("heroTaglineAccent")},
    ${tf("heroIntro")},
    ${tl("heroPoints")},
    ${tf("whyLabel")},
    ${tf("whyHeading")},
    ${tf("whyIntro")},
    whyValues[]{ "icon": icon.asset->url, ${tf("title")}, ${tf("desc")} },
    ${tf("whyQuote")},
    ${tf("hebaLabel")},
    ${tf("hebaHeadingLine1")},
    ${tf("hebaHeadingLine2")},
    ${tl("hebaBio")},
    hebaSignature,
    hebaStat { number, ${tf("label")} },
    ${tf("bestSellersLabel")},
    ${tf("bestSellersTitle")},
    ${tf("articlesLabel")},
    ${tf("articlesTitle")},
    ${tf("reviewsLabel")},
    ${tf("reviewsTitle")}
  }`;

  const d = await sanityFetch<Partial<HomePageContent>>(query, { loc }, 60);
  if (!d) return D;

  // دمج القيم — الفارغة تأخذ الافتراضي (بلغة الزائر)
  const values = pick(d.whyValues, D.whyValues).map((v, i) => ({
    icon:  pick(v?.icon,  D.whyValues[i]?.icon  ?? D.whyValues[0].icon),
    title: pick(v?.title, D.whyValues[i]?.title ?? ""),
    desc:  pick(v?.desc,  D.whyValues[i]?.desc  ?? ""),
  }));

  return {
    heroImage:         pick(d.heroImage, D.heroImage),
    heroTagline:       pick(d.heroTagline, D.heroTagline),
    heroTaglineAccent: pick(d.heroTaglineAccent, D.heroTaglineAccent),
    heroIntro:         pick(d.heroIntro, D.heroIntro),
    heroPoints:        pick(d.heroPoints, D.heroPoints),
    whyLabel:          pick(d.whyLabel, D.whyLabel),
    whyHeading:        pick(d.whyHeading, D.whyHeading),
    whyIntro:          pick(d.whyIntro, D.whyIntro),
    whyValues:         values,
    whyQuote:          pick(d.whyQuote, D.whyQuote),
    hebaLabel:         pick(d.hebaLabel, D.hebaLabel),
    hebaHeadingLine1:  pick(d.hebaHeadingLine1, D.hebaHeadingLine1),
    hebaHeadingLine2:  pick(d.hebaHeadingLine2, D.hebaHeadingLine2),
    hebaBio:           pick(d.hebaBio, D.hebaBio),
    hebaSignature:     pick(d.hebaSignature, D.hebaSignature),
    hebaStat:          { number: pick(d.hebaStat?.number, D.hebaStat.number), label: pick(d.hebaStat?.label, D.hebaStat.label) },
    bestSellersLabel:  pick(d.bestSellersLabel, D.bestSellersLabel),
    bestSellersTitle:  pick(d.bestSellersTitle, D.bestSellersTitle),
    articlesLabel:     pick(d.articlesLabel, D.articlesLabel),
    articlesTitle:     pick(d.articlesTitle, D.articlesTitle),
    reviewsLabel:      pick(d.reviewsLabel, D.reviewsLabel),
    reviewsTitle:      pick(d.reviewsTitle, D.reviewsTitle),
  };
}
