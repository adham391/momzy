/**
 * تصنيفات المقالات — قائمة مغلقة لا نصّ حرّ.
 *
 * السبب: التصنيف يُفلتَر به، والنص الحرّ يُنتج «رضاعة» و«الرضاعة» و«رضاعه»
 * فتنكسر الفلترة. والأهم أنّ الموقع بثلاث لغات: المفتاح ثابت في Sanity
 * (`sleep`) والاسم المعروض يأتي من messages/{ar,he,en}.json — فيُترجَم
 * التصنيف مرة واحدة لا مع كل مقال.
 *
 * الترتيب هنا هو ترتيب ظهور الأزرار في /articles.
 */

export const ARTICLE_CATEGORIES = [
  "pregnancy",
  "postpartum",
  "breastfeeding",
  "newborn-care",
  "sleep",
  "development",
  "nutrition",
] as const;

export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];

/** أسماء عربية للقائمة المنسدلة في Studio — الموقع يقرأ من messages لا من هنا */
export const CATEGORY_TITLES_AR: Record<ArticleCategory, string> = {
  pregnancy: "الحمل",
  postpartum: "ما بعد الولادة",
  breastfeeding: "الرضاعة",
  "newborn-care": "العناية بالمولود",
  sleep: "نوم الطفل",
  development: "تطوّر الطفل",
  nutrition: "التغذية",
};

/** لون الـ chip — ثابت لكل تصنيف كي يتعرّف عليه القارئ بصريًا عبر الصفحات */
export const CATEGORY_CHIP_COLOR: Record<ArticleCategory, "rose" | "teal" | "yellow"> = {
  pregnancy: "rose",
  postpartum: "rose",
  breastfeeding: "teal",
  "newborn-care": "teal",
  sleep: "yellow",
  development: "yellow",
  nutrition: "teal",
};

/**
 * غلاف احتياطي حين لا ترفع هبة صورة: تدرّج + إيموجي التصنيف.
 * أفضل من مربّع رمادي، ويجعل البطاقات مميّزة بصريًا حتى بلا صور.
 */
export const CATEGORY_COVER: Record<ArticleCategory, { emoji: string; bg: string }> = {
  pregnancy:      { emoji: "🤰", bg: "bg-gradient-to-br from-[#fde4f0] to-[#fcd0e8]" },
  postpartum:     { emoji: "🌿", bg: "bg-gradient-to-br from-[#d8f2f0] to-[#c4eae8]" },
  breastfeeding:  { emoji: "🤱", bg: "bg-gradient-to-br from-[#fde8ee] to-[#fbd4de]" },
  "newborn-care": { emoji: "🍼", bg: "bg-gradient-to-br from-[#d4f0ee] to-[#c0e8e4]" },
  sleep:          { emoji: "🌙", bg: "bg-gradient-to-br from-[#fef4d0] to-[#faedc0]" },
  development:    { emoji: "👶", bg: "bg-gradient-to-br from-[#feeec4] to-[#fae4a8]" },
  nutrition:      { emoji: "🥣", bg: "bg-gradient-to-br from-[#e4f2e8] to-[#d0e8d8]" },
};

/** هل القيمة تصنيف معروف؟ — يحرس ما يأتي من Sanity أو من الـ URL */
export function isArticleCategory(value: unknown): value is ArticleCategory {
  return typeof value === "string" && (ARTICLE_CATEGORIES as readonly string[]).includes(value);
}
