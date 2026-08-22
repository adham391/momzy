"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/lib/store/cart";
import QuantityInput from "@/components/shop/QuantityInput";
import CartGiftEditModal from "@/components/shop/CartGiftEditModal";
import type { CartItem } from "@/lib/store/cart";

interface CartItemRowProps {
  item: CartItem;
}

/** صف منتج واحد داخل السلة */
export default function CartItemRow({ item }: CartItemRowProps) {
  const removeItem        = useCart((s) => s.removeItem);
  const updateQuantity    = useCart((s) => s.updateQuantity);
  const getEffectivePrice = useCart((s) => s.getEffectivePrice);

  const [giftModalOpen, setGiftModalOpen] = useState(false);
  const isGift = !!item.gift;

  const unit = getEffectivePrice(item);
  const discounted = unit < item.price;

  return (
    <div
      className="py-4"
      style={{ borderBottom: "1px solid var(--bord)" }}
    >
      <div className="flex items-center gap-3">
        {/* صورة المنتج — placeholder ذهبي إذا الصورة مفقودة */}
        <div
          className="rounded-[12px] shrink-0 overflow-hidden flex items-center justify-center"
          style={{
            width: 64,
            height: 64,
            background: "linear-gradient(140deg, var(--rosepale), var(--tealpale))",
            border: "1px solid var(--bord)",
          }}
        >
          <Image
            src={item.mainImage}
            alt={item.title}
            width={64}
            height={64}
            className="w-full h-full object-cover"
            unoptimized
          />
        </div>

        {/* التفاصيل */}
        <div className="flex-1 min-w-0">
          <div className="font-heading text-[13px] font-semibold text-dark leading-snug truncate mb-1">
            {item.title}
          </div>
          <div className="font-label font-extrabold text-teal text-[14px] flex items-center gap-2 flex-wrap">
            <span>₪{unit * item.quantity}</span>
            {discounted && (
              <>
                <span className="font-normal line-through text-light text-[12px]">₪{item.price * item.quantity}</span>
                <span
                  className="font-bold text-[10px] px-1.5 py-0.5 rounded-full"
                  style={{ background: "var(--rosepale)", color: "var(--rose)" }}
                >
                  باقة
                </span>
              </>
            )}
          </div>

          <div className="mt-2">
            <QuantityInput
              size="sm"
              value={item.quantity}
              onChange={(q) => updateQuantity(item.id, q)}
              min={0}
            />
          </div>
        </div>

        {/* زر حذف */}
        <button
          onClick={() => removeItem(item.id)}
          aria-label="حذف المنتج"
          className="shrink-0 text-light hover:text-rose transition-colors font-label"
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, lineHeight: 1 }}
        >
          ×
        </button>
      </div>

      {/* ── شارة الهدية + معاينة + زر تعديل ── */}
      {isGift ? (
        <div
          className="mt-3 ms-[76px] p-3 rounded-[10px]"
          style={{ background: "var(--rosepale)", border: "1px solid rgba(242,167,181,0.30)" }}
        >
          <div className="flex items-center justify-between mb-1.5">
            <p className="font-label font-bold text-[11px]" style={{ color: "var(--rose)", letterSpacing: "1px" }}>
              🎁 هدية
            </p>
            <button
              onClick={() => setGiftModalOpen(true)}
              className="font-label text-[11px] hover:underline"
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--rose)" }}
            >
              ✏️ تعديل
            </button>
          </div>
          {item.gift?.recipientName && (
            <p className="text-[11px] mb-0.5" style={{ color: "var(--dark)", fontFamily: "'Tajawal', sans-serif" }}>
              <span className="font-bold">إلى:</span> {item.gift.recipientName}
            </p>
          )}
          {item.gift?.recipientEmail && (
            <p className="text-[11px] mb-0.5" style={{ color: "var(--dark)", fontFamily: "'Tajawal', sans-serif" }} dir="ltr">
              📧 {item.gift.recipientEmail}
            </p>
          )}
          {item.gift?.message && (
            <p className="text-[11px] line-clamp-2 italic" style={{ color: "var(--mid)", fontFamily: "'Tajawal', sans-serif" }}>
              &ldquo;{item.gift.message}&rdquo;
            </p>
          )}
        </div>
      ) : (
        /* ── زر "جعلها هدية" — للعناصر العادية ── */
        <div className="mt-2 ms-[76px]">
          <button
            onClick={() => setGiftModalOpen(true)}
            className="inline-flex items-center gap-1.5 font-label font-semibold text-[12px] px-3 py-1.5 rounded-full [transition:background-color_150ms_ease,color_150ms_ease]"
            style={{
              background: "var(--rosepale)",
              color: "var(--rose)",
              border: "1px dashed rgba(242,167,181,0.50)",
              cursor: "pointer",
            }}
          >
            🎁 جعلها هدية ←
          </button>
        </div>
      )}

      {/* Modal تعديل الهدية */}
      {giftModalOpen && (
        <CartGiftEditModal
          itemId={item.id}
          itemTitle={item.title}
          currentGift={item.gift}
          digital={item.isDigital}
          onClose={() => setGiftModalOpen(false)}
        />
      )}
    </div>
  );
}
