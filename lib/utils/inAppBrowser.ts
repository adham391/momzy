/**
 * متصفّحات داخل التطبيقات (إنستغرام، فيسبوك، تيك توك…).
 *
 * الرابط في bio إنستغرام يفتح الصفحة داخل متصفّح التطبيق نفسه — وهو WebView
 * لا متصفّحًا كاملًا. Google Pay لا يعمل فيه إطلاقًا (يتطلّب متصفّحًا مدعومًا:
 * developers.google.com/pay/issuers/overview/supported-devices)، فلا يظهر زرّه
 * في صفحة الدفع مهما كانت إعدادات HYP.
 *
 * العلاج الوحيد: أن تفتح العميلة الصفحة في متصفّحها. لذلك نكتشف الحالة ونعرض
 * لها زرًّا يفعل ذلك — لا نغيّر شيئًا في الدفع نفسه.
 */

/** بصمات متصفّحات التطبيقات في الـ user agent */
const IN_APP_SIGNATURES = [
  "Instagram",
  "FBAN", // تطبيق فيسبوك — iOS
  "FBAV", // تطبيق فيسبوك — Android
  "FB_IAB", // متصفّح فيسبوك المدمج
  "Messenger",
  "TikTok",
  "Snapchat",
  "Line/",
  "Twitter",
  "Pinterest",
] as const;

/** هل الصفحة مفتوحة داخل متصفّح تطبيق؟ */
export function isInAppBrowser(userAgent: string): boolean {
  return IN_APP_SIGNATURES.some((sig) => userAgent.includes(sig));
}

/** أندرويد؟ — عليه وحده يمكن فتح Chrome برابط intent مباشرةً */
export function isAndroid(userAgent: string): boolean {
  return /Android/i.test(userAgent);
}

/**
 * رابط `intent://` يفتح Chrome على العنوان نفسه من داخل متصفّح التطبيق.
 * يعيد null على غير أندرويد (iOS لا يملك مكافئًا موثوقًا — ننسخ الرابط هناك).
 */
export function androidChromeIntent(url: string, userAgent: string): string | null {
  if (!isAndroid(userAgent)) return null;
  const withoutScheme = url.replace(/^https?:\/\//, "");
  return `intent://${withoutScheme}#Intent;scheme=https;package=com.android.chrome;end`;
}
