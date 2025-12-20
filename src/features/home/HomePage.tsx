import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Hub } from "aws-amplify/utils";
import { HeroSection } from "./components/HeroSection";
import { FeaturesSection } from "./components/FeaturesSection";
import { CTASection } from "./components/CTASection";

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [isProcessingOAuth, setIsProcessingOAuth] = useState(false);

  useEffect(() => {
    // Check if this is an OAuth callback (has 'code' parameter)
    const urlParams = new URLSearchParams(window.location.search);
    const hasOAuthCode = urlParams.has("code");

    if (hasOAuthCode) {
      setIsProcessingOAuth(true);

      // Listen for auth completion
      const unsubscribe = Hub.listen("auth", ({ payload }) => {
        if (payload.event === "signInWithRedirect") {
          navigate("/auth/callback");
        } else if (payload.event === "signInWithRedirect_failure") {
          setIsProcessingOAuth(false);
        }
      });

      // Cleanup timeout
      const timeoutId = setTimeout(() => {
        setIsProcessingOAuth(false);
      }, 10000); // Increased to 10 seconds

      return () => {
        unsubscribe();
        clearTimeout(timeoutId);
      };
    }
  }, [navigate]);

  if (isProcessingOAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 dark:border-blue-400 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Completing Google Sign In...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please wait while we authenticate you
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <CTASection />
    </>
  );
};

export default HomePage;
