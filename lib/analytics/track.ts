/**
 * أدوات تتبّع للعميل — آمنة للمتصفح فقط.
 * تلتقط UTM (first-touch)، تولّد session id، وترسل الأحداث لـ /api/track.
 */

const UTM_COOKIE = "momzy_utm";
const SESSION_KEY = "momzy_sid";

export interface UTM {
  source?: string;
  medium?: string;
  campaign?: string;
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : null;
}

function writeCookie(name: string, value: string, days: number): void {
  if (typeof document === "undefined") return;
  const exp = new Date(Date.now() + days * 86400000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${exp}; path=/; SameSite=Lax`;
}

/** معرّف الجلسة (لكل جلسة متصفح) — لحساب معدّل التحويل */
export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sid = sessionStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

/** يلتقط UTM من الرابط ويخزّنها (first-touch — لا يستبدل الموجود) */
export function captureUTM(): void {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const source = params.get("utm_source");
  if (!source) return; // لا UTM في الرابط
  if (readCookie(UTM_COOKIE)) return; // محفوظ مسبقاً (first-touch)
  const utm: UTM = {
    source,
    medium: params.get("utm_medium") ?? undefined,
    campaign: params.get("utm_campaign") ?? undefined,
  };
  writeCookie(UTM_COOKIE, JSON.stringify(utm), 30);
}

/** يقرأ UTM المخزّنة (تُرفق بالطلبات والأحداث) */
export function getStoredUTM(): UTM {
  const raw = readCookie(UTM_COOKIE);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as UTM;
  } catch {
    return {};
  }
}

/** يرسل حدث تتبّع — best-effort (لا يرمي، لا يعطّل الصفحة) */
export function track(eventType: string, data: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  const utm = getStoredUTM();
  const payload = {
    event_type: eventType,
    page: window.location.pathname,
    session_id: getSessionId(),
    utm_source: utm.source ?? null,
    utm_medium: utm.medium ?? null,
    utm_campaign: utm.campaign ?? null,
    referrer: document.referrer || null,
    ...data,
  };
  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {});
}
