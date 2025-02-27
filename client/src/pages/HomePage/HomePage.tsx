import { FAQSection } from "@/components/FAQSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { FooterSection } from "@/components/FooterSection";
import { HeroSection } from "@/components/HeroSection";

const HomePage = () => {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <FAQSection/>
      <FooterSection/>
    </>
  );
};

export default HomePage;
