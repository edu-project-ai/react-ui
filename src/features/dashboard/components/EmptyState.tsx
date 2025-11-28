import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const EmptyState: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="text-center py-16 bg-card border border-border rounded-xl">
      <div className="mb-6 flex justify-center">
        <div className="p-6 rounded-full bg-primary/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
          >
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            <path d="M12 7v14" />
          </svg>
        </div>
      </div>
      <h3 className="text-xl font-bold mb-2">Start your learning journey</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        You don't have any roadmaps yet. Create your first learning plan and
        start your journey to new knowledge.
      </p>
      <Button size="lg" onClick={() => navigate("/create-roadmap")}>
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
          className="mr-2"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        Create first roadmap
      </Button>
    </div>
  );
};
