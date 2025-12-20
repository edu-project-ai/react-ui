import { useEffect, useState, type FC, type ReactNode } from "react";
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { Toaster } from "@/components/shared/Toast/Toast";
import { Spinner } from "@/components/ui/spinner";

// --- Логіка Redux ---
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHooks";
import { fetchUserProfile, setCurrentUser } from "@/features/authorization/store/user.slice";

// --- Ваші утиліти ---
import { isAuthenticated } from "@/lib/token-provider";
import { isEmailVerified } from "@/lib/auth-utils";
import { checkUserProfileExists } from "@/features/authorization/utils/profile-checker";
import { userApi } from "@/features/authorization/api/userApi";

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
  "/confirm-email",
  "/onboarding",
];

interface AuthRedirectorProps {
  children: ReactNode;
}

const AuthRedirector: FC<AuthRedirectorProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const location = useLocation();

  const currentUser = useAppSelector((state) => state.user.currentUser);

  const [authStatus, setAuthStatus] = useState<
    "restoring" | "authenticated" | "unauthenticated"
  >("restoring");

  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  const [profileChecked, setProfileChecked] = useState(false);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);

  const [emailChecked, setEmailChecked] = useState(false);
  const [emailVerified, setEmailVerified] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuthAndRestoreSession = async () => {
      setRedirectTo(null);

      const locationState = location.state as {
        profileCreated?: boolean;
      } | null;
      
      // If just completed onboarding, trust that profile was created
      // Skip re-checking to avoid race conditions with RTK Query cache
      if (locationState?.profileCreated) {
        console.log("✅ Profile just created, skipping verification");
        setProfileChecked(true);
        setHasProfile(true);
        window.history.replaceState({}, document.title);
      }

      let user = currentUser;
      let sessionIsValid = !!user;

      if (!user) {
        const cognitoAuthenticated = await isAuthenticated();

        if (cognitoAuthenticated) {
          try {
            const cognitoUser = await dispatch(fetchUserProfile()).unwrap();
            
            try {
              const backendProfile = await dispatch(
                userApi.endpoints.getUserProfile.initiate(undefined, { forceRefetch: true })
              ).unwrap();

              user = backendProfile;
            } catch (backendError) {

              console.warn("⚠️ Backend profile not found, using Cognito data:", backendError);
              user = cognitoUser;
            }

            dispatch(setCurrentUser(user));
            sessionIsValid = true;
          } catch (error) {
            console.error("Failed to restore session:", error);
            sessionIsValid = false;
            user = null;
          }
        } else {
          sessionIsValid = false;
          user = null;
        }
      }

      if (!sessionIsValid || !user) {
        setAuthStatus("unauthenticated");

        setProfileChecked(false);
        setHasProfile(null);
        setEmailChecked(false);
        setEmailVerified(null);

        if (!routesWithNoAuth.includes(location.pathname)) {
          setRedirectTo("/login");
        }
        return;
      }

      setAuthStatus("authenticated");

      const selfManagedPages = [
        "/confirm-email",
        "/onboarding",
      ];

      if (selfManagedPages.includes(location.pathname)) {
        setRedirectTo(null);
        return;
      }

      try {
        let emailIsVerified = emailVerified;

        if (!emailChecked) {
          emailIsVerified = await isEmailVerified();
          setEmailChecked(true);
          setEmailVerified(emailIsVerified);
        }

        if (!emailIsVerified) {
          setRedirectTo("/confirm-email");
          return;
        }

        if (!profileChecked) {
          const profileResult = await checkUserProfileExists();
          setProfileChecked(true);

          if (profileResult.status === "found") {
            setHasProfile(true);
          } else if (profileResult.status === "not_found") {
            setHasProfile(false);
            setRedirectTo("/onboarding");
            return;
          } else {
            setHasProfile(null);
            console.warn(
              "Profile check failed (not 404), not redirecting to onboarding"
            );
          }
        } else if (hasProfile === false) {
          setRedirectTo("/onboarding");
          return;
        }

        setRedirectTo(null);
      } catch (error) {
        console.error("Root: Error during auth checks:", error);
        setProfileChecked(true);
        setHasProfile(false);
        setRedirectTo("/onboarding");
      }
    };

    checkAuthAndRestoreSession();
    // eslint-disable-next-line
  }, [location.pathname, location.state, currentUser, dispatch]);
  if (authStatus === "restoring") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-primary/5">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-muted-foreground">Restoring session...</p>
        </div>
      </div>
    );
  }

  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  if (authStatus === "authenticated") {
    if (location.pathname === "/login" || location.pathname === "/register") {
      if (profileChecked) {
        return (
          <Navigate
            to={hasProfile ? "/dashboard" : "/onboarding"}
            replace
          />
        );
      }
    }
  }

  if (authStatus === "unauthenticated") {
    if (!routesWithNoAuth.includes(location.pathname)) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  }

  return children;
};

const Root = () => {
  return (
    <AuthRedirector>
      <Toaster />
      <Outlet />
    </AuthRedirector>
  );
};

export default Root;
