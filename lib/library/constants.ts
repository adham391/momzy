/**
 * ثوابت المكتبة المشتركة — آمنة للمتصفح.
 *
 * منفصلة عن password.ts عمدًا: ذاك يستورد node:crypto فلا يصحّ أن يصل
 * حزمة العميل. هذا الملف يستورده الخادم والعميل و proxy.ts معًا.
 */

/** الحد الأدنى لطول كلمة المرور — يُتحقَّق منه في الواجهة وعلى الخادم */
export const PASSWORD_MIN_LENGTH = 8;

/** اسم كوكي جلسة المكتبة */
export const LIBRARY_SESSION_COOKIE = "momzy_library_session";

/** عمر الجلسة: 400 يوم (سقف الكوكيز في المتصفحات) — ينزلق مع كل زيارة */
export const SESSION_MAX_AGE_SECONDS = 400 * 24 * 60 * 60;
