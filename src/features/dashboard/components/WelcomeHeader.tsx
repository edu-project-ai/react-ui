import React from "react";
import { useAppSelector } from "@/hooks/useReduxHooks";

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

export const WelcomeHeader: React.FC = () => {
  const user = useAppSelector((state) => state.user.currentUser);
  const name = user?.displayName || user?.firstName || "there";
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex items-start justify-between gap-4 pb-2 border-b border-border">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          {getGreeting()}, {name} 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">{today}</p>
      </div>
    </div>
  );
};
