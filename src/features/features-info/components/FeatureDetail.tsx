import type { ReactNode } from "react";

interface FeatureChecklistItemProps {
  text: string;
  iconColor?: string;
}

function ChecklistItem({
  text,
  iconColor = "text-primary",
}: FeatureChecklistItemProps) {
  return (
    <li className="flex items-start gap-3">
      <svg
        className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-1`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
      <span className="text-foreground/80">{text}</span>
    </li>
  );
}

interface FeatureDetailProps {
  badge: {
    icon: ReactNode;
    text: string;
    color: string;
  };
  title: string;
  description: string;
  checklist: string[];
  illustration: ReactNode;
  reverse?: boolean;
}

export default function FeatureDetail({
  badge,
  title,
  description,
  checklist,
  illustration,
  reverse = false,
}: FeatureDetailProps) {
  const iconColor = badge.color === "primary" ? "text-primary" : "text-accent";

  return (
    <div className="grid md:grid-cols-2 gap-12 items-center">
      <div className={reverse ? "order-2 md:order-1" : ""}>{illustration}</div>
      <div className={reverse ? "order-1 md:order-2" : ""}>
        <div
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-${badge.color}/10 text-${badge.color} text-sm font-medium mb-4`}
        >
          {badge.icon}
          {badge.text}
        </div>
        <h2 className="text-3xl font-bold mb-4">{title}</h2>
        <p className="text-lg text-foreground/70 mb-6">{description}</p>
        <ul className="space-y-3">
          {checklist.map((item, idx) => (
            <ChecklistItem key={idx} text={item} iconColor={iconColor} />
          ))}
        </ul>
      </div>
    </div>
  );
}
