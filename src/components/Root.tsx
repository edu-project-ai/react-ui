import { useEffect, useState, type FC, type ReactNode } from "react";
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { isAuthenticated } from "@/lib/token-provider";
import { Spinner } from "@/components/ui";

// Routes that don't require authentication
const routesWithNoAuth = [
  "/",
  "/about",
  "/contact",
  "/features",
  "/login",
  "/register",
  "/auth/callback",
  "/forgot-password",
];

interface AuthRedirectorProps {
  children: ReactNode;
}

const AuthRedirector: FC<AuthRedirectorProps> = ({ children }) => {
  const location = useLocation();
  const [authStatus, setAuthStatus] = useState<
    "loading" | "authenticated" | "unauthenticated"
  >("loading");

  useEffect(() => {
    const checkAuth = async () => {
      const result = await isAuthenticated();
      setAuthStatus(result ? "authenticated" : "unauthenticated");
    };

    checkAuth();
  }, [location.pathname]);

  if (authStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-primary/5">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (authStatus === "authenticated") {
    if (location.pathname === "/login" || location.pathname === "/register") {
      return <Navigate to="/dashboard" replace />;
    }
  } else {
    if (!routesWithNoAuth.includes(location.pathname)) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  }
  return children;
};

const Root = () => {
  return (
    <AuthRedirector>
      <Outlet />
    </AuthRedirector>
  );
};

export default Root;
