import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import FormInput from "@/components/form/FormInput";
import FormPasswordInput from "@/components/form/FormPasswordInput";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import GoogleButton from "@/components/shared/GoogleButton/GoogleButton";
import FormDivider from "@/components/shared/FormDivider/FormDivider";
import { signInWithRedirect } from "aws-amplify/auth";
import { useUser } from "@/features/authorization";
import { checkUserProfileExists } from "@/features/authorization/utils/profile-checker";
import { toast } from "react-hot-toast";

interface RegisterFormData {
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export default function RegisterForm() {
  const navigate = useNavigate();
  const { signUp } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const { control, handleSubmit, watch } = useForm<RegisterFormData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    },
  });

  const password = watch("password");

  useEffect(() => {
    const pwd = password || "";
    let strength = 0;

    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;

    setPasswordStrength(strength);
  }, [password]);

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);

    try {
      // Step 1: Sign up with AWS Cognito (autoSignIn enabled)
      const signUpResult = await signUp({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        displayName: data.displayName,
      });

      if (!signUpResult.success) {
        setIsLoading(false);
        return;
      }

      const signUpData = signUpResult.data as {
        userId: string;
        isConfirmed: boolean;
        nextStep: string;
        userConfirmed: boolean;
      };

      // Step 2: Handle next step based on AWS Cognito response
      // Check userConfirmed flag first (recommended by senior)
      if (signUpData.userConfirmed === true) {
        // Email pre-confirmed - check if profile exists using RTK Query
        const profileResult = await checkUserProfileExists();

        if (profileResult.status === "found") {
          toast.success("Account created! Redirecting to dashboard...");
          navigate("/dashboard");
        } else if (profileResult.status === "not_found") {
          toast.success("Account created! Complete your profile...");
          navigate("/onboarding");
        } else {
          toast.error("Failed to verify profile. Please try again.");
        }
        return;
      }

      if (signUpData.nextStep === "CONFIRM_SIGN_UP") {
        // Email confirmation required
        // User is NOT logged in yet, but tokens are saved in localStorage
        navigate("/confirm-email", {
          state: { email: data.email },
        });
      } else if (signUpData.nextStep === "COMPLETE_AUTO_SIGN_IN") {
        toast.success("Completing sign-in...");

        // Check profile after auto sign-in
        const profileResult = await checkUserProfileExists();
        if (profileResult.status === "found") {
          navigate("/dashboard");
        } else if (profileResult.status === "not_found") {
          navigate("/onboarding");
        } else {
          toast.error("Failed to verify profile. Please try again.");
        }
      } else if (signUpData.isConfirmed) {
        // Fallback: email confirmed via isConfirmed flag
        const profileResult = await checkUserProfileExists();
        if (profileResult.status === "found") {
          navigate("/dashboard");
        } else if (profileResult.status === "not_found") {
          navigate("/onboarding");
        } else {
          toast.error("Failed to verify profile. Please try again.");
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    try {
      await signInWithRedirect({
        provider: "Google",
      });
    } catch {
      setIsGoogleLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return "bg-destructive";
    if (passwordStrength <= 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return "Weak";
    if (passwordStrength <= 3) return "Medium";
    return "Strong";
  };

  return (
    <div className="space-y-5">
      {/* Google Sign Up Button */}
      <GoogleButton
        onClick={handleGoogleSignUp}
        disabled={isLoading || isGoogleLoading}
        isLoading={isGoogleLoading}
        text="Sign up with Google"
      />

      {/* Divider */}
      <FormDivider text="Or sign up with email" />

      {/* Registration Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            name="firstName"
            label="First name"
            type="text"
            placeholder="John"
            control={control}
            rules={{
              required: "First name is required",
              minLength: {
                value: 2,
                message: "Name must be at least 2 characters",
              },
            }}
          />
          <FormInput
            name="lastName"
            label="Last name"
            type="text"
            placeholder="Doe"
            control={control}
            rules={{
              required: "Last name is required",
              minLength: {
                value: 2,
                message: "Name must be at least 2 characters",
              },
            }}
          />
        </div>

        {/* Display Name */}
        <div>
          <FormInput
            name="displayName"
            label="Display name"
            type="text"
            placeholder="How you want to be called"
            control={control}
            rules={{
              required: "Display name is required",
              minLength: {
                value: 2,
                message: "Display name must be at least 2 characters",
              },
            }}
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            This is the name that will be visible to other users
          </p>
        </div>

        <FormInput
          name="email"
          label="Email"
          type="email"
          placeholder="your.email@example.com"
          control={control}
          rules={{
            required: "Email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address",
            },
          }}
        />

        <FormPasswordInput
          name="password"
          label="Password"
          placeholder="Create a strong password"
          control={control}
          rules={{
            required: "Password is required",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters",
            },
            pattern: {
              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
              message: "Password must contain uppercase, lowercase, and number",
            },
          }}
        />

        {/* Password Strength Indicator */}
        {password && (
          <div className="-mt-3">
            <div className="flex gap-1 mb-1.5">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    i < passwordStrength
                      ? getPasswordStrengthColor()
                      : "bg-border"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Password strength:{" "}
              <span className="font-medium text-foreground">
                {getPasswordStrengthText()}
              </span>
            </p>
          </div>
        )}

        <FormPasswordInput
          name="confirmPassword"
          label="Confirm Password"
          placeholder="Re-enter your password"
          control={control}
          rules={{
            required: "Please confirm your password",
            validate: (value) => value === password || "Passwords do not match",
          }}
        />

        <label className="flex items-start gap-2.5 cursor-pointer group">
          <input
            type="checkbox"
            className="w-4 h-4 mt-0.5 rounded border-border bg-background text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-all cursor-pointer"
            {...control.register("agreeToTerms", {
              required: "You must agree to the terms and conditions",
            })}
          />
          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
            I agree to the{" "}
            <Link
              to="/terms"
              className="text-primary hover:text-primary/80 transition-colors font-medium"
              target="_blank"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              to="/privacy"
              className="text-primary hover:text-primary/80 transition-colors font-medium"
              target="_blank"
            >
              Privacy Policy
            </Link>
          </span>
        </label>

        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <LoadingSpinner text="Creating account..." />
          ) : (
            "Create Account"
          )}
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-primary hover:text-primary/80 transition-colors font-medium"
          >
            Sign in
          </Link>
        </div>
      </form>
    </div>
  );
}
