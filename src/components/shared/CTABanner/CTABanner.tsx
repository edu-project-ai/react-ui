import { Link } from "react-router";
import { Button } from "@/components/ui/button";

interface CTABannerProps {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  gradient?: boolean;
}

export default function CTABanner({
  title,
  description,
  buttonText,
  buttonLink,
  gradient = true,
}: CTABannerProps) {
  return (
    <section
      className={`py-20 px-4 sm:px-6 lg:px-8 ${gradient ? "bg-gradient-to-br from-primary to-accent" : "bg-muted/30"}`}
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2
          className={`text-3xl md:text-4xl font-bold mb-6 ${gradient ? "text-white" : ""}`}
        >
          {title}
        </h2>
        <p
          className={`text-lg mb-8 max-w-2xl mx-auto ${gradient ? "text-white/90" : "text-foreground/70"}`}
        >
          {description}
        </p>
        <Link to={buttonLink}>
          <Button
            variant={gradient ? "outline" : "default"}
            className={
              gradient
                ? "bg-white text-primary hover:bg-white/90 border-white dark:bg-white dark:text-primary dark:hover:bg-white/90 dark:border-white"
                : ""
            }
          >
            {buttonText}
          </Button>
        </Link>
      </div>
    </section>
  );
}
