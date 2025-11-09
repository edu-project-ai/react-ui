import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { FormInput, FormPasswordInput } from "@/components/form";
import { Button, LoadingSpinner } from "@/components/ui";
import { GoogleButton, FormDivider } from "@/components/shared";
import { signInWithRedirect } from "aws-amplify/auth";
import { useUser } from "@/features/authorization";

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginForm() {
  const navigate = useNavigate();
  const { signIn, hasProfile } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const { control, handleSubmit } = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      const result = await signIn({
        email: data.email,
        password: data.password,
      });

      if (!result.success) {
        if (result.needsConfirmation) {
          navigate("/confirm-email", {
            state: { email: data.email },
          });
        }
        return;
      }

      // Check if user has completed profile using hook (service -> slice -> hook)
      const profileCheck = await hasProfile();

      navigate(
        profileCheck.hasProfile ? "/dashboard" : "/onboarding/profile-photo"
      );
    } catch (error: unknown) {
      console.error("Unexpected login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signInWithRedirect({
        provider: "Google",
      });
    } catch {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Google Sign In Button */}
      <GoogleButton
        onClick={handleGoogleSignIn}
        disabled={isLoading || isGoogleLoading}
        isLoading={isGoogleLoading}
      />

      {/* Divider */}
      <FormDivider />

      {/* Email/Password Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
          placeholder="Enter your password"
          control={control}
          rules={{
            required: "Password is required",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters",
            },
          }}
        />

        <div className="flex items-center justify-end">
          <Link
            to="/forgot-password"
            className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? <LoadingSpinner text="Signing in..." /> : "Sign In"}
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-primary hover:text-primary/80 transition-colors font-medium"
          >
            Create one now
          </Link>
        </div>
      </form>
    </div>
  );
}
