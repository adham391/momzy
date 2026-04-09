import HeroSection from "@/components/home/HeroSection";
import LatestSection from "@/components/home/LatestSection";
import OfferSection from "@/components/home/OfferSection";
import HebaSection from "@/components/home/HebaSection";
import ArticlesSection from "@/components/home/ArticlesSection";
import ReviewsSection from "@/components/home/ReviewsSection";

/** الصفحة الرئيسية — كل أقسام الهوم بيج */
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <LatestSection />
      <OfferSection />
      <HebaSection />
      <ArticlesSection />
      <ReviewsSection />
    </>
  );
}
