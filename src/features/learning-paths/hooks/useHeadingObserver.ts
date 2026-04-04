import { useState, useEffect } from "react";

export interface TocHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function parseHeadings(content: string): TocHeading[] {
  const headings: TocHeading[] = [];
  for (const line of content.split("\n")) {
    const m2 = line.match(/^## (.+)/);
    if (m2) {
      const text = m2[1].trim();
      headings.push({ id: slugify(text), text, level: 2 });
      continue;
    }
    const m3 = line.match(/^### (.+)/);
    if (m3) {
      const text = m3[1].trim();
      headings.push({ id: slugify(text), text, level: 3 });
    }
  }
  return headings;
}

export function useHeadingObserver(headings: TocHeading[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (headings.length === 0) {
      setActiveId(null);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "0px 0px -65% 0px", threshold: 0 },
    );

    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [headings]);

  return activeId;
}
