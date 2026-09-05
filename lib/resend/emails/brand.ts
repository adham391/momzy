/**
 * هوية الإيميلات المشتركة — شعار وترويسة وتذييل.
 *
 * الشعار يُستضاف على الموقع ولا يُضمَّن base64: عملاء البريد (وGmail خاصة)
 * يُسقطون الصور المضمَّنة، فالرابط المستضاف هو ما يصل فعلًا.
 *
 * ويتبع NEXT_PUBLIC_SITE_URL فينتقل تلقائيًا من نطاق Vercel إلى النطاق
 * النهائي بلا تعديل قالب واحد.
 */

/** أصل الموقع — بلا شرطة أخيرة */
export function siteOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || "https://momzyworld.com";
  return raw.replace(/\/+$/, "");
}

/** رابط شعار الإيميل — نسخة مصغّرة (300px) بدل الأصل (1280px، 405KB) */
export function logoUrl(): string {
  return `${siteOrigin()}/icons/momzy-logo-email.png`;
}

/**
 * ترويسة الإيميل: الشعار فوق تسمية القسم فالعنوان.
 * width/height صريحان — عملاء البريد لا يحترمون CSS وحده،
 * وبدونهما يقفز التخطيط قبل تحميل الصورة.
 */
export function emailHeader(badge: string, title: string, accent: string): string {
  return `
    <img src="${logoUrl()}" alt="Momzy" width="150" height="83"
         style="display:block;margin:0 auto 14px;width:150px;height:auto;border:0;" />
    <div style="font-size:13px;font-weight:700;color:${accent};letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">${badge}</div>
    <h1 style="margin:0;font-size:24px;font-weight:700;color:#252220;">${title}</h1>`;
}

/** تذييل موحّد */
export function emailFooter(): string {
  const site = siteOrigin();
  return `<p style="margin:0;font-size:12px;color:#9A9490;">Momzy — <a href="${site}" style="color:#82C9C4;text-decoration:none;">momzyworld.com</a></p>`;
}
