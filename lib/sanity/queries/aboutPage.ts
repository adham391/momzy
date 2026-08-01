import { sanityFetch } from "@/lib/sanity/client";

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

/** القيم الافتراضية — تطابق التصميم الحالي تمامًا */
export const DEFAULT_ABOUT: AboutPageContent = {
  image: "/images/heba.jpg",
  heroLabel: "تعرّفي على المؤسِّسة",
  name: "هبة حسن",
  tagline:
    "ممرضة شغوفة بالأمومة، رافقت آلاف الأمهات وأطفالهنّ — تقدّم معرفةً دقيقة ودعماً إنسانياً مبنياً على تجربة ميدانية حقيقية.",
  credentials: ["ممرضة معتمدة", "مرشدة رضاعة", "مرافقة ولادة"],
  signature: "هبة حسن",
  stats: [
    { number: "آلاف", label: "أم رافقتهنّ" },
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
};

function pick<T>(val: T | null | undefined, fallback: T): T {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "string" && val.trim() === "") return fallback;
  if (Array.isArray(val) && val.length === 0) return fallback;
  return val;
}

export async function getAboutPage(): Promise<AboutPageContent> {
  const query = `*[_type == "aboutPage" && _id == "aboutPage"][0]{
    "image": image.asset->url,
    heroLabel, name, tagline, credentials, signature, stats,
    storyLabel, storyQuote, storyParagraphs,
    philosophyLabel, philosophyHeading,
    philosophyValues[]{ "icon": icon.asset->url, title, desc },
    servicesLabel, servicesHeading, ctaLabel, ctaHeading, ctaText
  }`;

  const d = await sanityFetch<Partial<AboutPageContent>>(query, {}, 60);
  if (!d) return DEFAULT_ABOUT;
  const D = DEFAULT_ABOUT;

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
