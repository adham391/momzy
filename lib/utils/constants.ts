/* ── ثوابت التصميم ────────────────────────────────────── */

/** ارتفاع الهيدر بالبيكسل */
export const HEADER_HEIGHT = 72;

/** العرض الأقصى للحاوية الرئيسية */
export const CONTAINER_MAX_WIDTH = 1200;

/** ارتفاع اللوقو */
export const LOGO_HEIGHT = 56;

/** حجم صورة هبة الدائرية */
export const HEBA_AVATAR_SIZE = 260;

/* ── عناصر النافبار ──────────────────────────────────── */

/** واجهة عنصر النافبار */
export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  colorClass: string;
  iconBg: string;
  hoverBorder: string;
  hoverBg: string;
  hasDropdown?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  {
    id: "home",
    label: "الرئيسية",
    href: "/",
    icon: "/icons/home-icon.png",
    colorClass: "text-mid",
    iconBg: "bg-gradient-to-br from-[#fde4ec] to-rosepale",
    hoverBorder: "border-[rgba(217,105,122,0.25)]",
    hoverBg: "bg-rosepale",
  },
  {
    id: "shop",
    label: "المتجر",
    href: "/shop",
    icon: "/icons/shop-icon.png",
    colorClass: "text-mid",
    iconBg: "bg-gradient-to-br from-[#d8f0ee] to-tealpale",
    hoverBorder: "border-[rgba(79,168,166,0.2)]",
    hoverBg: "bg-tealpale",
    hasDropdown: true,
  },
  {
    id: "services",
    label: "خدماتنا",
    href: "/services",
    icon: "/icons/services-icon.png",
    colorClass: "text-mid",
    iconBg: "bg-gradient-to-br from-[#fde4ec] to-rosepale",
    hoverBorder: "border-[rgba(217,105,122,0.25)]",
    hoverBg: "bg-rosepale",
  },
  {
    id: "articles",
    label: "المقالات",
    href: "/articles",
    icon: "/icons/blog-icon.png",
    colorClass: "text-mid",
    iconBg: "bg-gradient-to-br from-[#fff0bb] to-yellowlt",
    hoverBorder: "border-[rgba(245,200,66,0.35)]",
    hoverBg: "bg-yellowlt",
  },
  {
    id: "about",
    label: "عن هبة",
    href: "/about",
    icon: "/icons/about-icon.png",
    colorClass: "text-mid",
    iconBg: "bg-gradient-to-br from-[#e0f4f4] to-tealpale",
    hoverBorder: "border-[rgba(79,168,166,0.18)]",
    hoverBg: "bg-[#e8f6f5]",
  },
];

/* ── بيانات الميقا منيو ──────────────────────────────── */

/** واجهة كاتيقوري الميقا منيو */
export interface MegaCategory {
  id: string;
  label: string;
  icon: string;
  iconBg: string;
  featuredBg: string;
  featuredBorderColor: string;
  featured: {
    emoji: string;
    badge: string;
    badgeBg: string;
    title: string;
    price: string;
  };
  items: { emoji: string; title: string }[];
  seeAllText: string;
}

