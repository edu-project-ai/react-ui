import PageHero from "@/components/shared/PageHero/PageHero";
import CTABanner from "@/components/shared/CTABanner/CTABanner";
import MissionSection from "./components/MissionSection";
import KeyFeaturesSection from "./components/KeyFeaturesSection";
import TechStackSection from "./components/TechStackSection";

export const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <PageHero
        title="Про Roadly"
        description="Інтелектуальна платформа для створення персоналізованих навчальних роутмап у програмуванні"
        gradient
      />

      <MissionSection />
      <KeyFeaturesSection />
      <TechStackSection />

      <CTABanner
        title="Готові почати свій шлях у програмуванні?"
        description="Приєднуйтесь до тисяч розробників, які вже обрали Roadly для навчання"
        buttonText="Почати безкоштовно"
        buttonLink="/register"
      />
    </div>
  );
};

export default AboutPage;
