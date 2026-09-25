import type { Metadata } from "next";
import { HOME_META, asLocale, pageSeo } from "@/lib/seo/site";
import HeroSection        from "@/components/home/HeroSection";
import LaunchBanner       from "@/components/home/LaunchBanner";
import WhyMomzySection    from "@/components/home/WhyMomzySection";
import BestSellersSection from "@/components/home/BestSellersSection";
import HebaSection        from "@/components/home/HebaSection";
import ArticlesSection    from "@/components/home/ArticlesSection";
import ChannelSection     from "@/components/home/ChannelSection";
import ReviewsSection     from "@/components/home/ReviewsSection";
import SectionsReveal     from "@/components/ui/SectionsReveal";
import { getHomePage }    from "@/lib/sanity/queries/homePage";

/** عنوان الرئيسية ووصفها — فيهما الاسم كما يكتبه الناس (Momzy / مومزي / מומזי) */
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const meta = HOME_META[asLocale(locale)];
  return pageSeo({ path: "", locale, title: meta.title, description: meta.description });
}

/** الصفحة الرئيسية — المحتوى قابل للتعديل من Sanity (مع fallback) */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const home = await getHomePage(locale);

  return (
    <>
      {/* كل قسم يحتوي على wave في أعلاه يتداخل مع القسم السابق */}
      <HeroSection content={home} />
      {/* بانر الإعلانات تحت الهيرو — يختفي وحده حين تنتهي العروض */}
      <LaunchBanner />
      <WhyMomzySection content={home} />
      <BestSellersSection content={home} />
      <HebaSection content={home} />
      <ArticlesSection content={home} />
      <ChannelSection />
      <ReviewsSection content={home} />

      {/* fadeInUp عند الـ scroll — يراقب كل .reveal-section */}
      <SectionsReveal />
    </>
  );
}
