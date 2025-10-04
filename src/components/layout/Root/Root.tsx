import React from "react";
import { cn } from "@/lib/utils";
import { Header } from "../Header";

export interface RootLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const RootLayout: React.FC<RootLayoutProps> = ({
  children,
  className,
}) => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {/* Logo */}
            <div className="size-8 rounded-md bg-primary flex items-center justify-center">
              <span className="font-semibold text-primary-foreground">P</span>
            </div>
            <span className="font-medium hidden md:block">Project UI</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 ml-6">
            <a
              href="#"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Dashboard
            </a>
            <a
              href="#"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Features
            </a>
            <a
              href="#"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Settings
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button className="size-9 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
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
            >
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
            </svg>
          </button>
          <button className="size-9 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
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
            >
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="19" cy="12" r="1"></circle>
              <circle cx="5" cy="12" r="1"></circle>
            </svg>
          </button>
          <div className="size-9 rounded-full bg-accent/30 flex items-center justify-center text-sm font-medium">
            JD
          </div>
        </div>
      </Header>

      <main className={cn("flex-1 px-4 py-6 md:px-6 lg:px-8", className)}>
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>

      <footer className="border-t border-border py-4 px-4 md:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex justify-between items-center text-sm text-muted-foreground">
          <p>© 2025 Project UI. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Terms
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RootLayout;
