import { memo } from "react";
import type { TocHeading } from "../hooks/useHeadingObserver";

interface TheoryTableOfContentsProps {
  headings: TocHeading[];
  activeId: string | null;
}

export const TheoryTableOfContents = memo(({ headings, activeId }: TheoryTableOfContentsProps) => {
  if (headings.length < 2) return null;

  return (
    <nav aria-label="Table of contents" className="hidden lg:block shrink-0 w-52">
      <div className="sticky top-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-1">
          On this page
        </p>
        <ul className="space-y-0.5">
          {headings.map((heading) => (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                className={[
                  "block text-sm leading-snug py-1 px-1 rounded transition-colors",
                  heading.level === 3 ? "pl-4 text-xs" : "",
                  activeId === heading.id
                    ? "text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                ].join(" ")}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
});

TheoryTableOfContents.displayName = "TheoryTableOfContents";
