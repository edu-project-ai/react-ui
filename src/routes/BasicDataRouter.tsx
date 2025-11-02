import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import Root from "../components/Root";
import { PublicLayout, NotFound } from "../components/layout";
import {
  HomePage,
  AboutPage,
  ContactPage,
  FeaturesInfoPage,
  LoginPage,
  RegisterPage,
  DashboardPage,
  CallbackPage,
  EmailConfirmationPage,
  ProfilePhotoPage,
  SkillLevelPage,
  TechnologiesPage,
} from "@/features";

const BasicDataRouter = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" Component={Root}>
        <Route path="/" Component={PublicLayout}>
          <Route path="/" Component={HomePage} />
          <Route path="/about" Component={AboutPage} />
          <Route path="/features" Component={FeaturesInfoPage} />
          <Route path="/contact" Component={ContactPage} />
        </Route>
        <Route path="/login" Component={LoginPage} />
        <Route path="/register" Component={RegisterPage} />
        <Route path="/confirm-email" Component={EmailConfirmationPage} />
        <Route path="/auth/callback" Component={CallbackPage} />

        {/* Onboarding flow */}
        <Route path="/onboarding/profile-photo" Component={ProfilePhotoPage} />
        <Route path="/onboarding/skill-level" Component={SkillLevelPage} />
        <Route path="/onboarding/technologies" Component={TechnologiesPage} />

        <Route path="/dashboard" Component={DashboardPage} />
        <Route path="*" Component={NotFound} />
      </Route>
    )
  );

  return <RouterProvider router={router} />;
};

export default BasicDataRouter;
