import PageHero from "@/components/shared/PageHero/PageHero";
import CTABanner from "@/components/shared/CTABanner/CTABanner";
import ContactForm from "./components/ContactForm";
import ContactInfo from "./components/ContactInfo";

export const ContactPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <PageHero
        title="Зв'яжіться з нами"
        description="Маєте питання або пропозиції? Ми завжди раді допомогти!"
      />

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
          <ContactForm />
          <ContactInfo />
        </div>
      </section>

      <CTABanner
        title="Потрібна допомога?"
        description="Наша команда підтримки готова відповісти на всі ваші питання"
        buttonText="Повернутися на головну"
        buttonLink="/"
        gradient={false}
      />
    </div>
  );
};

export default ContactPage;
