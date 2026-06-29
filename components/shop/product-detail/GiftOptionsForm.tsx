"use client";

import { useState } from "react";
import type { GiftOptions } from "@/lib/store/cart";

interface GiftOptionsFormProps {
  /** القيم الحالية */
  value: GiftOptions;
  /** عند التغيير */
  onChange: (gift: GiftOptions) => void;
  /** هل الخيارات مفعّلة (toggle رئيسي) */
  enabled: boolean;
  /** عند تبديل الـ toggle */
  onToggle: (enabled: boolean) => void;
}

const MESSAGE_MAX = 200;

/**
 * نموذج خيارات الهدية — يظهر على صفحة المنتج قبل أزرار الشراء
 * يسمح للمُهدية بإدخال رسالة + تفاصيل المستلِمة + تاريخ التوصيل
 */
export default function GiftOptionsForm({
  value,
  onChange,
  enabled,
  onToggle,
}: GiftOptionsFormProps) {
  const [charCount, setCharCount] = useState(value.message?.length ?? 0);

  function update<K extends keyof GiftOptions>(key: K, val: GiftOptions[K]) {
    onChange({ ...value, [key]: val });
  }

  /** حد أدنى = اليوم */
  const minDate = new Date().toISOString().slice(0, 10);

  return (
    <div className="mb-6">
      {/* ── Toggle رئيسي — هل الطلبية هدية؟ ── */}
      <label
        className="flex items-center gap-3 cursor-pointer p-4 rounded-[14px] [transition:background-color_180ms_ease,border-color_180ms_ease]"
        style={{
          background: enabled ? "var(--rosepale)" : "white",
          border: `1.5px solid ${enabled ? "var(--rose)" : "var(--bord)"}`,
        }}
      >
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onToggle(e.target.checked)}
          className="w-5 h-5 cursor-pointer accent-rose"
        />
        <div className="flex-1">
          <div className="font-heading font-bold text-body" style={{ color: "var(--dark)" }}>
            🎁 هذه الطلبية هدية
          </div>
          <div className="text-[12px] mt-0.5" style={{ color: "var(--mid)", fontFamily: "'Tajawal', sans-serif" }}>
            رسالة شخصية + شحن مباشر للمستلِمة + اختيار تاريخ التوصيل
          </div>
        </div>
      </label>

      {/* ── النموذج التفصيلي — يظهر فقط إذا فُعّل الـ Toggle ── */}
      {enabled && (
        <div
          className="mt-3 p-5 rounded-[14px] flex flex-col gap-4"
          style={{ background: "white", border: "1.5px solid var(--bord)" }}
        >
          {/* رسالة شخصية */}
          <div>
            <label className="block font-label font-bold text-[13px] mb-1.5" style={{ color: "var(--dark)" }}>
              ✏️ رسالة شخصية
              <span className="font-normal text-[11px] mr-2" style={{ color: "var(--light)" }}>
                ({charCount}/{MESSAGE_MAX})
              </span>
            </label>
            <textarea
              value={value.message ?? ""}
              maxLength={MESSAGE_MAX}
              onChange={(e) => {
                update("message", e.target.value);
                setCharCount(e.target.value.length);
              }}
              placeholder="اكتبي بطاقتك الشخصية... سنُرفقها مع الصندوق."
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-[10px] text-[14px] outline-none [transition:border-color_150ms_ease] focus:border-rose"
              style={{
                background: "var(--offwh)",
                color: "var(--dark)",
                border: "1.5px solid var(--bord)",
                fontFamily: "'Tajawal', sans-serif",
                resize: "vertical",
              }}
            />
          </div>

          {/* بيانات المستلِمة */}
          <div>
            <p className="font-label font-bold text-[13px] mb-2" style={{ color: "var(--dark)" }}>
              📦 بيانات المستلِمة
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={value.recipientName ?? ""}
                onChange={(e) => update("recipientName", e.target.value)}
                placeholder="اسم المستلِمة"
                className="px-3.5 py-2.5 rounded-[10px] text-[14px] outline-none focus:border-rose [transition:border-color_150ms_ease]"
                style={{ background: "var(--offwh)", color: "var(--dark)", border: "1.5px solid var(--bord)", fontFamily: "'Tajawal', sans-serif" }}
              />
              <input
                type="tel"
                value={value.recipientPhone ?? ""}
                onChange={(e) => update("recipientPhone", e.target.value)}
                placeholder="هاتف المستلِمة"
                dir="ltr"
                className="px-3.5 py-2.5 rounded-[10px] text-[14px] outline-none focus:border-rose [transition:border-color_150ms_ease]"
                style={{ background: "var(--offwh)", color: "var(--dark)", border: "1.5px solid var(--bord)", fontFamily: "'Tajawal', sans-serif", textAlign: "right" }}
              />
            </div>

            <input
              type="text"
              value={value.recipientAddress ?? ""}
              onChange={(e) => update("recipientAddress", e.target.value)}
              placeholder="العنوان (الشارع، رقم البيت)"
              className="w-full mt-3 px-3.5 py-2.5 rounded-[10px] text-[14px] outline-none focus:border-rose [transition:border-color_150ms_ease]"
              style={{ background: "var(--offwh)", color: "var(--dark)", border: "1.5px solid var(--bord)", fontFamily: "'Tajawal', sans-serif" }}
            />

            <input
              type="text"
              value={value.recipientCity ?? ""}
              onChange={(e) => update("recipientCity", e.target.value)}
              placeholder="المدينة"
              className="w-full mt-3 px-3.5 py-2.5 rounded-[10px] text-[14px] outline-none focus:border-rose [transition:border-color_150ms_ease]"
              style={{ background: "var(--offwh)", color: "var(--dark)", border: "1.5px solid var(--bord)", fontFamily: "'Tajawal', sans-serif" }}
            />
          </div>

          {/* تاريخ التوصيل */}
          <div>
            <label className="block font-label font-bold text-[13px] mb-1.5" style={{ color: "var(--dark)" }}>
              📅 تاريخ التوصيل المرغوب
            </label>
            <input
              type="date"
              value={value.deliveryDate ?? ""}
              min={minDate}
              onChange={(e) => update("deliveryDate", e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-[10px] text-[14px] outline-none focus:border-rose [transition:border-color_150ms_ease]"
              style={{ background: "var(--offwh)", color: "var(--dark)", border: "1.5px solid var(--bord)", fontFamily: "'Tajawal', sans-serif" }}
            />
            <p className="text-[11px] mt-1.5" style={{ color: "var(--light)", fontFamily: "'Tajawal', sans-serif" }}>
              💡 سنبذل قصارى جهدنا للوصول في التاريخ المختار. التاريخ الفعلي حسب توفّر شركة الشحن.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
