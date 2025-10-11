import React from "react";
import { cn } from "@/lib/utils";

export interface HeaderProps {
  className?: string;
  children?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ className, children }) => {
  return (
    <header
      className={cn(
        "w-full bg-background border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-10",
        className
      )}
    >
      {children}
    </header>
  );
};

export default Header;
