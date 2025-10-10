import type { ReactNode } from "react";

interface ContactInfoItemProps {
  icon: ReactNode;
  title: string;
  lines: string[];
  iconBgColor?: string;
  iconColor?: string;
}

export default function ContactInfoItem({
  icon,
  title,
  lines,
  iconBgColor = "bg-primary/10",
  iconColor = "text-primary",
}: ContactInfoItemProps) {
  return (
    <div className="flex items-start gap-4">
      <div
        className={`w-12 h-12 rounded-lg ${iconBgColor} flex items-center justify-center flex-shrink-0`}
      >
        <div className={iconColor}>{icon}</div>
      </div>
      <div>
        <h3 className="font-semibold mb-1">{title}</h3>
        {lines.map((line, idx) => (
          <p key={idx} className="text-foreground/70">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}
