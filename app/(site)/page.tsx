import HeroSection        from "@/components/home/HeroSection";
import WhyMomzySection    from "@/components/home/WhyMomzySection";
import BestSellersSection from "@/components/home/BestSellersSection";
import HebaSection        from "@/components/home/HebaSection";
import ArticlesSection    from "@/components/home/ArticlesSection";
import ReviewsSection     from "@/components/home/ReviewsSection";
import SectionsReveal     from "@/components/ui/SectionsReveal";

/** الصفحة الرئيسية — كل أقسام الهوم بيج */
export default function HomePage() {
  return (
    <>
      {/* كل قسم يحتوي على wave في أعلاه يتداخل مع القسم السابق */}
      <HeroSection />
      <WhyMomzySection />
      <BestSellersSection />
      <HebaSection />
      <ArticlesSection />
      <ReviewsSection />

      {/* fadeInUp عند الـ scroll — يراقب كل .reveal-section */}
      <SectionsReveal />
    </>
  );
}
