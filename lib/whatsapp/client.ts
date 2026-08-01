/**
 * تكامل واتساب مع Meta Cloud API — إشعارات هبة التلقائية.
 * التدفّق: رسالة قالب (template) عبر Graph API — القوالب هي الوحيدة المسموحة
 * للرسائل المُرسَلة من النشاط خارج نافذة 24 ساعة (business-initiated).
 * المرجع: https://developers.facebook.com/docs/whatsapp/cloud-api
 *
 * مُعطّل تلقائيًا حتى تُضبط مفاتيح Meta في .env.local:
 *   WHATSAPP_PHONE_NUMBER_ID   = معرّف رقم واتساب الأعمال
 *   WHATSAPP_ACCESS_TOKEN      = التوكن الدائم
 *   WHATSAPP_TEMPLATE_NAME     = اسم القالب المعتمد (افتراضي: momzy_notification)
 * وبدونها لا تُرسَل رسائل واتساب (الإيميلات + رابط wa.me اليدوي يبقيان).
 */

const DEFAULT_VERSION = "v21.0";
const DEFAULT_TEMPLATE = "momzy_notification";
const DEFAULT_LANG = "ar";

/** هل ضُبطت مفاتيح Meta WhatsApp؟ */
export function isWhatsAppConfigured(): boolean {
  return Boolean(process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_ACCESS_TOKEN);
}

/** يحوّل الرقم لصيغة E.164 بلا + (كما يتوقّعها Graph API: 972501234567) */
export function toWaRecipient(phone: string): string {
  return phone.replace(/[\s\-()]/g, "").replace(/^\+/, "");
}

/** رسالة قالب واتساب — الرقم + بارامترات جسم القالب بالترتيب */
export interface WhatsAppTemplateMessage {
  to: string;
  /** قيم {{1}}, {{2}}... في جسم القالب (نصوص سطر واحد بلا أسطر جديدة) */
  bodyParams: string[];
  templateName?: string;
  languageCode?: string;
}

/**
 * يبني حمولة رسالة القالب حسب مواصفة Meta Cloud API.
 * دالة نقية (بلا شبكة) — قابلة للاختبار وحدةً.
 */
export function buildTemplatePayload(msg: WhatsAppTemplateMessage) {
  return {
    messaging_product: "whatsapp",
    to: toWaRecipient(msg.to),
    type: "template",
    template: {
      name: msg.templateName ?? process.env.WHATSAPP_TEMPLATE_NAME ?? DEFAULT_TEMPLATE,
      language: { code: msg.languageCode ?? DEFAULT_LANG },
      components: [
        {
          type: "body",
          parameters: msg.bodyParams.map((text) => ({ type: "text" as const, text })),
        },
      ],
    },
  };
}

/**
 * يرسل رسالة قالب واتساب لهبة عبر Meta Cloud API.
 * best-effort: يسجّل نجاح/فشل ولا يرمي (لا يعطّل الطلب).
 */
export async function sendWhatsAppTemplate(msg: WhatsAppTemplateMessage): Promise<boolean> {
  if (!isWhatsAppConfigured() || !msg.to) return false;

  const version = process.env.WHATSAPP_API_VERSION ?? DEFAULT_VERSION;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID!;
  const token = process.env.WHATSAPP_ACCESS_TOKEN!;

  try {
    const res = await fetch(`https://graph.facebook.com/${version}/${phoneId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(buildTemplatePayload(msg)),
      cache: "no-store",
    });
    const data = (await res.json().catch(() => ({}))) as {
      messages?: { id: string }[];
      error?: { message?: string };
    };
    if (!res.ok) {
      console.error("[whatsapp] Meta رفض:", res.status, data.error?.message ?? JSON.stringify(data));
      return false;
    }
    console.log("[whatsapp] أُرسل →", toWaRecipient(msg.to), data.messages?.[0]?.id ?? "");
    return true;
  } catch (e) {
    console.error("[whatsapp] استثناء:", e instanceof Error ? e.message : e);
    return false;
  }
}
