import React from "react";
import { useAppSelector } from "@/hooks/useReduxHooks";

export const WelcomeHeader: React.FC = () => {
  const user = useAppSelector((state) => state.user.currentUser);
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Capitalize first letter of the date
  const formattedDate =
    currentDate.charAt(0).toUpperCase() + currentDate.slice(1);

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-foreground">
        Welcome, {user?.displayName || user?.firstName || "User"}! 👋
      </h1>
      <p className="text-muted-foreground mt-1">{formattedDate}</p>
    </div>
  );
};
