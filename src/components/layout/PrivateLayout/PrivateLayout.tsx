import React, { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/ThemeToggle/ThemeToggle";
import { Sidebar } from "../Sidebar/Sidebar";
import { Outlet, Link } from "react-router-dom";
import { GlobalSearchPalette } from "@/features/search";
export interface PrivateLayoutProps {
  children?: React.ReactNode;
  className?: string;
}
import { RoadmapNotificationListener } from "@/features/learning-paths/components/RoadmapNotificationListener";
import { NotificationsMenu } from "@/features/notifications/components/NotificationsMenu";
import { useGetUserProfileQuery, setCurrentUser } from "@/features/authorization";
import { useAppDispatch } from "@/hooks/useReduxHooks";

export const PrivateLayout: React.FC<PrivateLayoutProps> = ({
  className,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const dispatch = useAppDispatch();
  const { data: userProfile } = useGetUserProfileQuery();

  // Global Ctrl+K / Cmd+K hotkey
  const handleSearchHotkey = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      setIsSearchOpen((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleSearchHotkey);
    return () => document.removeEventListener("keydown", handleSearchHotkey);
  }, [handleSearchHotkey]);

  useEffect(() => {
    if (userProfile) {
      dispatch(setCurrentUser(userProfile));
    }
  }, [userProfile, dispatch]);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <RoadmapNotificationListener />
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Main Content Area */}
      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-300 ease-in-out",
          isCollapsed ? "lg:pl-20" : "lg:pl-64"
        )}
      >
        {/* Top Header */}
        <header className="bg-background border-b border-border sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 -m-2 rounded-md hover:bg-accent/10 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="4" x2="20" y1="12" y2="12"></line>
                  <line x1="4" x2="20" y1="6" y2="6"></line>
                  <line x1="4" x2="20" y1="18" y2="18"></line>
                </svg>
              </button>

              {/* Search trigger — opens Command Palette */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-2 pl-3 pr-2 py-2 w-full sm:w-80 rounded-md border border-input bg-background text-sm text-muted-foreground hover:border-ring hover:bg-accent/5 transition-colors cursor-pointer"
              >
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
                  className="shrink-0"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <span className="flex-1 text-left">Пошук завдань, ресурсів...</span>
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-muted rounded border border-border">
                  Ctrl+K
                </kbd>
              </button>
            </div>

            <div className="flex items-center gap-3">
              {/* Notifications */}
              <NotificationsMenu />

              {/* Theme toggle */}
              <ThemeToggle className="hidden sm:inline-flex" />

              {/* Quick Actions */}
              <Link to="/create-roadmap">
                <Button size="sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2"
                  >
                    <path d="M12 5v14M5 12h14"></path>
                  </svg>
                  New Roadmap
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className={cn("flex-1 px-4 sm:px-6 lg:px-8 py-6", className)}>
          <Outlet />
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Global Search Command Palette */}
      <GlobalSearchPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  );
};

export default PrivateLayout;
