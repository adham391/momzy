"use server";

import { revalidatePath } from "next/cache";
import { sanityWriteClient } from "@/lib/sanity/client";

/** يعيد التحقق من الصفحات التي تعرض المنتجات بعد التعديل */
function revalidateProductPages() {
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
}

/** تحديث السعر والمخزون لمنتج (patch في Sanity) */
export async function updateProductAction(formData: FormData) {
  const id = String(formData.get("id"));
  const price = Number(formData.get("price"));
  const stockRaw = formData.get("stock");
  if (!id || !Number.isFinite(price) || price < 0) return;

  const set: Record<string, number> = { price };
  if (stockRaw !== null && String(stockRaw).trim() !== "") {
    const stock = Number(stockRaw);
    if (Number.isFinite(stock) && stock >= 0) set.stockQuantity = Math.floor(stock);
  }

  await sanityWriteClient.patch(id).set(set).commit();
  revalidateProductPages();
}

/** إظهار/إخفاء منتج (inStock) */
export async function toggleProductAction(formData: FormData) {
  const id = String(formData.get("id"));
  const inStock = String(formData.get("inStock")) === "true";
  if (!id) return;

  await sanityWriteClient.patch(id).set({ inStock }).commit();
  revalidateProductPages();
}
