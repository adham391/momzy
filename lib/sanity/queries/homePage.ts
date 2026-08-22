import { sanityFetch } from "@/lib/sanity/client";

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
 * القيم الافتراضية — تطابق التصميم الحالي تمامًا.
 * تُستخدم إذا لم يُعدّ محتوى الرئيسية بعد في Studio أو تُرك حقل فارغًا.
 */
export const DEFAULT_HOME: HomePageContent = {
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
};

/** يختار القيمة من Sanity إذا موجودة وإلا الافتراضية */
function pick<T>(val: T | null | undefined, fallback: T): T {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "string" && val.trim() === "") return fallback;
  if (Array.isArray(val) && val.length === 0) return fallback;
  return val;
}

/** جلب محتوى الصفحة الرئيسية — يدمج Sanity فوق الافتراضيات */
export async function getHomePage(): Promise<HomePageContent> {
  const query = `*[_type == "homePage" && _id == "homePage"][0]{
    "heroImage": heroImage.asset->url,
    heroTagline, heroTaglineAccent, heroIntro, heroPoints,
    whyLabel, whyHeading, whyIntro,
    whyValues[]{ "icon": icon.asset->url, title, desc },
    whyQuote,
    hebaLabel, hebaHeadingLine1, hebaHeadingLine2, hebaBio, hebaSignature,
    hebaStat,
    bestSellersLabel, bestSellersTitle, articlesLabel, articlesTitle, reviewsLabel, reviewsTitle
  }`;

  const d = await sanityFetch<Partial<HomePageContent>>(query, {}, 60);
  if (!d) return DEFAULT_HOME;

  // دمج القيم — الفارغة تأخذ الافتراضي
  const D = DEFAULT_HOME;
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
