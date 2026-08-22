"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useCart, type GiftOptions } from "@/lib/store/cart";
import GiftOptionsForm from "./product-detail/GiftOptionsForm";

interface CartGiftEditModalProps {
  /** id عنصر السلة */
  itemId: string;
  /** عنوان المنتج للعرض في الـ modal */
  itemTitle: string;
  /** القيم الحالية للهدية إن وُجدت */
  currentGift?: GiftOptions;
  /** منتج رقمي — نموذج هدية بالبريد بدل عنوان الشحن */
  digital?: boolean;
  /** عند الإغلاق */
  onClose: () => void;
}

/** Modal لتحويل عنصر السلة إلى هدية أو تعديل خياراتها */
export default function CartGiftEditModal({
  itemId,
  itemTitle,
  currentGift,
  digital = false,
  onClose,
}: CartGiftEditModalProps) {
  const setGift = useCart((s) => s.setGift);

  /** إذا فيه بيانات حالية → نبدأ بـ enabled */
  const hasInitialGift = !!currentGift && Object.values(currentGift).some(Boolean);
  const [enabled, setEnabled] = useState(hasInitialGift);
  const [draft, setDraft]     = useState<GiftOptions>(currentGift ?? {});

  /** قفل scroll الصفحة الخلفية */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  function handleSave() {
    if (enabled) {
      setGift(itemId, draft);
    } else {
      setGift(itemId, undefined);
    }
    onClose();
  }

  function handleRemoveGift() {
    setGift(itemId, undefined);
    onClose();
  }

  return createPortal(
    <>
      {/* Overlay */}
      <div
        role="presentation"
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(37,34,32,0.5)",
          backdropFilter: "blur(4px)",
          zIndex: 900,
          animation: "fadeIn 0.2s ease",
        }}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="gift-edit-title"
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white overflow-y-auto"
        style={{
          width: "min(560px, calc(100vw - 32px))",
          maxHeight: "calc(100vh - 64px)",
          borderRadius: 20,
          zIndex: 910,
          boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
        }}
      >
        {/* الهيدر */}
        <div
          className="flex items-center justify-between"
          style={{
            padding: "18px 22px",
            borderBottom: "1.5px solid var(--bord)",
          }}
        >
          <div>
            <h2 id="gift-edit-title" className="font-heading font-bold text-[18px]" style={{ color: "var(--dark)" }}>
              🎁 خيارات الهدية
            </h2>
            <p className="text-[12px] mt-0.5" style={{ color: "var(--mid)", fontFamily: "'Tajawal', sans-serif" }}>
              {itemTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="w-9 h-9 rounded-full flex items-center justify-center text-light hover:bg-rosepale hover:text-rose transition-colors"
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        {/* المحتوى */}
        <div style={{ padding: "20px 22px" }}>
          <GiftOptionsForm
            enabled={enabled}
            onToggle={setEnabled}
            value={draft}
            onChange={setDraft}
            digital={digital}
          />
        </div>

        {/* الفوتر */}
        <div
          className="flex items-center justify-between gap-3"
          style={{
            padding: "14px 22px",
            borderTop: "1.5px solid var(--bord)",
            background: "var(--offwh)",
          }}
        >
          {hasInitialGift ? (
            <button
              onClick={handleRemoveGift}
              className="font-label text-[13px] text-light hover:text-rose transition-colors"
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              إزالة الهدية
            </button>
          ) : (
            <span />
          )}

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="font-label font-semibold text-[13px] text-mid"
              style={{
                background: "none",
                border: "1.5px solid var(--bord)",
                borderRadius: 50,
                padding: "9px 20px",
                cursor: "pointer",
              }}
            >
              إلغاء
            </button>
            <button
              onClick={handleSave}
              className="font-label font-bold text-[13px] [transition:transform_180ms_ease] hover:-translate-y-[1px]"
              style={{
                background: "var(--rose)",
                color: "var(--dark)",
                border: "none",
                borderRadius: 50,
                padding: "9px 22px",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(242,167,181,0.4)",
              }}
            >
              حفظ
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
