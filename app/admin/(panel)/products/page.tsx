import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { getProducts } from "@/lib/products/getProducts";
import type { Product } from "@/lib/products/types";
import { updateProductAction, toggleProductAction } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "المنتجات — لوحة Momzy" };

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-heading text-h2 font-bold text-dark">المنتجات</h1>
        <Link
          href="/studio"
          target="_blank"
          className="inline-flex items-center gap-1.5 text-body-sm text-teal font-bold hover:underline"
        >
          إضافة منتج في Studio <ExternalLink size={15} />
        </Link>
      </div>
      <p className="text-mid text-body-sm mb-6">
        عدّلي السعر والمخزون والإظهار مباشرةً — التفاصيل الكاملة (الصور، القصة…) من Studio.
      </p>

      <div className="flex flex-col gap-3">
        {products.map((p) => (
          <ProductRow key={p.slug} product={p} />
        ))}
      </div>
    </div>
  );
}

function ProductRow({ product }: { product: Product }) {
  const canEdit = Boolean(product.id);

  return (
    <div className="bg-white rounded-[var(--rl)] border border-bord p-4 flex flex-col lg:flex-row lg:items-center gap-4">
      {/* الصورة + الاسم */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div
          className="w-14 h-14 rounded-[10px] overflow-hidden shrink-0"
          style={{ background: "linear-gradient(140deg, var(--rosepale), var(--tealpale))" }}
        >
          <Image
            src={product.mainImage}
            alt={product.title}
            width={56}
            height={56}
            className="w-14 h-14 object-cover"
            unoptimized
          />
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-dark text-body-sm truncate">{product.title}</div>
          <div className="text-micro text-light">{product.category}</div>
        </div>
      </div>

      {canEdit ? (
        <div className="flex flex-wrap items-end gap-3">
          {/* السعر + المخزون */}
          <form action={updateProductAction} className="flex items-end gap-2">
            <input type="hidden" name="id" value={product.id} />
            <label className="flex flex-col gap-1">
              <span className="text-micro text-light font-label">السعر ₪</span>
              <input
                name="price"
                type="number"
                min={0}
                defaultValue={product.price}
                className="w-24 px-2.5 py-2 rounded-lg border border-bord bg-offwh text-body-sm text-dark text-center focus:outline-none focus:border-rose"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-micro text-light font-label">المخزون</span>
              <input
                name="stock"
                type="number"
                min={0}
                defaultValue={product.stockQuantity ?? ""}
                placeholder="—"
                className="w-20 px-2.5 py-2 rounded-lg border border-bord bg-offwh text-body-sm text-dark text-center placeholder:text-light focus:outline-none focus:border-rose"
              />
            </label>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-dark text-white text-body-sm font-bold hover:brightness-125 transition"
            >
              حفظ
            </button>
          </form>

          {/* إظهار/إخفاء */}
          <form action={toggleProductAction}>
            <input type="hidden" name="id" value={product.id} />
            <input type="hidden" name="inStock" value={(!product.inStock).toString()} />
            <button
              type="submit"
              className="px-3.5 py-2 rounded-lg text-body-sm font-bold border transition"
              style={
                product.inStock
                  ? { background: "#DCFCE7", color: "#166534", borderColor: "#BBF7D0" }
                  : { background: "#F3F4F6", color: "#6B7280", borderColor: "var(--bord)" }
              }
            >
              {product.inStock ? "ظاهر ✓" : "مخفي"}
            </button>
          </form>

          {/* Studio */}
          <Link
            href="/studio"
            target="_blank"
            className="inline-flex items-center gap-1 text-micro text-teal font-bold hover:underline py-2"
          >
            التفاصيل <ExternalLink size={13} />
          </Link>
        </div>
      ) : (
        <span className="text-micro text-light">ارفعيه في Studio للتعديل</span>
      )}
    </div>
  );
}