export const MEGA_CATEGORIES: MegaCategory[] = [
  {
    id: "products",
    label: "منتجات",
    icon: "/icons/products-icon.png",
    iconBg: "bg-rosepale",
    featuredBg: "bg-rosepale",
    featuredBorderColor: "border-[rgba(242,167,181,0.2)]",
    featured: {
      emoji: "📦",
      badge: "جديد الآن",
      badgeBg: "bg-gradient-to-br from-rose to-teal",
      title: "صندوق مشوار أم",
      price: "₪ 280",
    },
    items: [],
    seeAllText: "كل المنتجات",
  },
  {
    id: "books",
    label: "كتيبات",
    icon: "/icons/books-icon.png",
    iconBg: "bg-tealpale",
    featuredBg: "bg-tealpale",
    featuredBorderColor: "border-[rgba(130,201,196,0.2)]",
    featured: {
      emoji: "📗",
      badge: "الأكثر مبيعاً",
      badgeBg: "bg-teal",
      title: "كتيب الرضاعة الطبيعية",
      price: "₪ 49",
    },
    items: [
      { emoji: "📗", title: "كتيب الرضاعة الطبيعية" },
      { emoji: "📘", title: "دليل ما بعد الولادة" },
      { emoji: "📝", title: "يوميات الحمل" },
    ],
    seeAllText: "كل الكتيبات",
  },
  {
    id: "workshops",
    label: "ورشات مسجلة",
    icon: "/icons/record-icon.png",
    iconBg: "bg-yellowlt",
    featuredBg: "bg-yellowlt",
    featuredBorderColor: "border-[rgba(245,217,142,0.3)]",
    featured: {
      emoji: "🎥",
      badge: "الأكثر طلباً",
      badgeBg: "bg-gradient-to-br from-[#C09420] to-[#D4B840]",
      title: "ورشة الحسية",
      price: "₪ 120",
    },
    items: [
      { emoji: "🎥", title: "ورشة الحسية" },
      { emoji: "🎥", title: "ورشة الحركة" },
    ],
    seeAllText: "كل الورشات",
  },
];

/* ── بيانات قسم "كل ما تحتاجينه" ─────────────────────── */

/** واجهة كارد العرض */
export interface OfferCard {
  emoji: string;
  title: string;
  description: string;
  linkText: string;
  href: string;
  color: "rose" | "teal" | "yellow";
}

export const OFFER_CARDS: OfferCard[] = [
  {
    emoji: "🌸",
    title: "المعرفة المهنية",
    description:
      "خدمات متخصصة من هبة حسن — ممرضة معتمدة ومرشدة رضاعة ومرافقة ولادة بخبرة +1000 أم",
    linkText: "اكتشفي الخدمات",
    href: "/services",
    color: "rose",
  },
  {
    emoji: "📚",
    title: "منتجات مختارة بعناية",
    description:
      "منتجات ومحتوى تعليمي مبني على أساس علمي — لترافقك في كل خطوة من رحلتك",
    linkText: "تصفحي المتجر",
    href: "/shop",
    color: "teal",
  },
  {
    emoji: "💬",
    title: "المجتمع الداعم",
    description:
      "مساحة تجمع الأمهات — لأن بداية الأمومة لحظة مفصلية تستحق الدعم الحقيقي",
    linkText: "اقرئي المقالات",
    href: "/articles",
    color: "yellow",
  },
];

/* ── بيانات خدمات هبة ────────────────────────────────── */

/** واجهة خدمة هبة */
export interface HebaService {
  emoji: string;
  title: string;
  description: string;
  iconBg: string;
}

export const HEBA_SERVICES: HebaService[] = [
  {
    emoji: "🤱",
    title: "استشارة الرضاعة",
    description: "وضعيات صحيحة وحل مشكلات",
    iconBg: "bg-rosepale",
  },
  {
    emoji: "🌸",
    title: "مرافقة الولادة",
    description: "دعم كامل في أهم لحظة",
    iconBg: "bg-tealpale",
  },
  {
    emoji: "🏠",
    title: "زيارات بيتية",
    description: "هبة تأتي إليك بعد الولادة",
    iconBg: "bg-yellowlt",
  },
  {
    emoji: "💻",
    title: "ورشات Zoom",
    description: "من راحة بيتك",
    iconBg: "bg-rosepale",
  },
];

/* ── بيانات التقييمات ────────────────────────────────── */

/** واجهة تقييم */
export interface Review {
  quote: string;
  name: string;
  info: string;
  initial: string;
  avatarBg: string;
}

