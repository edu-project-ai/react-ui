import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/hooks";
import { useUser } from "@/features/authorization";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  isCollapsed,
  setIsCollapsed,
  className,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.user.currentUser);
  const { signOut } = useUser();

  const navItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: (
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
          <rect width="7" height="9" x="3" y="3" rx="1"></rect>
          <rect width="7" height="5" x="14" y="3" rx="1"></rect>
          <rect width="7" height="9" x="14" y="12" rx="1"></rect>
          <rect width="7" height="5" x="3" y="16" rx="1"></rect>
        </svg>
      ),
    },
    {
      href: "/learning-paths",
      label: "My Roadmaps",
      icon: (
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
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" x2="8" y1="13" y2="13"></line>
          <line x1="16" x2="8" y1="17" y2="17"></line>
          <line x1="10" x2="8" y1="9" y2="9"></line>
        </svg>
      ),
    },
    {
      href: "/progress",
      label: "Progress",
      icon: (
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
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
          <polyline points="16 7 22 7 22 13"></polyline>
        </svg>
      ),
    },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.displayName) {
      const parts = user.displayName.split(" ");
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return user.displayName.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  const bottomNavItems = [
    {
      href: "/ai-mentor",
      label: "AI-ментор",
      badge: "NEW",
      icon: (
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
          <path d="M12 2a3 3 0 0 0-3 3c0 1.5.5 2.5 1.5 3.5L9 20l3-1 3 1-1.5-11.5C14.5 7.5 15 6.5 15 5a3 3 0 0 0-3-3Z"></path>
          <path d="M5 12V7a7 7 0 0 1 14 0v5"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      ),
    },
    {
      href: "/settings",
      label: "Settings",
      icon: (
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
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      ),
    },
  ];

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 bg-card border-r border-border transition-all duration-300 ease-in-out flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        isCollapsed ? "lg:w-20" : "lg:w-64",
        "w-64", // Mobile width
        className
      )}
    >
      {/* Header */}
      <div className="h-16 flex items-center px-4 border-b border-border justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="size-8 min-w-8 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center">
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
          <span
            className={cn(
              "font-semibold whitespace-nowrap transition-opacity duration-300",
              isCollapsed ? "opacity-0 w-0" : "opacity-100"
            )}
          >
            LearnPath AI
          </span>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex p-1.5 rounded-md hover:bg-accent/10 text-muted-foreground hover:text-foreground transition-colors"
        >
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
            className={cn(
              "transition-transform duration-300",
              isCollapsed ? "rotate-180" : ""
            )}
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group relative",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-accent/10 hover:text-foreground"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <span className={cn("min-w-5", isActive ? "text-primary" : "")}>
                {item.icon}
              </span>
              <span
                className={cn(
                  "whitespace-nowrap transition-all duration-300 overflow-hidden",
                  isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                )}
              >
                {item.label}
              </span>
              {isActive && !isCollapsed && (
                <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}

        <div className="my-4 border-t border-border/50" />

        {bottomNavItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group relative",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-accent/10 hover:text-foreground"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <span className={cn("min-w-5", isActive ? "text-primary" : "")}>
                {item.icon}
              </span>
              <span
                className={cn(
                  "whitespace-nowrap transition-all duration-300 overflow-hidden flex-1",
                  isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                )}
              >
                {item.label}
              </span>
              {item.badge && !isCollapsed && (
                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-primary text-primary-foreground rounded">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-3 border-t border-border space-y-2">
        <div
          className={cn(
            "flex items-center gap-3 p-2 rounded-md hover:bg-accent/10 transition-colors cursor-pointer",
            isCollapsed ? "justify-center" : ""
          )}
          title={isCollapsed ? user?.displayName || "User Profile" : undefined}
        >
          <div className="size-8 min-w-8 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-white text-sm font-medium shadow-sm">
            {getUserInitials()}
          </div>
          <div
            className={cn(
              "flex-1 min-w-0 transition-all duration-300 overflow-hidden",
              isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"
            )}
          >
            <p className="text-sm font-medium truncate">
              {user?.displayName || user?.email || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.programmingLevel || "Learner"}
            </p>
          </div>
        </div>
        
        {!isCollapsed && (
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
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
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" x2="9" y1="12" y2="12" />
            </svg>
            Вийти
          </button>
        )}
      </div>
    </aside>
  );
};
