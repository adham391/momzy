/* ─────────────────────────────────────────────────────────
   أنواع الخدمات — تطابق Sanity schema service
   كل interface مصمم ليُخزَّن كـ row في Postgres لاحقاً
   ───────────────────────────────────────────────────────── */

/** نوع الخدمة — يحدد الأيقونة والمكان */
export type ServiceType = "workshop" | "individual" | "online" | "home";

/** فئة الخدمة — للتقسيم في صفحة /services */
export type ServiceCategory = "group" | "individual";

/** لون الكارد — من design tokens */
export type ServiceColor = "rose" | "teal" | "yellow" | "mint";

/** سؤال شائع عن الخدمة */
export interface ServiceFAQ {
  question: string;
  answer: string;
}

/* ─────────────────────────────────────────────────────────
   Service — الواجهة الأساسية
   ───────────────────────────────────────────────────────── */

export interface Service {
  /* ── حقول إلزامية ── */
  /** المعرّف الفريد — first-days-workshop */
  slug: string;
  /** اسم الخدمة — "ورشة الأيام الأولى بعد الولادة" */
  title: string;
  /** نوع الخدمة */
  type: ServiceType;
  /** فئة العرض — group أو individual */
  category: ServiceCategory;
  /** المدة — "ساعة ونصف – ساعتين" */
  duration: string;
  /** المكان — "الناصرة" / "زوم" / "منزل الأم" */
  location: string;
  /** وصف قصير — سطرين للكارد */
  shortDescription: string;
  /** لون الكارد */
  color: ServiceColor;

  /* ── حقول اختيارية ── */
  /** الفئة العمرية للعرض — "0-3 أشهر" (نص حر بكلمات هبة) */
  ageRange?: string;
  /** أصغر عمر بالأشهر — يُفعّل التحقق التلقائي عند التسجيل */
  ageMinMonths?: number;
  /** أكبر عمر بالأشهر — يُفعّل التحقق التلقائي عند التسجيل */
  ageMaxMonths?: number;
  /** عدد المشاركين الأقصى — للورشات الجماعية */
  maxParticipants?: number;
  /** الوصف الطويل — paragraphs */
  longDescription?: string[];
  /** المواضيع التي تُغطّى — bullets */
  topics?: string[];
  /** الفوائد — "ما الذي ستتعلمينه" */
  benefits?: string[];
  /** الأسئلة الشائعة — يظهر القسم فقط إن وُجدت */
  faqs?: ServiceFAQ[];
  /** صورة الغلاف */
  coverImage?: string;
  /** أيقونة صغيرة */
  icon?: string;
  /** السعر بالشيكل (اختياري — قد تكون "حسب الطلب") */
  price?: number;
  /** ترتيب العرض */
  order?: number;

  /* ── meta ── */
  createdAt?: string;
  updatedAt?: string;
}

/** فلاتر اختيارية */
export interface ServiceFilters {
  category?: ServiceCategory;
  type?: ServiceType;
}
