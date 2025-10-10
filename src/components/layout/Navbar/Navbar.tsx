import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { isAuthenticated } from "@/lib/token-provider";
import { useUser } from "@/features/authorization";
import type { User } from "@/features/authorization/services/type";

function NavLinks({
  className,
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) {
  const links = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About us" },
    { to: "/features", label: "Features" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <ul
      className={cn(
        "flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-6",
        className
      )}
    >
      {links.map((link) => (
        <li key={link.to}>
          <Link
            to={link.to}
            onClick={onClick}
            className="text-sm font-normal text-foreground/70 hover:text-foreground transition-colors"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function RightSection({
  authenticated,
  user,
}: {
  authenticated: boolean;
  user: User | null;
}) {
  if (authenticated && user) {
    return (
      <div className="hidden lg:flex items-center gap-3">
        <Link to="/dashboard">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-foreground"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">
                {user.displayName?.charAt(0).toUpperCase() ||
                  user.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="font-medium">
              {user.displayName || user.email}
            </span>
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="hidden lg:flex items-center gap-3">
      <Link to="/login">
        <Button variant="ghost" size="sm" className="text-foreground">
          Sign In
        </Button>
      </Link>
      <Link to="/register">
        <Button variant="primary" size="sm">
          Get Started
        </Button>
      </Link>
    </div>
  );
}

function MobileMenuToggle({
  openNav,
  setOpenNav,
}: {
  openNav: boolean;
  setOpenNav: (val: boolean) => void;
}) {
  return (
    <button
      type="button"
      className="lg:hidden p-2 rounded-md hover:bg-muted/10 transition-colors"
      onClick={() => setOpenNav(!openNav)}
      aria-label="Toggle menu"
    >
      {openNav ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      )}
    </button>
  );
}

export function Navbar() {
  const [openNav, setOpenNav] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setOpenNav(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const result = await isAuthenticated();
      setAuthenticated(result);
    };
    checkAuth();
  }, []);

  return (
    <div
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-500 ease-in-out",
        isScrolled ? "px-2 pt-2 lg:px-8" : ""
      )}
    >
      <nav
        className={cn(
          "transition-all duration-500 ease-in-out px-4 py-3 lg:px-8",
          isScrolled
            ? "rounded-xl lg:rounded-2xl backdrop-blur-md bg-background/30 hover:bg-background/80 shadow-md border border-border/50"
            : "rounded-none bg-background border-b border-border"
        )}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Logo />

          {/* Desktop centered nav links */}
          <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2">
            <NavLinks />
          </div>

          <div className="flex items-center gap-4">
            <RightSection authenticated={authenticated} user={user} />
            <MobileMenuToggle openNav={openNav} setOpenNav={setOpenNav} />
          </div>
        </div>

        {/* Mobile menu */}
        {openNav && (
          <div className="lg:hidden mt-4 pt-4 border-t border-border">
            <div className="flex flex-col gap-4">
              <NavLinks onClick={() => setOpenNav(false)} />
              <div className="flex flex-col gap-2 pt-2">
                {authenticated && user ? (
                  <Link to="/dashboard" onClick={() => setOpenNav(false)}>
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <div className="w-6 h-6 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                        <span className="text-xs font-semibold">
                          {user.displayName?.charAt(0).toUpperCase() ||
                            user.email?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span>{user.displayName || user.email}</span>
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setOpenNav(false)}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-foreground"
                      >
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/register" onClick={() => setOpenNav(false)}>
                      <Button variant="primary" size="sm" className="w-full">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}

export default Navbar;
