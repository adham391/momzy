import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/lib/products/types";

/* ── أنواع السلة ─────────────────────────────────────── */

/** خيارات الهدية — لكل عنصر بشكل مستقل */
export interface GiftOptions {
  /** رسالة شخصية للمستلِمة */
  message?: string;
  /** اسم المستلِمة */
  recipientName?: string;
  /** هاتف المستلِمة (للتنسيق مع شركة الشحن) */
  recipientPhone?: string;
  /** عنوان المستلِمة الكامل */
  recipientAddress?: string;
  /** مدينة المستلِمة */
  recipientCity?: string;
  /** تاريخ التوصيل المرغوب — ISO date string */
  deliveryDate?: string;
}

/** عنصر داخل السلة */
export interface CartItem {
  /** معرّف فريد للعنصر داخل السلة (يدعم نفس المنتج بخيارات هدية مختلفة) */
  id: string;
  slug: string;
  title: string;
  mainImage: string;
  price: number;
  quantity: number;
  /** خيارات الهدية — اختياري */
  gift?: GiftOptions;
}

/** معلومات آخر منتج أُضيف — يستخدمها CartAddedModal */
export interface LastAdded {
  title: string;
  price: number;
  mainImage: string;
  timestamp: number;
}

/* ── واجهة الـ Store ──────────────────────────────────── */

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  lastAdded: LastAdded | null;

  /** إضافة منتج — يدمج بالـ slug إذا بدون هدية، يضيف عنصراً جديداً إذا هدية */
  addItem: (product: Product, gift?: GiftOptions) => void;
  /** إضافة بصمت — بدون تشغيل modal (لـ اشتري الآن) */
  addItemSilent: (product: Product, gift?: GiftOptions) => void;
  /** حذف عنصر بالـ id الفريد */
  removeItem: (id: string) => void;
  /** تحديث كمية عنصر (0 = حذف) */
  updateQuantity: (id: string, quantity: number) => void;
  /** ضبط أو إزالة خيارات الهدية لعنصر موجود */
  setGift: (id: string, gift?: GiftOptions) => void;
  /** تفريغ السلة */
  clearCart: () => void;
  /** فتح السلة */
  openCart: () => void;
  /** إغلاق السلة */
  closeCart: () => void;

  /** العدد الكلي للعناصر */
  getCount: () => number;
  /** المجموع الكلي بالشيكل */
  getTotal: () => number;
}

/* ── مساعدات ─────────────────────────────────────────── */

/** هل هذا العنصر يحتوي على خيارات هدية فعّالة؟ */
function hasGiftData(gift?: GiftOptions): boolean {
  if (!gift) return false;
  return Boolean(
    gift.message ||
    gift.recipientName ||
    gift.recipientAddress ||
    gift.deliveryDate
  );
}

/** إنشاء id فريد لعنصر السلة */
function generateCartItemId(slug: string, isGift: boolean): string {
  return isGift ? `${slug}-gift-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` : slug;
}

/** بناء عنصر سلة جديد */
function buildCartItem(product: Product, gift?: GiftOptions): CartItem {
  const isGift = hasGiftData(gift);
  return {
    id:        generateCartItemId(product.slug, isGift),
    slug:      product.slug,
    title:     product.title,
    mainImage: product.mainImage,
    price:     product.price,
    quantity:  1,
    ...(isGift && gift ? { gift } : {}),
  };
}

/* ── الـ Store مع persist ────────────────────────────── */

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      lastAdded: null,

      addItem: (product, gift) => {
        const { items } = get();
        const isGift = hasGiftData(gift);

        const lastAdded: LastAdded = {
          title: product.title,
          price: product.price,
          mainImage: product.mainImage,
          timestamp: Date.now(),
        };

        // عناصر الهدية → دائماً جديدة (لا تُدمج)
        if (isGift) {
          set({ items: [...items, buildCartItem(product, gift)], lastAdded });
          return;
        }

        // عناصر عادية → تُدمج بالـ slug
        const existing = items.find((i) => i.slug === product.slug && !i.gift);
        if (existing) {
          set({
            items: items.map((i) =>
              i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
            lastAdded,
          });
        } else {
          set({ items: [...items, buildCartItem(product)], lastAdded });
        }
      },

      addItemSilent: (product, gift) => {
        const { items } = get();
        const isGift = hasGiftData(gift);

        if (isGift) {
          set({ items: [...items, buildCartItem(product, gift)] });
          return;
        }

        const existing = items.find((i) => i.slug === product.slug && !i.gift);
        if (existing) {
          set({
            items: items.map((i) =>
              i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
        } else {
          set({ items: [...items, buildCartItem(product)] });
        }
      },

      removeItem: (id) =>
        set({ items: get().items.filter((i) => i.id !== id) }),

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          ),
        });
      },

      setGift: (id, gift) => {
        const isGift = hasGiftData(gift);
        set({
          items: get().items.map((i) => {
            if (i.id !== id) return i;

            if (isGift && gift) {
              // إذا الـ id الحالي = slug (عنصر عادي) → نُولّد id فريد للهدية
              // لتجنّب تضارب مع إضافات لاحقة لنفس المنتج
              const newId = i.id === i.slug
                ? generateCartItemId(i.slug, true)
                : i.id;
              return { ...i, id: newId, gift };
            }

            // إزالة الهدية → نُعيد العنصر بدون gift و نعيد id إلى slug
            const { gift: _drop, ...rest } = i;
            void _drop;
            return { ...rest, id: rest.slug } as CartItem;
          }),
        });
      },

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),

      closeCart: () => set({ isOpen: false }),

      getCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      getTotal: () =>
        get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),
    }),
    {
      name: "momzy-cart",
      partialize: (state) => ({ items: state.items }),
      version: 2,
      /** ترقية البيانات القديمة (slug-only) إلى الـ schema الجديد (id) */
      migrate: (persistedState: unknown, version: number) => {
        if (version === 0 || version === 1) {
          const old = persistedState as { items?: Array<Omit<CartItem, "id"> & { id?: string }> };
          if (old?.items) {
            return {
              items: old.items.map((item) => ({
                ...item,
                id: item.id ?? item.slug,
              })),
            } as { items: CartItem[] };
          }
        }
        return persistedState as { items: CartItem[] };
      },
    }
  )
);
