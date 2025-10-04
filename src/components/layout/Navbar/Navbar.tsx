import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/Logo";

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

function RightSection() {
  return (
    <div className="hidden lg:flex items-center gap-3">
      <Link
        to="/auth"
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-8 px-3 text-xs",
          "hover:bg-accent/10 hover:text-accent-foreground"
        )}
      >
        Login
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
            <RightSection />
            <MobileMenuToggle openNav={openNav} setOpenNav={setOpenNav} />
          </div>
        </div>

        {/* Mobile menu */}
        {openNav && (
          <div className="lg:hidden mt-4 pt-4 border-t border-border">
            <div className="flex flex-col gap-4">
              <NavLinks onClick={() => setOpenNav(false)} />
              <div className="flex items-center justify-between pt-2">
                <Link
                  to="/auth"
                  onClick={() => setOpenNav(false)}
                  className={cn(
                    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-8 px-3 text-xs",
                    "hover:bg-accent/10 hover:text-accent-foreground"
                  )}
                >
                  Login
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}

export default Navbar;
