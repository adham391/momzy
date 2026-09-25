import { getTranslations } from "next-intl/server";
import { getProducts } from "@/lib/products/getProducts";
import { BUNDLE_RULES } from "@/lib/bundles";
import LaunchBannerCarousel, { type BannerSlide } from "./LaunchBannerCarousel";

/** أيقونة الشحن في `public/icons` — نفسها المستعملة في صفحة المنتج */
const SHIPPING_ICON = "/icons/shipping-icon.png";

/**
 * بانر الإعلانات تحت الهيرو — شرائح تتبدّل تلقائيًا (عرض · باقة · شحن).
 *
 * الشرائح تُبنى من البيانات لا من صور مصمَّمة: صورة المنتج نفسها + نصّ + سعر،
 * فتُبنى وتُترجَم وتستجيب للشاشة كأي جزء من الموقع. و**كل رقم من مصدره**
 * (أسعار Sanity · `BUNDLE_RULES` · حقل الشحن المجاني): ينتهي العرض في مصدره
 * ⇒ تختفي شريحته، وبلا عرض سارٍ يختفي البانر كلّه.
 */
export default async function LaunchBanner() {
  const t = await getTranslations("home.launchOffers");
  const products = await getProducts();

  const bundleRule = BUNDLE_RULES[0] ?? null;
  const box = products.find((p) => p.slug === bundleRule?.requires) ?? null;
  if (!box) return null;

  const slides: BannerSlide[] = [];
  const boxPieces = box.contents?.length ?? 0;
  const boxFreeShipping = box.shippingInfo?.freeShipping === true;

  /* ① خصم الصندوق — من السعر قبل الخصم */
  const boxSaving = box.compareAtPrice && box.compareAtPrice > box.price ? box.compareAtPrice - box.price : null;
  if (boxSaving) {
    slides.push({
      key: "box",
      tone: "olive",
      eyebrow: t("launchPrice"),
      title: box.title,
      /*
       * عدد القطع من محتويات الصندوق نفسها — لا رقم مكتوب يتقادم حين تغيّرها هبة.
       * وذكرُ الشحن المجاني يتبع حقل المنتج: ينتهي العرض ⇒ يسقط من النصّ وحده.
       */
      text: boxPieces
        ? t(boxFreeShipping ? "boxTextFreeShipping" : "boxText", { count: boxPieces })
        : box.description,
      badge: t("save", { amount: money(boxSaving) }),
      price: `₪${box.price}`,
      oldPrice: box.compareAtPrice ? `₪${box.compareAtPrice}` : null,
      imageKind: "photo",
      image: box.mainImage,
      href: `/shop/${box.slug}`,
      cta: t("boxCta"),
    });
  }

  /* ② الباقة — سعر الكتيب مع الصندوق */
  const bundleTarget = bundleRule ? (products.find((p) => p.slug === bundleRule.target) ?? null) : null;
  if (bundleRule && bundleTarget && bundleTarget.price > bundleRule.bundlePrice) {
    slides.push({
      key: "bundle",
      tone: "teal",
      eyebrow: t("bundleEyebrow"),
      title: t("bundleTitle"),
      text: t("bundleText", {
        item: bundleTarget.title,
        price: money(bundleRule.bundlePrice),
        old: money(bundleTarget.price),
      }),
      badge: t("save", { amount: money(bundleTarget.price - bundleRule.bundlePrice) }),
      price: `₪${bundleRule.bundlePrice}`,
      oldPrice: `₪${bundleTarget.price}`,
      imageKind: "photo",
      image: bundleTarget.mainImage,
      href: `/shop/${box.slug}`,
      cta: t("bundleCta"),
    });
  }

  /* ③ الشحن المجاني — من حقل المنتج في Studio */
  if (boxFreeShipping) {
    slides.push({
      key: "shipping",
      tone: "rose",
      eyebrow: t("shippingEyebrow"),
      title: t("shippingTitle"),
      // على أي منتج ولأي مدّة — الهدية على الصندوق وحده، ومؤقّتة
      text: t("shippingText", { item: box.title }),
      badge: t("freeBadge"),
      price: null,
      oldPrice: null,
      // أيقونة الشحن لا صورة الصندوق: الشريحة تتكلّم عن الشحن لا عن المنتج
      image: SHIPPING_ICON,
      imageKind: "icon",
      href: `/shop/${box.slug}`,
      cta: t("boxCta"),
    });
  }

  if (slides.length === 0) return null;

  return (
    <LaunchBannerCarousel
      slides={slides}
      labels={{ previous: t("previous"), next: t("next"), goTo: t("goToSlide") }}
    />
  );
}

/**
 * مبلغ بالشيكل — معزول ثنائي الاتجاه (U+2066…U+2069) كي تبقى ₪ قبل الرقم
 * حين يقع المبلغ داخل جملة عربية.
 */
function money(amount: number): string {
  return `⁦₪${Math.round(amount)}⁩`;
}
