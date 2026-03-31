import { memo } from "react";

export interface CardOption {
  value: string;
  label: string;
  description: string;
  icon: string;
}

interface VisualCardGroupProps {
  options: CardOption[];
  value: string;
  onChange: (value: string) => void;
}

export const VisualCardGroup = memo(({ options, value, onChange }: VisualCardGroupProps) => (
  <div className="grid gap-3">
    {options.map((option) => (
      <button
        key={option.value}
        type="button"
        onClick={() => onChange(option.value)}
        className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-150 ${
          value === option.value
            ? "border-primary bg-primary/5 shadow-sm"
            : "border-border hover:border-primary/50 hover:bg-muted/40"
        }`}
      >
        <span className="text-2xl select-none shrink-0">{option.icon}</span>
        <div className="min-w-0">
          <div className="font-semibold text-foreground leading-tight">{option.label}</div>
          <div className="text-sm text-muted-foreground mt-0.5 leading-snug">
            {option.description}
          </div>
        </div>
        {/* Selection indicator */}
        <div
          className={`ml-auto shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
            value === option.value
              ? "border-primary bg-primary"
              : "border-border"
          }`}
        >
          {value === option.value && (
            <div className="w-2 h-2 rounded-full bg-primary-foreground" />
          )}
        </div>
      </button>
    ))}
  </div>
));
VisualCardGroup.displayName = "VisualCardGroup";