export const REVIEWS: Review[] = [
  {
    quote:
      "هبة غيّرت تجربتي مع الرضاعة من الأساس. بعد جلسة واحدة كل شيء تحسّن بشكل لم أتوقعه.",
    name: "سارة م.",
    info: "أم لطفلة ٤ أشهر",
    initial: "س",
    avatarBg: "bg-rose",
  },
  {
    quote:
      "الزيارة البيتية كانت أفضل قرار اتخذته بعد الولادة. وقفت مع كل سؤال وكل دمعة بصدر رحب.",
    name: "ريم خ.",
    info: "أم جديدة",
    initial: "ر",
    avatarBg: "bg-gradient-to-br from-teal to-mint",
  },
  {
    quote:
      "رافقتني هبة أثناء الولادة — وجودها كان مطمئناً جداً لا يوصف.",
    name: "منى ص.",
    info: "أم لطفل بكر",
    initial: "م",
    avatarBg: "bg-gradient-to-br from-[#C09420] to-yellow",
  },
  {
    quote:
      "ورشة الحسية ممتعة وعلمية في نفس الوقت. أصبحت أفهم طفلتي بشكل مختلف تماماً.",
    name: "لينا ع.",
    info: "أم لتوأم",
    initial: "ل",
    avatarBg: "bg-gradient-to-br from-mint to-teal",
  },
];

/* ── بيانات المقالات (ثابتة — المرحلة 1) ────────────── */

/** واجهة مقالة */
export interface ArticlePreview {
  emoji: string;
  chipLabel: string;
  chipColor: "rose" | "teal" | "yellow";
  title: string;
  readTime: string;
  imageBg: string;
}

export const ARTICLE_PREVIEWS: ArticlePreview[] = [
  {
    emoji: "🤱",
    chipLabel: "رضاعة",
    chipColor: "rose",
    title: "وضعيات الرضاعة الصحيحة للمبتدئات",
    readTime: "٥ دقائق",
    imageBg: "bg-gradient-to-br from-[#fde8ee] to-[#fbd4de]",
  },
  {
    emoji: "🌿",
    chipLabel: "ما بعد الولادة",
    chipColor: "teal",
    title: "كيف تتعافين بعد الولادة القيصرية",
    readTime: "٧ دقائق",
    imageBg: "bg-gradient-to-br from-[#d8f2f0] to-[#c4eae8]",
  },
  {
    emoji: "👶",
    chipLabel: "تطور الطفل",
    chipColor: "yellow",
    title: "المعالم التطورية في الشهر الأول",
    readTime: "٦ دقائق",
    imageBg: "bg-gradient-to-br from-[#fef4d0] to-[#faedc0]",
  },
];

/* ── بيانات الفوتر ───────────────────────────────────── */

/** واجهة عمود الفوتر */
export interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "MOMZY",
    links: [
      { label: "الرئيسية", href: "/" },
      { label: "خدماتنا", href: "/services" },
      { label: "المتجر", href: "/shop" },
      { label: "المقالات", href: "/articles" },
      { label: "عن هبة", href: "/about" },
    ],
  },
  {
    title: "روابط مفيدة",
    links: [
      { label: "أسئلة وأجوبة", href: "/faq" },
      { label: "سياسة الموقع", href: "/privacy" },
      { label: "سياسة الإرجاع", href: "/returns" },
      { label: "اتصل بنا", href: "/contact" },
    ],
  },
];

/* ── عناصر النافبار للموبايل ──────────────────────────── */

export interface MobileNavItem {
  label: string;
  href: string;
  emoji: string;
  iconBg: string;
}

export const MOBILE_NAV_ITEMS: MobileNavItem[] = [
  {
    label: "خدماتنا",
    href: "/services",
    emoji: "💬",
    iconBg: "bg-gradient-to-br from-[#fde4ec] to-rosepale",
  },
  {
    label: "المتجر",
    href: "/shop",
    emoji: "🛍️",
    iconBg: "bg-gradient-to-br from-[#d8f0ee] to-tealpale",
  },
  {
    label: "المقالات",
    href: "/articles",
    emoji: "📖",
    iconBg: "bg-gradient-to-br from-[#fff0bb] to-yellowlt",
  },
  {
    label: "عن هبة",
    href: "/about",
    emoji: "🌸",
    iconBg: "bg-gradient-to-br from-[#e0f4f4] to-tealpale",
  },
];
