interface PageHeroProps {
  title: string;
  description: string;
  gradient?: boolean;
}

export default function PageHero({
  title,
  description,
  gradient = false,
}: PageHeroProps) {
  return (
    <section
      className={`relative py-20 px-4 sm:px-6 lg:px-8 ${gradient ? "bg-gradient-to-br from-primary/5 to-accent/5" : ""}`}
    >
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {title}
        </h1>
        <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
          {description}
        </p>
      </div>
    </section>
  );
}
