import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Hub } from "aws-amplify/utils";
import {
  fetchAuthSession,
  getCurrentUser,
  fetchUserAttributes,
} from "aws-amplify/auth";
import { useAppDispatch } from "@/hooks";
import { setCurrentUser } from "@/features/authorization/store";
import { useUser } from "@/features/authorization";
import { createUserFromCognito } from "@/lib/cognito-user-mapper";

export const CallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { hasProfile } = useUser();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const cognitoUser = await getCurrentUser();
        const session = await fetchAuthSession();
        const userAttributes = await fetchUserAttributes();
        const idToken = session.tokens?.idToken?.toString();

        if (!idToken) {
          throw new Error("Failed to get ID token");
        }

        const user = createUserFromCognito(cognitoUser, userAttributes);

        dispatch(setCurrentUser(user));

        // Check if profile exists using hook (service -> slice -> hook)
        const profileCheck = await hasProfile();

        if (!profileCheck.hasProfile) {
          setTimeout(() => {
            navigate("/onboarding/profile-photo", { replace: true });
          }, 500);
        } else {
          setTimeout(() => {
            navigate("/dashboard", { replace: true });
          }, 500);
        }
      } catch {
        // Silent error - Hub might still trigger
      }
    };

    const timer = setTimeout(() => {
      checkAuthState();
    }, 1000);

    const unsubscribe = Hub.listen("auth", async ({ payload }) => {
      switch (payload.event) {
        case "signInWithRedirect":
          try {
            const cognitoUser = await getCurrentUser();
            const session = await fetchAuthSession();
            const userAttributes = await fetchUserAttributes();
            const idToken = session.tokens?.idToken?.toString();

            if (!idToken) {
              throw new Error("Failed to get ID token");
            }

            const user = createUserFromCognito(cognitoUser, userAttributes);

            dispatch(setCurrentUser(user));

            // Check if profile exists using hook (service -> slice -> hook)
            const profileCheck = await hasProfile();

            if (!profileCheck.hasProfile) {
              navigate("/onboarding/profile-photo", { replace: true });
            } else {
              navigate("/dashboard", { replace: true });
            }
          } catch {
            setError("Failed to complete Google sign in");
            setTimeout(() => navigate("/login"), 3000);
          }
          break;

        case "signInWithRedirect_failure":
          setError("Google sign in failed. Please try again.");
          setTimeout(() => navigate("/login"), 3000);
          break;

        case "customOAuthState":
          // Silent handling
          break;
      }
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [navigate, dispatch, hasProfile]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-destructive/5">
        <div className="text-center max-w-md px-4">
          <div className="bg-destructive/10 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
            <svg
              className="h-8 w-8 text-destructive"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Authentication Failed
          </h2>
          <p className="text-muted-foreground">{error}</p>
          <p className="text-sm text-muted-foreground/70 mt-2">
            Redirecting to login page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-primary/5">
      <div className="text-center px-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-6"></div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Completing sign in...
        </h2>
        <p className="text-muted-foreground">
          Please wait while we authenticate you with Google
        </p>
      </div>
    </div>
  );
};

export default CallbackPage;
