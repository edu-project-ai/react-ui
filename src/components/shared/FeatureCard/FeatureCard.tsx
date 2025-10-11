import type { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  iconGradient?: boolean;
}

export default function FeatureCard({
  icon,
  title,
  description,
  iconGradient = true,
}: FeatureCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div
        className={`w-12 h-12 rounded-lg ${iconGradient ? "bg-gradient-to-br from-primary to-accent" : "bg-primary/10"} flex items-center justify-center mb-4`}
      >
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-foreground/70">{description}</p>
    </div>
  );
}
