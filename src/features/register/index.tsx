import React from "react";
import { AuthLayout } from "@/components/features/auth";
import { RegisterForm } from "./components";

export const RegisterPage: React.FC = () => {
  return (
    <AuthLayout
      title="Create Your Account"
      subtitle="Start your personalized programming journey today"
    >
      <RegisterForm />
    </AuthLayout>
  );
};

export default RegisterPage;
