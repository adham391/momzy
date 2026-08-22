import type { Product, ProductFilters } from "@/lib/products/types";
import { sanityFetch } from "@/lib/sanity/client";

/**
 * GROQ projection — يحوّل Sanity assets إلى URL strings
 * مطابق 1:1 مع Product interface في lib/products/types.ts
 * المكونات تتلقى نفس string paths — لا تغيير في الـ UI layer
 */
const PRODUCT_FIELDS = `{
  "id":            _id,
  "slug":          slug.current,
  title,
  description,
  price,
  compareAtPrice,
  category,
  label,
  badge,
  badgeColor,
  tags[] { label, color },
  inStock,
  stockQuantity,
  weight,
  longDescription,
  specifications,
  shippingInfo,
  "mainImage":     mainImage.asset->url,
  "gallery":       gallery[].asset->url,
  videoUrl,
  story {
    title,
    paragraphs,
    "image": image.asset->url
  },
  contents[] {
    name,
    description,
    "icon":  icon.asset->url,
    "image": image.asset->url
  },
  giftTargets[] {
    label,
    text
  },
  testimonials[] {
    name,
    location,
    text,
    rating,
    "image": image.asset->url
  },
  faqs[] {
    question,
    answer
  },
  bookletHook,
  bookletAbout,
  bookletChapters,
  bookletBenefits,
  bookletAudience,
  "digitalFile": digitalFile.asset->url,
  "createdAt": _createdAt,
  "updatedAt": _updatedAt
}`;

/** جلب منتج واحد بالـ slug */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const query = `*[_type == "product" && slug.current == $slug][0]${PRODUCT_FIELDS}`;
  return sanityFetch<Product>(query, { slug });
}

/** جلب كل المنتجات مع فلترة اختيارية */
export async function getAllProducts(filters?: ProductFilters): Promise<Product[]> {
  const conditions: string[] = ['_type == "product"'];

  if (filters?.inStockOnly) conditions.push("inStock == true");
  if (filters?.category)    conditions.push(`category == $category`);

  const filter = conditions.join(" && ");
  const order  = "| order(_createdAt desc)";
  const limit  = filters?.limit ? `[0...${filters.limit}]` : "";
  const query  = `*[${filter}]${order}${limit}${PRODUCT_FIELDS}`;
  const params = filters?.category ? { category: filters.category } : {};

  const result = await sanityFetch<Product[]>(query, params);
  return result ?? [];
}

/** جلب slugs كل المنتجات — لـ generateStaticParams */
export async function getAllProductSlugs(): Promise<string[]> {
  const query  = `*[_type == "product" && defined(slug.current)].slug.current`;
  const result = await sanityFetch<string[]>(query, {}, 3600);
  return result ?? [];
}

/** جلب التصنيفات الفريدة من المنتجات الموجودة */
export async function getProductCategories(): Promise<string[]> {
  const query  = `array::unique(*[_type == "product"].category)`;
  const result = await sanityFetch<string[]>(query);
  return result ?? [];
}
