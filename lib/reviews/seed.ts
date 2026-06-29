import type { Review } from "./types";

/**
 * SEED_REVIEWS — التقييمات الأولية (fallback في dev)
 * المصدر الأساسي في الإنتاج: Sanity Studio
 */
export const SEED_REVIEWS: Review[] = [
  {
    slug: "sara-m",
    quote:
      "هبة غيّرت تجربتي مع الرضاعة من الأساس. بعد جلسة واحدة كل شيء تحسّن بشكل لم أتوقعه.",
    name: "سارة م.",
    info: "أم لطفلة ٤ أشهر",
    initial: "س",
    color: "rose",
    rating: 5,
    order: 1,
  },
  {
    slug: "reem-kh",
    quote:
      "الزيارة البيتية كانت أفضل قرار اتخذته بعد الولادة. وقفت مع كل سؤال وكل دمعة بصدر رحب.",
    name: "ريم خ.",
    info: "أم جديدة",
    initial: "ر",
    color: "teal",
    rating: 5,
    order: 2,
  },
  {
    slug: "mona-s",
    quote:
      "رافقتني هبة أثناء الولادة — وجودها كان مطمئناً جداً لا يوصف.",
    name: "منى ص.",
    info: "أم لطفل بكر",
    initial: "م",
    color: "yellow",
    rating: 5,
    order: 3,
  },
  {
    slug: "lina-a",
    quote:
      "ورشة الحسية ممتعة وعلمية في نفس الوقت. أصبحت أفهم طفلتي بشكل مختلف تماماً.",
    name: "لينا ع.",
    info: "أم لتوأم",
    initial: "ل",
    color: "mint",
    rating: 5,
    order: 4,
  },
];
