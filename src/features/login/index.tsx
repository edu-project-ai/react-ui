import React from "react";
import { AuthLayout } from "@/components/features/auth";
import { LoginForm } from "./components";

export const LoginPage: React.FC = () => {
  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to continue your learning journey"
    >
      <LoginForm />
    </AuthLayout>
  );
};

export default LoginPage;
