import React from "react";
import { AuthLayout } from "@/features/authorization";
import RegisterForm from "./components/RegisterForm";

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
