import type { Product, ProductFilters } from "@/lib/products/types";
import { sanityFetch } from "@/lib/sanity/client";
import { tf, tl, activeLocale } from "@/lib/sanity/i18n";

/**
 * GROQ projection — يحوّل Sanity assets إلى URL strings ويحلّ الحقول المُدوّلة
 * إلى نص اللغة الفعّالة ($loc) مع سقوط للعربية.
 * المكونات تتلقى نفس string paths — لا تغيير في الـ UI layer.
 */
const PRODUCT_FIELDS = `{
  "id":            _id,
  "slug":          slug.current,
  ${tf("title")},
  ${tf("description")},
  price,
  compareAtPrice,
  category,
  ${tf("label")},
  ${tf("badge")},
  badgeColor,
  tags[] { ${tf("label")}, color },
  inStock,
  stockQuantity,
  weight,
  ${tf("longDescription")},
  specifications[] { ${tf("key")}, ${tf("value")} },
  shippingInfo { ${tf("estimatedDays")}, freeShipping, ${tf("notes")} },
  "mainImage":     mainImage.asset->url,
  "gallery":       gallery[].asset->url,
  videoUrl,
  story {
    ${tf("title")},
    ${tl("paragraphs")},
    "image": image.asset->url
  },
  contents[] {
    ${tf("name")},
    ${tf("description")},
    "icon":  icon.asset->url,
    "image": image.asset->url
  },
  giftTargets[] {
    ${tf("label")},
    ${tf("text")}
  },
  testimonials[] {
    name,
    ${tf("location")},
    ${tf("text")},
    rating,
    "image": image.asset->url
  },
  faqs[] {
    ${tf("question")},
    ${tf("answer")}
  },
  ${tf("bookletHook")},
  ${tl("bookletAbout")},
  ${tl("bookletChapters")},
  ${tl("bookletBenefits")},
  ${tl("bookletAudience")},
  "digitalFile": digitalFile.asset->url,
  "createdAt": _createdAt,
  "updatedAt": _updatedAt
}`;

/** جلب منتج واحد بالـ slug */
export async function getProductBySlug(slug: string, locale?: string): Promise<Product | null> {
  const loc = await activeLocale(locale);
  const query = `*[_type == "product" && slug.current == $slug][0]${PRODUCT_FIELDS}`;
  return sanityFetch<Product>(query, { slug, loc });
}

/** جلب كل المنتجات مع فلترة اختيارية */
export async function getAllProducts(filters?: ProductFilters, locale?: string): Promise<Product[]> {
  const loc = await activeLocale(locale);
  const conditions: string[] = ['_type == "product"'];

  if (filters?.inStockOnly) conditions.push("inStock == true");
  if (filters?.category)    conditions.push(`category == $category`);

  const filter = conditions.join(" && ");
  const order  = "| order(_createdAt desc)";
  const limit  = filters?.limit ? `[0...${filters.limit}]` : "";
  const query  = `*[${filter}]${order}${limit}${PRODUCT_FIELDS}`;
  const params: Record<string, unknown> = { loc };
  if (filters?.category) params.category = filters.category;

  const result = await sanityFetch<Product[]>(query, params);
  return result ?? [];
}

/** جلب slugs كل المنتجات — لـ generateStaticParams (لا يحتاج لغة) */
export async function getAllProductSlugs(): Promise<string[]> {
  const query  = `*[_type == "product" && defined(slug.current)].slug.current`;
  const result = await sanityFetch<string[]>(query, {}, 3600);
  return result ?? [];
}

/** جلب التصنيفات الفريدة من المنتجات الموجودة (category غير مُدوّل) */
export async function getProductCategories(): Promise<string[]> {
  const query  = `array::unique(*[_type == "product"].category)`;
  const result = await sanityFetch<string[]>(query);
  return result ?? [];
}
