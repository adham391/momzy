/** بيانات رسالة التواصل */
export interface ContactEmailData {
  name:    string;
  email:   string;
  phone?:  string;
  subject: string;
  message: string;
}

/** قالب إيميل إشعار رسالة تواصل جديدة — يُرسل لهبة */
export function contactEmailHtml(data: ContactEmailData): string {
  const { name, email, phone, subject, message } = data;
  const date = new Intl.DateTimeFormat("ar-EG-u-nu-latn", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date());

  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>رسالة تواصل جديدة — Momzy</title>
</head>
<body style="margin:0;padding:0;background:#FDFAF5;font-family:'Tajawal',Arial,sans-serif;direction:rtl;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FDFAF5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- هيدر -->
          <tr>
            <td style="background:linear-gradient(135deg,#FFF5F7,#EFF8F8);border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;border-bottom:3px solid #F2A7B5;">
              <div style="font-size:13px;font-weight:700;color:#F2A7B5;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">
                Momzy — رسالة جديدة
              </div>
              <h1 style="margin:0;font-size:24px;font-weight:700;color:#252220;">
                📩 رسالة تواصل جديدة
              </h1>
              <p style="margin:8px 0 0;font-size:13px;color:#9A9490;">${date}</p>
            </td>
          </tr>

          <!-- المحتوى -->
          <tr>
            <td style="background:white;padding:32px 40px;border-right:1.5px solid #EDE9E4;border-left:1.5px solid #EDE9E4;">

              <!-- بيانات المرسِل -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;background:#FDFAF5;border-radius:12px;border:1.5px solid #EDE9E4;overflow:hidden;">
                <tr>
                  <td style="padding:14px 20px;border-bottom:1px solid #EDE9E4;background:#EFF8F8;">
                    <span style="font-size:12px;font-weight:700;color:#82C9C4;letter-spacing:1px;text-transform:uppercase;">بيانات المرسِل</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;">
                    <table width="100%" cellpadding="6" cellspacing="0">
                      <tr>
                        <td style="font-size:13px;color:#9A9490;width:100px;">الاسم</td>
                        <td style="font-size:14px;font-weight:600;color:#252220;">${name}</td>
                      </tr>
                      <tr>
                        <td style="font-size:13px;color:#9A9490;">الإيميل</td>
                        <td style="font-size:14px;color:#252220;">
                          <a href="mailto:${email}" style="color:#82C9C4;text-decoration:none;">${email}</a>
                        </td>
                      </tr>
                      ${phone ? `
                      <tr>
                        <td style="font-size:13px;color:#9A9490;">الهاتف</td>
                        <td style="font-size:14px;color:#252220;">
                          <a href="tel:${phone}" style="color:#82C9C4;text-decoration:none;">${phone}</a>
                        </td>
                      </tr>` : ""}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- الموضوع -->
              <div style="margin-bottom:16px;">
                <div style="font-size:11px;font-weight:700;color:#9A9490;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:6px;">الموضوع</div>
                <div style="font-size:16px;font-weight:700;color:#252220;padding:12px 16px;background:#FEF5F7;border-radius:10px;border-right:3px solid #F2A7B5;">
                  ${subject}
                </div>
              </div>

              <!-- الرسالة -->
              <div>
                <div style="font-size:11px;font-weight:700;color:#9A9490;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:6px;">الرسالة</div>
                <div style="font-size:15px;color:#55504C;line-height:1.9;padding:16px 20px;background:#FDFAF5;border-radius:10px;border:1.5px solid #EDE9E4;white-space:pre-line;">
                  ${message}
                </div>
              </div>

              <!-- زر الرد -->
              <div style="text-align:center;margin-top:28px;">
                <a href="mailto:${email}?subject=رد: ${subject}"
                   style="display:inline-block;background:#F2A7B5;color:white;text-decoration:none;font-size:14px;font-weight:700;padding:13px 32px;border-radius:50px;letter-spacing:0.5px;">
                  رُدّي على ${name} ←
                </a>
              </div>

            </td>
          </tr>

          <!-- تذييل -->
          <tr>
            <td style="background:#F8F4EE;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;border:1.5px solid #EDE9E4;border-top:none;">
              <p style="margin:0;font-size:12px;color:#9A9490;">
                هذا الإيميل أُرسل تلقائياً من نموذج التواصل في
                <a href="https://momzyworld.com" style="color:#82C9C4;text-decoration:none;">momzyworld.com</a>
              </p>
              <p style="margin:6px 0 0;font-size:11px;color:#C4BDB8;">© 2026 Momzy — جميع الحقوق محفوظة</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `.trim();
}

/** سطر موضوع الإيميل */
export function contactEmailSubject(name: string, subject: string): string {
  return `📩 رسالة جديدة من ${name} — ${subject}`;
}
