/** عنوان إيميل التسليم الرقمي */
export function downloadEmailSubject(productName: string, isGift: boolean): string {
  return isGift ? `🎁 هدية لكِ من Momzy: ${productName}` : `كتيبكِ جاهز للتحميل: ${productName}`;
}

interface DownloadEmailOptions {
  productName: string;
  downloadUrl: string;
  isGift: boolean;
  /** اسم المُهدية — للهدايا فقط */
  gifterName?: string;
  expiresAt: string;
  maxDownloads: number;
}

/** قالب HTML لإيميل تسليم الكتيب الرقمي (RTL) */
export function downloadEmailHtml(opts: DownloadEmailOptions): string {
  const { productName, downloadUrl, isGift, gifterName, expiresAt, maxDownloads } = opts;
  const exp = new Date(expiresAt);
  const expStr = `${exp.getDate()}/${exp.getMonth() + 1}/${exp.getFullYear()}`;

  const intro = isGift
    ? `${gifterName ? `أهدتكِ <b>${gifterName}</b>` : "أُهديَ إليكِ"} كتيبًا رقميًا من Momzy 🎁`
    : "شكرًا لطلبكِ من Momzy! كتيبكِ الرقمي جاهز للتحميل.";

  return `
  <div dir="rtl" style="font-family:Tajawal,Arial,sans-serif;background:#FDFAF5;padding:24px;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #EDE9E4;">
      <div style="background:#82C9C4;padding:20px;text-align:center;color:#ffffff;font-size:20px;font-weight:bold;">Momzy</div>
      <div style="padding:28px 24px;text-align:center;color:#252220;">
        <p style="font-size:15px;line-height:1.9;color:#55504C;margin:0 0 18px;">${intro}</p>
        <p style="font-size:18px;font-weight:bold;margin:0 0 22px;color:#252220;">${productName}</p>
        <a href="${downloadUrl}" style="display:inline-block;background:#F2A7B5;color:#252220;text-decoration:none;font-weight:bold;font-size:16px;padding:14px 34px;border-radius:50px;">⬇️ تحميل الكتيب (PDF)</a>
        <p style="font-size:12px;color:#9A9490;margin:22px 0 0;line-height:1.8;">
          هذا الرابط خاصٌّ بكِ — صالح حتى ${expStr}، وبحدٍّ أقصى ${maxDownloads} مرّات تحميل.
        </p>
      </div>
      <div style="padding:14px;text-align:center;font-size:12px;color:#9A9490;border-top:1px solid #EDE9E4;">
        لأي استفسار راسلينا على <a href="mailto:hello@momzyworld.com" style="color:#82C9C4;">hello@momzyworld.com</a>
      </div>
    </div>
  </div>`;
}
