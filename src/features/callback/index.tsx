import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { Hub } from "aws-amplify/utils";
import {
  fetchAuthSession,
  getCurrentUser,
  fetchUserAttributes,
} from "aws-amplify/auth";
import { useAppDispatch } from "@/hooks/useReduxHooks";
import { setCurrentUser } from "@/features/authorization";
import { checkUserProfileExists } from "@/features/authorization";
import { createUserFromCognito } from "@/lib/cognito-user-mapper";

export const CallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | null>(null);
  const isProcessing = useRef(false);

  /**
   * Centralized auth processing function
   * Handles both Hub event and immediate check cases
   */
  const processAuthCallback = useCallback(async () => {
    // Prevent duplicate processing
    if (isProcessing.current) return;
    isProcessing.current = true;

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

      // Check if profile exists using RTK Query
      const profileResult = await checkUserProfileExists();

      if (profileResult.status === "found") {
        navigate("/dashboard", { replace: true });
      } else if (profileResult.status === "not_found") {
        // New user - redirect to onboarding
        navigate("/onboarding", { replace: true });
      } else {
        // Error checking profile - let user retry
        setError("Failed to verify profile. Please try again.");
        isProcessing.current = false;
      }
    } catch (err) {
      console.error("Auth callback error:", err);
      setError("Failed to complete sign in. Please try again.");
      isProcessing.current = false;
    }
  }, [dispatch, navigate]);

  useEffect(() => {
    // Immediate check in case Hub event already fired
    processAuthCallback();

    // Subscribe to Hub events for OAuth redirect
    const unsubscribe = Hub.listen("auth", async ({ payload }) => {
      switch (payload.event) {
        case "signInWithRedirect":
          processAuthCallback();
          break;

        case "signInWithRedirect_failure":
          setError("Google sign in failed. Please try again.");
          break;

        case "customOAuthState":
          // Silent handling for custom state
          break;
      }
    });

    return () => {
      unsubscribe();
    };
  }, [processAuthCallback]);

  /**
   * Handle manual retry
   */
  const handleRetry = () => {
    setError(null);
    isProcessing.current = false;
    processAuthCallback();
  };

  /**
   * Navigate back to login
   */
  const handleBackToLogin = () => {
    navigate("/login", { replace: true });
  };

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
          <p className="text-muted-foreground mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={handleBackToLogin}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
            >
              Back to Login
            </button>
          </div>
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

