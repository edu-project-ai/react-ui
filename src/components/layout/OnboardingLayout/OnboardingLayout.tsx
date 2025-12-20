import type { ReactNode } from "react";
import { Logo } from "@/components/shared/Logo/Logo";

interface OnboardingLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  title: string;
  description?: string;
  onSkip?: () => void;
}

/**
 * Shared layout for onboarding pages
 * Shows progress, logo, and consistent styling
 */
export const OnboardingLayout = ({
  children,
  currentStep,
  totalSteps,
  title,
  description,
  onSkip,
}: OnboardingLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      {/* Header with logo */}
      <header className="w-full px-4 py-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Logo />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-sm font-medium text-primary">
                {Math.round((currentStep / totalSteps) * 100)}%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Content card */}
          <div className="bg-card border border-border rounded-2xl shadow-xl p-6 lg:p-8">
            <div className="mb-6">
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                {title}
              </h1>
              {description && (
                <p className="text-muted-foreground">{description}</p>
              )}
            </div>

            {children}
          </div>

          {/* Skip option */}
          {onSkip && (
            <div className="mt-4 text-center">
              <button
                onClick={onSkip}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip for now →
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
