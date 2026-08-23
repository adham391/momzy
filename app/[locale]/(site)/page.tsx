import HeroSection        from "@/components/home/HeroSection";
import WhyMomzySection    from "@/components/home/WhyMomzySection";
import BestSellersSection from "@/components/home/BestSellersSection";
import HebaSection        from "@/components/home/HebaSection";
import ArticlesSection    from "@/components/home/ArticlesSection";
import ReviewsSection     from "@/components/home/ReviewsSection";
import SectionsReveal     from "@/components/ui/SectionsReveal";
import { getHomePage }    from "@/lib/sanity/queries/homePage";

/** الصفحة الرئيسية — المحتوى قابل للتعديل من Sanity (مع fallback) */
export default async function HomePage() {
  const home = await getHomePage();

  return (
    <>
      {/* كل قسم يحتوي على wave في أعلاه يتداخل مع القسم السابق */}
      <HeroSection content={home} />
      <WhyMomzySection content={home} />
      <BestSellersSection content={home} />
      <HebaSection content={home} />
      <ArticlesSection content={home} />
      <ReviewsSection content={home} />

      {/* fadeInUp عند الـ scroll — يراقب كل .reveal-section */}
      <SectionsReveal />
    </>
  );
}
