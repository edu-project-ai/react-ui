import type { FC, ReactNode } from "react";
import { Outlet } from "react-router-dom";

interface AuthRedirectorProps {
  children: ReactNode;
}

const AuthRedirector: FC<AuthRedirectorProps> = ({ children }) => {
  // Authentication logic will be implemented here
  return children;
};

const Root = () => {
  return (
    <AuthRedirector>
      <Outlet />
    </AuthRedirector>
  );
};

export default Root;
