import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  TECH_CATEGORIES,
  TECHNOLOGY_LABELS,
  type Technology,
} from "@/features/onboarding";

interface TechSkillsSelectProps {
  value: Technology[];
  onChange: (techs: Technology[]) => void;
  className?: string;
}

export const TechSkillsSelect = ({
  value,
  onChange,
  className,
}: TechSkillsSelectProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const selectedSet = new Set(value);

  const toggle = (tech: Technology) => {
    const updated = selectedSet.has(tech)
      ? value.filter((t) => t !== tech)
      : [...value, tech];
    onChange(updated);
  };

  const clearAll = () => onChange([]);

  const filteredCategories = Object.entries(TECH_CATEGORIES).reduce(
    (acc, [category, techs]) => {
      const filtered = (techs as readonly string[]).filter((tech) =>
        TECHNOLOGY_LABELS[tech as Technology]
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
      if (filtered.length > 0) {
        acc[category] = filtered;
      }
      return acc;
    },
    {} as Record<string, string[]>
  );

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search */}
      <div className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search technologies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
        />
      </div>

      {/* Selected count */}
      {selectedSet.size > 0 && (
        <div className="flex items-center justify-between px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg">
          <span className="text-sm font-medium text-foreground">
            {selectedSet.size}{" "}
            {selectedSet.size === 1 ? "technology" : "technologies"} selected
          </span>
          <button
            type="button"
            onClick={clearAll}
            className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Category grid */}
      <div className="max-h-80 overflow-y-auto pr-1 space-y-5">
        {Object.entries(filteredCategories).map(([category, techs]) => (
          <div key={category}>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {category}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {techs.map((tech) => {
                const key = tech as Technology;
                const isSelected = selectedSet.has(key);
                return (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => toggle(key)}
                    className={cn(
                      "px-3 py-2 rounded-lg border-2 transition-all text-sm font-medium",
                      "hover:border-primary/50 hover:bg-primary/5",
                      isSelected
                        ? "border-primary bg-primary/10 text-primary shadow-sm"
                        : "border-border bg-card text-foreground"
                    )}
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="truncate">{TECHNOLOGY_LABELS[key]}</span>
                      {isSelected && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3.5 w-3.5 flex-shrink-0"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {Object.keys(filteredCategories).length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No technologies found matching &ldquo;{searchQuery}&rdquo;
          </div>
        )}
      </div>
    </div>
  );
};
