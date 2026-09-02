import { randomBytes, scrypt, timingSafeEqual, createHash } from "node:crypto";
import { PASSWORD_MIN_LENGTH } from "./constants";

/**
 * تجزئة كلمات المرور — scrypt من node:crypto (بلا أي مكتبة خارجية).
 * الصيغة المخزّنة: "scrypt:N:r:p:salt_b64:hash_b64" — البارامترات داخل
 * السلسلة نفسها، فرفعها مستقبلًا لا يكسر الكلمات القديمة.
 */

/** بارامترات scrypt الموصى بها لخوادم الويب (OWASP) */
const SCRYPT_N = 32768; // 2^15
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LENGTH = 64;
const SALT_BYTES = 16;

// يُعاد تصديره كي يستورده كود الخادم من مكان واحد
export { PASSWORD_MIN_LENGTH };

/** scrypt كـ Promise */
function scryptAsync(password: string, salt: Buffer, N: number, r: number, p: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    // maxmem يجب أن يتّسع لـ 128·N·r بايت — الافتراضي (32MB) حدّي مع N=32768
    scrypt(password, salt, KEY_LENGTH, { N, r, p, maxmem: 128 * N * r * 2 }, (err, key) =>
      err ? reject(err) : resolve(key)
    );
  });
}

/** يجزّئ كلمة مرور جديدة */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const hash = await scryptAsync(password, salt, SCRYPT_N, SCRYPT_R, SCRYPT_P);
  return [
    "scrypt",
    SCRYPT_N,
    SCRYPT_R,
    SCRYPT_P,
    salt.toString("base64"),
    hash.toString("base64"),
  ].join(":");
}

/** يتحقق من كلمة مرور مقابل التجزئة المخزّنة — مقارنة ثابتة الزمن */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split(":");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [, nStr, rStr, pStr, saltB64, hashB64] = parts;
  const salt = Buffer.from(saltB64, "base64");
  const expected = Buffer.from(hashB64, "base64");
  try {
    const actual = await scryptAsync(password, salt, Number(nStr), Number(rStr), Number(pStr));
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

/**
 * تجزئة وهمية ثابتة — تُقارَن حين لا يوجد حساب أصلًا، كي يستغرق فشل
 * «بريد غير موجود» نفس زمن فشل «كلمة خاطئة» (منع كشف الحسابات بالتوقيت).
 */
export const DUMMY_HASH =
  "scrypt:32768:8:1:AAAAAAAAAAAAAAAAAAAAAA==:" +
  Buffer.alloc(KEY_LENGTH).toString("base64");

/** توكن عشوائي URL-safe — للجلسات وروابط الإنشاء/الاستعادة */
export function generateSecureToken(): string {
  return randomBytes(32).toString("base64url");
}

/** sha256 hex — لتخزين بصمة التوكن بدل التوكن نفسه */
export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}
