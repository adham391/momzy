/* ─────────────────────────────────────────────────────────
   أنواع المنتجات — تطابق Schema المخطط لـ Supabase لاحقاً
   كل interface مصمم ليُخزَّن كـ row أو JSONB في Postgres
   ───────────────────────────────────────────────────────── */

/** تاق ملوّن — نص + لون */
export interface ProductTag {
  label: string;
  color: "rose" | "teal";
}

/** مواصفة تقنية key/value */
export interface ProductSpecification {
  key: string;
  value: string;
}

/** عنصر داخل صندوق (يستخدم في قسم "كل قطعة جمعناها إلك") */
export interface ProductContent {
  /** أيقونة من /icons/ — اختياري */
  icon?: string;
  /** صورة معاينة — اختياري */
  image?: string;
  /** اسم العنصر */
  name: string;
  /** وصف عاطفي قصير */
  description: string;
}

/** فئة مستهدفة بالهدية (للمُهدي) */
export interface ProductGiftTarget {
  /** label قصير "للصديقة اللي صارت أم" */
  label: string;
  /** نص الترغيب */
  text: string;
}

/** شهادة عميلة */
export interface ProductTestimonial {
  name: string;
  location: string;
  text: string;
  rating: number;
  /** صورة دائرية صغيرة — اختياري */
  image?: string;
}

/** سؤال شائع */
export interface ProductFAQ {
  question: string;
  answer: string;
}

/** قصة المنتج (قسم "من قلب هبة") */
export interface ProductStory {
  title: string;
  paragraphs: string[];
  /** صورة المؤلفة (هبة) — اختياري */
  image?: string;
}

/** معلومات الشحن — تظهر في trust signals تحت CTA */
export interface ProductShippingInfo {
  /** "3-5 أيام عمل" */
  estimatedDays?: string;
  /** هل الشحن مجاني لهذا المنتج */
  freeShipping?: boolean;
  /** ملاحظة إضافية مثل "شحن مجاني للطلبات فوق 500₪" */
  notes?: string;
}

/* ─────────────────────────────────────────────────────────
   Product — الواجهة الأساسية
   ───────────────────────────────────────────────────────── */

export interface Product {
  /* ── حقول إلزامية ── */
  slug: string;
  title: string;
  /** وصف قصير — يظهر في كروت المتجر و subtitle الـ Hero */
  description: string;
  price: number;
  /** الصورة الرئيسية — مسار في public/ */
  mainImage: string;
  /** صور إضافية للـ Gallery (2 على الأقل) */
  gallery: string[];
  inStock: boolean;
  /** التصنيف — "صناديق الأمومة" | "إكسسوارات الطفل" | "كتب ودلائل" | "عام" */
  category: string;

  /* ── حقول اختيارية أساسية ── */
  /** السعر قبل الخصم — يُعرض مشطوباً */
  compareAtPrice?: number;
  /** الكمية المتوفرة — undefined = غير محدد */
  stockQuantity?: number;
  /** الوزن بالكيلوغرام — لاحقاً للشحن */
  weight?: number;
  /** مواصفات تقنية (مادة، أبعاد، عمر...) */
  specifications?: ProductSpecification[];
  /** نص طويل منسّق للوصف الكامل */
  longDescription?: string;
  /** رابط فيديو — اختياري */
  videoUrl?: string;
  /** label صغيرة فوق العنوان في الكارد الكبير (مثال: "Limited Edition") */
  label?: string;
  /** badge يظهر فوق الكارد الكبير في الصفحة الرئيسية (مثال: "جديد الآن") */
  badge?: string;
  /** لون الـ badge: yellow | rose | teal */
  badgeColor?: "yellow" | "rose" | "teal";
  /** tags ملوّنة فوق ProductCard */
  tags?: ProductTag[];
  /** معلومات الشحن — تستخدم في trust signals */
  shippingInfo?: ProductShippingInfo;

  /* ── حقول اختيارية غنية (للمنتجات البطلة) ── */
  /** قسم القصة "من قلب هبة" */
  story?: ProductStory;
  /** قسم "كل قطعة جمعناها إلك" */
  contents?: ProductContent[];
  /** قسم "لمين هاي الهدية" — للمُهدي */
  giftTargets?: ProductGiftTarget[];
  /** قسم الشهادات */
  testimonials?: ProductTestimonial[];
  /** قسم الأسئلة الشائعة */
  faqs?: ProductFAQ[];

  /* ── meta ── */
  /** معرّف Sanity (_id) — يُستخدم للتعديل من لوحة الأدمن */
  id?: string;
  createdAt?: string;
  updatedAt?: string;
}

/* ─────────────────────────────────────────────────────────
   فلاتر ودوال مساعدة لطبقة getProducts
   ───────────────────────────────────────────────────────── */

export interface ProductFilters {
  inStockOnly?: boolean;
  category?: string;
  limit?: number;
}

export type ProductSort = "newest" | "price-asc" | "price-desc";
