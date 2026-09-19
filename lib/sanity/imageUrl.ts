/**
 * روابط صور Sanity بحجم مناسب — دوال صافية بلا أي استيراد، آمنة للعميل والسيرفر.
 *
 * Sanity CDN يقبل العرض والجودة والصيغة في الرابط نفسه، فلا يُرسَل الأصل (عدة ميغابايت)
 * لبطاقة عرضها 300 بكسل. auto=format يرسل WebP/AVIF للمتصفحات التي تدعمها.
 */

const SANITY_IMAGES_CDN = "https://cdn.sanity.io/images/";

/** جودة الضغط الافتراضية — لا فرق مرئيًا عن الأصل في الصور الفوتوغرافية */
const DEFAULT_QUALITY = 75;

/** هل الرابط صورة من Sanity CDN؟ الصور المحلية (public) تبقى كما هي */
export function isSanityImage(url: string | undefined): url is string {
  return Boolean(url && url.startsWith(SANITY_IMAGES_CDN));
}

/** رابط الصورة بعرض أقصى محدد — لا يكبّر صورة أصغر من العرض المطلوب (fit=max) */
export function sanityImageAt(url: string, width: number, quality = DEFAULT_QUALITY): string {
  if (!isSanityImage(url)) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}w=${width}&q=${quality}&fit=max&auto=format`;
}

/** srcset بعدة عروض — المتصفح يختار الأنسب لشاشته وكثافة بكسلاتها */
export function sanityImageSrcSet(url: string, widths: readonly number[]): string | undefined {
  if (!isSanityImage(url)) return undefined;
  return widths.map((w) => `${sanityImageAt(url, w)} ${w}w`).join(", ");
}
