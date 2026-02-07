import { memo } from "react";
import type { LearningItem } from "../services/type";
import { TheoryDetail } from "./detail-views/TheoryDetail";
import { CodingDetail } from "./detail-views/CodingDetail";
import { QuizDetail } from "./detail-views/QuizDetail";

// ============================================================================
// Exhaustive Check Helper
// ============================================================================

/**
 * Compile-time exhaustive check for discriminated unions.
 * If all cases are handled, this function will never be called.
 */
function assertNever(x: never): never {
  throw new Error(`Unexpected learning item type: ${JSON.stringify(x)}`);
}

// ============================================================================
// Main Component
// ============================================================================

export interface LearningItemRendererProps {
  item: LearningItem;
}

/**
 * Factory component that renders the appropriate detail view
 * based on the learning item type (discriminated union switch).
 */
export const LearningItemRenderer = memo(({ item }: LearningItemRendererProps) => {
  switch (item.type) {
    case "Theory":
      return <TheoryDetail item={item} />;
    case "CodingTask":
      return <CodingDetail item={item} />;
    case "Quiz":
      return <QuizDetail item={item} />;
    default:
      // TypeScript will error here if we miss a case
      return assertNever(item);
  }
});

LearningItemRenderer.displayName = "LearningItemRenderer";
