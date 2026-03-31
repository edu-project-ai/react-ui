import React from "react";
import { AuthLayout } from "@/features/authorization";
import LoginForm from "../components/LoginForm";

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
