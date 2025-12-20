import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { WizardState } from "../OnboardingWizard";

interface PhotoStepProps {
  state: WizardState;
  onUpdate: (updates: Partial<WizardState>) => void;
  onNext: () => void;
  onSkip: () => void;
}

export const PhotoStep = ({ state, onUpdate, onNext, onSkip }: PhotoStepProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate({
          photoFile: file,
          photoPreview: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate({
          photoFile: file,
          photoPreview: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    onUpdate({
      photoFile: null,
      photoPreview: null,
    });
  };

  const handleNext = () => {
    onNext();
  };

  const handleSkip = () => {
    onUpdate({ photoFile: null, photoPreview: null });
    onSkip();
  };

  return (
    <div className="space-y-6">
      {/* Image preview or upload zone */}
      <div className="flex flex-col items-center">
        {state.photoPreview ? (
          <div className="relative">
            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-primary shadow-lg">
              <img
                src={state.photoPreview}
                alt="Profile preview"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={handleRemove}
              className="absolute -top-2 -right-2 w-8 h-8 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-lg hover:bg-destructive/90 transition-colors"
              aria-label="Remove photo"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        ) : (
          <div
            className={cn(
              "w-full max-w-md border-2 border-dashed rounded-2xl p-8 transition-all",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-muted/30"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-foreground font-medium mb-1">
                  Drop your photo here, or{" "}
                  <label className="text-primary hover:text-primary/80 cursor-pointer underline">
                    browse
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </p>
                <p className="text-sm text-muted-foreground">
                  PNG, JPG or GIF up to 5MB
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
        <Button
          variant="ghost"
          onClick={handleSkip}
          className="flex-1"
          type="button"
        >
          Skip for now
        </Button>
        <Button
          variant="primary"
          onClick={handleNext}
          disabled={!state.photoPreview}
          className="flex-1"
          type="button"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};
