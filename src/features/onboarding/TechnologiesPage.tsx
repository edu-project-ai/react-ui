import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { OnboardingLayout } from "@/components/layout/OnboardingLayout/OnboardingLayout";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { fetchUserAttributes } from "aws-amplify/auth";
import {
  TECH_CATEGORIES,
  TECHNOLOGY_LABELS,
  TECHNOLOGY_TO_BACKEND_MAP,
  type Technology,
} from "./constants";
import { useOnboarding } from "./hooks/useOnboarding";

export const TechnologiesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    technologies: savedTechnologies,
    skillLevel,
    loading,
    setTechnologies: saveTechnologies,
    clearData,
    complete,
  } = useOnboarding();

  const [selectedTechs, setSelectedTechs] = useState<Set<Technology>>(
    new Set(savedTechnologies)
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Get photo file from navigation state (passed through SkillLevelPage)
  const photoFile = (location.state as { photoFile?: File })?.photoFile;

  // Restore from Redux
  useEffect(() => {
    if (savedTechnologies.length > 0) {
      setSelectedTechs(new Set(savedTechnologies));
    }
  }, [savedTechnologies]);

  const toggleTech = (tech: Technology) => {
    const newSelected = new Set(selectedTechs);
    if (newSelected.has(tech)) {
      newSelected.delete(tech);
    } else {
      newSelected.add(tech);
    }
    setSelectedTechs(newSelected);
  };

  const handleFinish = async () => {
    if (selectedTechs.size === 0) {
      toast.error("Please select at least one technology");
      return;
    }

    saveTechnologies(Array.from(selectedTechs));

    try {
      // Get user attributes from AWS Cognito
      const attributes = await fetchUserAttributes();

      if (
        !attributes.email ||
        !attributes.given_name ||
        !attributes.family_name ||
        !attributes.name
      ) {
        throw new Error("Missing required user attributes");
      }

      // Create user profile with all onboarding data
      const profileResult = await complete({
        firstName: attributes.given_name,
        lastName: attributes.family_name,
        displayName: attributes.name,
        photoFile: photoFile || null,
        programmingLevel: (skillLevel || "Beginner").toLowerCase(),
        programmingTechnologies: Array.from(selectedTechs).map(
          (tech) => TECHNOLOGY_TO_BACKEND_MAP[tech]
        ),
      });

      if (profileResult.success) {
        clearData();
        // Navigate with state to force profile recheck
        navigate("/dashboard", {
          replace: true,
          state: { profileCreated: true },
        });
      }
    } catch (error) {
      console.error("Failed to create profile:", error);
      toast.error("Failed to complete setup. Please try again.");
    }
  };

  const handleBack = () => {
    navigate("/onboarding/skill-level");
  };

  const handleSkip = () => {
    navigate("/dashboard");
  };

  // Filter technologies by search query
  const filteredCategories = Object.entries(TECH_CATEGORIES).reduce(
    (acc, [category, techs]) => {
      const filtered = techs.filter((tech) =>
        TECHNOLOGY_LABELS[tech as Technology]
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
      if (filtered.length > 0) {
        acc[category] = filtered;
      }
      return acc;
    },
    {} as Record<string, readonly string[]>
  );

  return (
    <OnboardingLayout
      currentStep={3}
      totalSteps={3}
      title="Choose your technologies"
      description="Select the technologies you're interested in or already working with"
    >
      <div className="space-y-6">
        {/* Search bar */}
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"
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
            className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          />
        </div>

        {/* Selected count */}
        {selectedTechs.size > 0 && (
          <div className="flex items-center justify-between p-3 bg-primary/10 border border-primary/20 rounded-lg">
            <span className="text-sm font-medium text-foreground">
              {selectedTechs.size}{" "}
              {selectedTechs.size === 1 ? "technology" : "technologies"}{" "}
              selected
            </span>
            <button
              onClick={() => setSelectedTechs(new Set())}
              className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Technologies grid by category */}
        <div className="max-h-96 overflow-y-auto pr-2 space-y-6">
          {Object.entries(filteredCategories).map(([category, techs]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {category}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {techs.map((tech) => {
                  const techKey = tech as Technology;
                  const isSelected = selectedTechs.has(techKey);
                  return (
                    <button
                      key={tech}
                      type="button"
                      onClick={() => toggleTech(techKey)}
                      className={cn(
                        "px-4 py-2.5 rounded-lg border-2 transition-all text-sm font-medium",
                        "hover:border-primary/50 hover:bg-primary/5",
                        isSelected
                          ? "border-primary bg-primary/10 text-primary shadow-sm"
                          : "border-border bg-card text-foreground"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate">
                          {TECHNOLOGY_LABELS[techKey]}
                        </span>
                        {isSelected && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 flex-shrink-0"
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
            <div className="text-center py-8 text-muted-foreground">
              <p>No technologies found matching "{searchQuery}"</p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex-1"
            type="button"
          >
            ← Back
          </Button>
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="flex-1"
            type="button"
          >
            Skip
          </Button>
          <Button
            variant="primary"
            onClick={handleFinish}
            disabled={selectedTechs.size === 0 || loading}
            className="flex-1"
            type="button"
          >
            {loading ? (
              <LoadingSpinner text="Creating profile..." />
            ) : (
              "Finish setup"
            )}
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default TechnologiesPage;
