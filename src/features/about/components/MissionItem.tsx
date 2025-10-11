interface MissionItemProps {
  title: string;
  description: string;
}

export default function MissionItem({ title, description }: MissionItemProps) {
  return (
    <li className="flex items-start gap-3">
      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
        <svg
          className="w-4 h-4 text-primary"
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
      </div>
      <div>
        <strong className="text-foreground">{title}</strong>
        <span className="text-foreground/70"> — {description}</span>
      </div>
    </li>
  );
}
