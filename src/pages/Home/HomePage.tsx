import React from "react";
import { HeroSection, FeaturesSection, CTASection } from "@/features/home";

export const HomePage: React.FC = () => {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <CTASection />
    </>
  );
};

export default HomePage;
