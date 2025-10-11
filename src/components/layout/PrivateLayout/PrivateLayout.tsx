import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface PrivateLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const PrivateLayout: React.FC<PrivateLayoutProps> = ({
  children,
  className,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center gap-3 p-6 border-b border-border">
            <div className="size-8 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center">
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
                className="text-white"
              >
                <path d="M9 12l2 2 4-4"></path>
              </svg>
            </div>
            <span className="font-semibold">LearnPath AI</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <a
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent/10 transition-colors text-sm font-medium"
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
              >
                <rect width="7" height="9" x="3" y="3" rx="1"></rect>
                <rect width="7" height="5" x="14" y="3" rx="1"></rect>
                <rect width="7" height="9" x="14" y="12" rx="1"></rect>
                <rect width="7" height="5" x="3" y="16" rx="1"></rect>
              </svg>
              Дашборд
            </a>

            <a
              href="/roadmaps"
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent/10 transition-colors text-sm font-medium text-primary bg-primary/10"
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
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" x2="8" y1="13" y2="13"></line>
                <line x1="16" x2="8" y1="17" y2="17"></line>
                <line x1="10" x2="8" y1="9" y2="9"></line>
              </svg>
              Мої роутмапи
            </a>

            <a
              href="/tasks"
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent/10 transition-colors text-sm font-medium"
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
              >
                <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"></path>
                <path d="m9 12 2 2 4-4"></path>
              </svg>
              Завдання
            </a>

            <a
              href="/progress"
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent/10 transition-colors text-sm font-medium"
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
              >
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                <polyline points="16 7 22 7 22 13"></polyline>
              </svg>
              Прогрес
            </a>

            <a
              href="/resources"
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent/10 transition-colors text-sm font-medium"
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
              >
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
              Ресурси
            </a>

            <div className="border-t border-border mt-4 pt-4">
              <a
                href="/ai-mentor"
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent/10 transition-colors text-sm font-medium"
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
                >
                  <path d="M12 2a3 3 0 0 0-3 3c0 1.5.5 2.5 1.5 3.5L9 20l3-1 3 1-1.5-11.5C14.5 7.5 15 6.5 15 5a3 3 0 0 0-3-3Z"></path>
                  <path d="M5 12V7a7 7 0 0 1 14 0v5"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                AI-ментор
              </a>

              <a
                href="/settings"
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent/10 transition-colors text-sm font-medium"
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
                >
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                Налаштування
              </a>
            </div>
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-white text-sm font-medium">
                ЮК
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Юрій Коваленко</p>
                <p className="text-xs text-muted-foreground truncate">
                  Frontend Developer
                </p>
              </div>
              <button className="p-1 rounded-md hover:bg-accent/10 transition-colors">
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
                >
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="19" cy="12" r="1"></circle>
                  <circle cx="5" cy="12" r="1"></circle>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-0">
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

              {/* Search */}
              <div className="relative max-w-md">
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
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                <input
                  type="text"
                  placeholder="Пошук завдань, ресурсів..."
                  className="pl-10 pr-4 py-2 w-full sm:w-80 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Notifications */}
              <button className="relative p-2 rounded-md hover:bg-accent/10 transition-colors">
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
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
                </svg>
                <span className="absolute top-1 right-1 size-2 bg-destructive rounded-full"></span>
              </button>

              {/* Quick Actions */}
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
                Новий роутмап
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className={cn("flex-1 px-4 sm:px-6 lg:px-8 py-6", className)}>
          {children}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default PrivateLayout;
