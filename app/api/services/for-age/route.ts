import { NextResponse } from "next/server";
import { getAllServices } from "@/lib/sanity/queries/services";
import { hasAgeGate } from "@/lib/utils/age";

/** أقصى عدد اقتراحات — الصندوق يُقرأ بنظرة */
const MAX_SUGGESTIONS = 4;

/** خدمة مقترحة كما تعرضها نافذة التسجيل */
export interface ServiceForAge {
  slug: string;
  title: string;
  /** الفئة العمرية كنصّ («4 أشهر - سنة») — فارغ للخدمات بلا فئة */
  ageRange: string | null;
  price: number | null;
}

/**
 * GET /api/services/for-age?months=24&exclude=sensory-workshop&locale=ar
 *
 * الخدمات التي تناسب عمرًا معيّنًا — تُعرض للأم حين يُرفض عمر طفلها في ورشة،
 * فلا تُترك أمام بابٍ مغلق بل تُدلّ على البديل المناسب لطفلها.
 *
 * «تناسب» = الفئة العمرية تشمل العمر، أو الخدمة بلا فئة أصلًا (مفتوحة للجميع).
 * الأدقّ أولًا: ذوات الفئة قبل المفتوحة.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const months = Number(searchParams.get("months"));
  const exclude = searchParams.get("exclude");
  const locale = searchParams.get("locale") ?? undefined;

  if (!Number.isFinite(months) || months < 0) {
    return NextResponse.json({ services: [] });
  }

  const all = await getAllServices(undefined, locale);

  const gated: ServiceForAge[] = [];
  const open: ServiceForAge[] = [];

  for (const service of all) {
    if (service.slug === exclude) continue;

    const entry: ServiceForAge = {
      slug: service.slug,
      title: service.title,
      ageRange: service.ageRange ?? null,
      price: service.price ?? null,
    };

    if (!hasAgeGate(service)) {
      open.push(entry);
      continue;
    }
    const min = service.ageMinMonths;
    const max = service.ageMaxMonths;
    const fitsMin = typeof min !== "number" || months >= min;
    const fitsMax = typeof max !== "number" || months <= max;
    if (fitsMin && fitsMax) gated.push(entry);
  }

  // صندوق داخل نموذج التسجيل — قائمة قصيرة تُقرأ بنظرة، لا فهرس خدمات
  return NextResponse.json({ services: [...gated, ...open].slice(0, MAX_SUGGESTIONS) });
}
