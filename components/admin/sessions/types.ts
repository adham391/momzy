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
}

/** رسالة أعلى الصفحة بعد كل فعل */
export interface PageNotice {
  text: string;
  tone: "ok" | "error";
}
