import { PageHero, CTABanner } from "@/components/shared";
import {
  MissionSection,
  KeyFeaturesSection,
  TechStackSection,
} from "./components";

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
