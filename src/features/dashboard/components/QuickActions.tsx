import React from "react";
import { useNavigate } from "react-router-dom";

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <p className="text-sm font-semibold mb-3">Quick actions</p>
      <button
        onClick={() => navigate("/create-roadmap")}
        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        Create roadmap
      </button>
    </div>
  );
};
