/** خدمة كما يراها نموذج إضافة المواعيد — مع القيم التي تُعبَّأ تلقائيًا عند اختيارها */
export interface ServiceOption {
  slug: string;
  title: string;
  /** لقاء أونلاين — يُعبَّأ رابط زوم الثابت بدل المكان */
  online: boolean;
  price: number;
  capacity: number;
  /** مدّة الجلسة الافتراضية بالدقائق — تحسب وقت النهاية والمواعيد المتتالية */
  durationMin: number;
  meetingLink: string;
  location: string;
  /** حقول التسجيل التي تسألها هذه الخدمة — كي يطابق التسجيل اليدوي التسجيلَ العادي */
  ageMinMonths: number | null;
  ageMaxMonths: number | null;
  /** خدمة ما قبل الولادة — تُسأل: حامل أم بعد الولادة */
  minPregnancyWeek: number | null;
  askTopic: boolean;
}

/** رسالة أعلى الصفحة بعد كل فعل */
export interface PageNotice {
  text: string;
  tone: "ok" | "error";
}
