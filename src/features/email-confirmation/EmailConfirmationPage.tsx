import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Logo } from "@/components/shared/Logo/Logo";
import { cn } from "@/lib/utils";
import { useUser } from "@/features/authorization";
import { toast } from "react-hot-toast";
import { fetchUserAttributes } from "aws-amplify/auth";
import { isEmailVerifiedFromAttributes } from "@/lib/auth-utils";

export const EmailConfirmationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { confirmSignUp, resendSignUpCode, autoSignIn } = useUser();

  const [email, setEmail] = useState(location.state?.email || "");

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Prevent spamming AWS Cognito on every re-render
  const emailCheckPerformed = useRef(false);

  useEffect(() => {
    // Skip if check already performed in this component mount
    if (emailCheckPerformed.current) {
      return;
    }

    const checkEmailStatus = async () => {
      emailCheckPerformed.current = true; // Mark as checked

      // If no email provided in state, try to get from authenticated user
      try {
        const attributes = await fetchUserAttributes();

        const emailVerified = isEmailVerifiedFromAttributes(attributes);

        if (emailVerified) {
          toast.success("Email already verified!");
          navigate("/onboarding/profile-photo", { replace: true });
          return;
        }

        if (!email && attributes.email) {
          setEmail(attributes.email);
        }
      } catch {
        // User is not authenticated (using AWS autoSignIn flow)
        // This is expected after registration with autoSignIn enabled
        console.log("User not yet authenticated - awaiting email confirmation");

        if (!email) {
          toast.error("Email address is required");
          navigate("/register", { replace: true });
        }
      }
    };

    checkEmailStatus();
  }, [email, navigate]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");
    const newCode = pastedData.slice(0, 6).split("");

    while (newCode.length < 6) {
      newCode.push("");
    }

    setCode(newCode);

    const lastFilledIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastFilledIndex]?.focus();
  };

  const handleSubmit = async () => {
    const verificationCode = code.join("");

    if (verificationCode.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }

    setIsLoading(true);

    try {
      const confirmResult = await confirmSignUp(email, verificationCode);

      if (!confirmResult.success) {
        setCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        return;
      }

      // Try auto sign-in (works if user confirmed within same session)
      const autoSignInResult = await autoSignIn();

      if (autoSignInResult.success) {
        toast.success("Email confirmed successfully!");
        navigate("/onboarding/profile-photo");
      } else {
        // Auto sign-in not available - redirect to login
        toast.success("Email verified! Please log in to continue.");
        navigate("/login", { state: { email } });
      }
    } catch (error) {
      console.error("Email confirmation error:", error);
      toast.error("Failed to verify email. Please try again.");
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;

    setCanResend(false);
    setResendTimer(60);

    try {
      await resendSignUpCode(email);
    } catch {
      setCanResend(true);
      setResendTimer(0);
    }
  };

  const isCodeComplete = code.every((digit) => digit !== "");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      {/* Header */}
      <header className="w-full px-4 py-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <Logo />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-2xl shadow-xl p-6 lg:p-8">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Verify your email
              </h1>
              <p className="text-muted-foreground text-sm">
                We sent a 6-digit code to{" "}
                <span className="font-medium text-foreground">{email}</span>
              </p>
            </div>

            {/* Code input */}
            <div className="mb-6">
              <div className="flex justify-center gap-2 mb-4">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      if (el) inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className={cn(
                      "w-12 h-14 text-center text-xl font-semibold rounded-lg border-2 transition-all",
                      "focus:outline-none focus:ring-2 focus:ring-primary/50",
                      digit
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border bg-background text-foreground",
                      "placeholder:text-muted-foreground"
                    )}
                    placeholder="·"
                  />
                ))}
              </div>

              {/* Resend code */}
              <div className="text-center">
                {canResend ? (
                  <button
                    onClick={handleResendCode}
                    className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Resend code
                  </button>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Resend code in {resendTimer}s
                  </p>
                )}
              </div>
            </div>

            {/* Submit button */}
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!isCodeComplete || isLoading}
              className="w-full mb-4"
            >
              {isLoading ? (
                <LoadingSpinner text="Verifying..." />
              ) : (
                "Verify Email"
              )}
            </Button>

            {/* Back to register */}
            <div className="text-center">
              <button
                onClick={() => navigate("/register")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to registration
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmailConfirmationPage;
