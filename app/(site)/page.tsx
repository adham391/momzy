import HeroSection     from "@/components/home/HeroSection";
import LatestSection   from "@/components/home/LatestSection";
import OfferSection    from "@/components/home/OfferSection";
import HebaSection     from "@/components/home/HebaSection";
import ArticlesSection from "@/components/home/ArticlesSection";
import ReviewsSection  from "@/components/home/ReviewsSection";
import SectionsReveal  from "@/components/ui/SectionsReveal";

/** الصفحة الرئيسية — كل أقسام الهوم بيج */
export default function HomePage() {
  return (
    <>
      {/* كل قسم يحتوي على wave في أعلاه يتداخل مع القسم السابق */}
      <HeroSection />
      <LatestSection />
      <OfferSection />
      <HebaSection />
      <ArticlesSection />
      <ReviewsSection />

      {/* fadeInUp عند الـ scroll — يراقب كل .reveal-section */}
      <SectionsReveal />
    </>
  );
}
