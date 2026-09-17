/**
 * صفحة HTML تنقل النافذة الأعلى إلى الوجهة — تخرج من iframe الدفع المدمج.
 *
 * صفحة دفع HYP تُعرض داخل iframe على موقعنا، فكل عودة منها (callback) وكل تعذّر
 * في فتحها (retry) يجب أن يُكمل في الصفحة الكاملة لا داخل الإطار — وإلا ظهر الموقع
 * كله داخل بطاقة الدفع. تعمل أيضًا خارج أي إطار لأن top === self عندها.
 */
export function breakoutResponse(dest: string): Response {
  const target = JSON.stringify(dest); // تهريب آمن للحقن داخل السكربت
  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8" />
<title>جارٍ إتمام العملية…</title>
<style>body{font-family:'Tajawal',Arial,sans-serif;background:#FDFAF5;color:#55504C;text-align:center;padding:56px 20px;margin:0}</style>
</head><body>
<p style="font-size:15px">جارٍ إتمام العملية…</p>
<script>(function(){var d=${target};try{(window.top||window).location.replace(d);}catch(e){window.location.replace(d);}})();</script>
<noscript><a href=${target}>اضغطي هنا للمتابعة</a></noscript>
</body></html>`;
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
}
