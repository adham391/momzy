/**
 * يحوّل صفوفاً إلى نص CSV.
 * - BOM (﻿) في البداية ليفتح Excel العربية بترميز UTF-8 صحيح.
 * - تهريب الحقول التي تحوي فاصلة/اقتباس/سطر جديد.
 */
export function toCSV(headers: string[], rows: (string | number)[][]): string {
  const esc = (v: string | number) => {
    const s = String(v ?? "");
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))];
  return "﻿" + lines.join("\r\n");
}
