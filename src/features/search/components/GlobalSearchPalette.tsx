import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useGlobalSearch } from "../hooks/useGlobalSearch";
import type { SearchResult } from "../types/searchTypes";

interface GlobalSearchPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Command Palette for global search.
 * Activated by clicking the header search trigger or pressing Ctrl+K / Cmd+K.
 */
export const GlobalSearchPalette: React.FC<GlobalSearchPaletteProps> = ({
  isOpen,
  onClose,
}) => {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { results, totalCount, isLoading, hasQuery } = useGlobalSearch(query);

  // Flatten results for keyboard navigation
  const flatResults: SearchResult[] = [
    ...results.roadmaps,
    ...results.resources,
    ...results.pages,
  ];

  // Focus input when palette opens
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setActiveIndex(0);
      // Small delay to ensure DOM is ready
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(0);
  }, [totalCount]);

  // Navigate to a search result
  const handleSelect = useCallback(
    (result: SearchResult) => {
      onClose();
      switch (result.category) {
        case "roadmap":
          navigate(`/learning-paths/${result.id}`);
          break;
        case "resource":
          navigate(`/resources/${result.id}`);
          break;
        case "page":
          navigate(result.path);
          break;
      }
    },
    [navigate, onClose]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((prev) =>
            prev < flatResults.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((prev) =>
            prev > 0 ? prev - 1 : flatResults.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (flatResults[activeIndex]) {
            handleSelect(flatResults[activeIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    },
    [flatResults, activeIndex, handleSelect, onClose]
  );

  // Scroll active item into view
  useEffect(() => {
    const activeEl = listRef.current?.querySelector(
      `[data-search-index="${activeIndex}"]`
    );
    activeEl?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={onClose}
      />

      {/* Palette */}
      <div
        className={cn(
          "relative w-full max-w-lg mx-4",
          "bg-card border border-border rounded-xl shadow-2xl shadow-black/30",
          "animate-in fade-in slide-in-from-top-4 duration-200",
          "flex flex-col max-h-[60vh]"
        )}
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <SearchIcon className="text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Шукати роадмапи, ресурси, сторінки..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-muted rounded border border-border">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="overflow-y-auto py-2">
          {isLoading && hasQuery && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              <LoadingSpinner />
            </div>
          )}

          {!isLoading && hasQuery && totalCount === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Нічого не знайдено для «{query.trim()}»
            </div>
          )}

          {!hasQuery && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Почніть вводити для пошуку...
            </div>
          )}

          {/* Roadmaps section */}
          {results.roadmaps.length > 0 && (
            <ResultSection title="Roadmaps" icon={<RoadmapIcon />}>
              {results.roadmaps.map((result) => {
                const globalIndex = flatResults.indexOf(result);
                return (
                  <ResultItem
                    key={result.id}
                    index={globalIndex}
                    isActive={activeIndex === globalIndex}
                    onClick={() => handleSelect(result)}
                    onMouseEnter={() => setActiveIndex(globalIndex)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {result.title}
                      </p>
                      {result.description && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {result.description}
                        </p>
                      )}
                    </div>
                    {result.progressPercentage != null && (
                      <span className="text-xs text-muted-foreground shrink-0">
                        {Math.round(result.progressPercentage)}%
                      </span>
                    )}
                  </ResultItem>
                );
              })}
            </ResultSection>
          )}

          {/* Resources section */}
          {results.resources.length > 0 && (
            <ResultSection title="Resources" icon={<ResourceIcon />}>
              {results.resources.map((result) => {
                const globalIndex = flatResults.indexOf(result);
                return (
                  <ResultItem
                    key={result.id}
                    index={globalIndex}
                    isActive={activeIndex === globalIndex}
                    onClick={() => handleSelect(result)}
                    onMouseEnter={() => setActiveIndex(globalIndex)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {result.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {result.resourceType}
                      </p>
                    </div>
                  </ResultItem>
                );
              })}
            </ResultSection>
          )}

          {/* Pages section */}
          {results.pages.length > 0 && (
            <ResultSection title="Pages" icon={<PageIcon />}>
              {results.pages.map((result) => {
                const globalIndex = flatResults.indexOf(result);
                return (
                  <ResultItem
                    key={result.id}
                    index={globalIndex}
                    isActive={activeIndex === globalIndex}
                    onClick={() => handleSelect(result)}
                    onMouseEnter={() => setActiveIndex(globalIndex)}
                  >
                    <p className="text-sm font-medium">{result.title}</p>
                    <p className="text-xs text-muted-foreground ml-auto">
                      {result.path}
                    </p>
                  </ResultItem>
                );
              })}
            </ResultSection>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-border text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded border border-border bg-muted font-mono">↑</kbd>
              <kbd className="px-1 py-0.5 rounded border border-border bg-muted font-mono">↓</kbd>
              навігація
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded border border-border bg-muted font-mono">↵</kbd>
              відкрити
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded border border-border bg-muted font-mono">esc</kbd>
            закрити
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface ResultSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const ResultSection: React.FC<ResultSectionProps> = ({
  title,
  icon,
  children,
}) => (
  <div className="mb-1">
    <div className="flex items-center gap-2 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
      {icon}
      {title}
    </div>
    {children}
  </div>
);

interface ResultItemProps {
  index: number;
  isActive: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  children: React.ReactNode;
}

const ResultItem: React.FC<ResultItemProps> = ({
  index,
  isActive,
  onClick,
  onMouseEnter,
  children,
}) => (
  <button
    data-search-index={index}
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-75",
      isActive
        ? "bg-primary/10 text-foreground"
        : "text-foreground/80 hover:bg-accent/5"
    )}
  >
    {children}
  </button>
);

// ─── Icons ────────────────────────────────────────────────────────────────────

const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const RoadmapIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-primary"
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const ResourceIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-primary"
  >
    <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

const PageIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-primary"
  >
    <rect width="7" height="9" x="3" y="3" rx="1" />
    <rect width="7" height="5" x="14" y="3" rx="1" />
    <rect width="7" height="9" x="14" y="12" rx="1" />
    <rect width="7" height="5" x="3" y="16" rx="1" />
  </svg>
);

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center gap-2">
    <svg
      className="animate-spin h-4 w-4 text-primary"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
    <span>Пошук...</span>
  </div>
);
